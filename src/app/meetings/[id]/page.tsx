'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Meeting, Persona, Turn } from '@/types'
import { useMeetingStore } from '@/store/meetingStore'
import DiscussionFeed from '@/components/DiscussionFeed'
import AttachmentsPanel from '@/components/AttachmentsPanel'
import SteerPanel from '@/components/SteerPanel'
import Link from 'next/link'

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loadError, setLoadError] = useState('')
  const [runError, setRunError] = useState('')
  const [rerunConfirm, setRerunConfirm] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Steer panel state
  const [steerDraft, setSteerDraft] = useState('')
  const [isPausing, setIsPausing] = useState(false)

  // IntersectionObserver: floating pause pill
  const [controlsVisible, setControlsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  const {
    turns,
    streamingTurns,
    status,
    steer,
    setStatus,
    setSteer,
    setTurns,
    isGeneratingReport,
    setGeneratingReport,
    startStreamingTurn,
    appendToken,
    commitTurn,
    reset,
  } = useMeetingStore()

  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]))

  // -------------------------------------------------------------------------
  // IntersectionObserver for the floating Pause pill.
  // Using a callback ref so the observer attaches as soon as the controls row
  // mounts (which only happens after the meeting has loaded).
  // -------------------------------------------------------------------------
  const obsRef = useRef<IntersectionObserver | null>(null)
  const controlsRowRef = useCallback((el: HTMLDivElement | null) => {
    obsRef.current?.disconnect()
    if (!el) return
    setMounted(true)
    obsRef.current = new IntersectionObserver(
      ([entry]) => setControlsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    )
    obsRef.current.observe(el)
  }, [])

  const showFloatingPill = mounted && status === 'running' && !controlsVisible

  // -------------------------------------------------------------------------
  // Core: start / resume discussion (accepts optional steer directive)
  // -------------------------------------------------------------------------
  const startDiscussion = useCallback(async (directive?: string) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setRunError('')
    setStatus('running')

    try {
      const body = directive ? JSON.stringify({ directive }) : undefined
      const res = await fetch(`/api/meetings/${id}/run`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        const raw = await res.text().catch(() => `HTTP ${res.status}`)
        let msg = raw
        try { msg = JSON.parse(raw).error ?? raw } catch {}
        setRunError(msg)
        setStatus('error')
        return
      }

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))

          if (data.type === 'turn_start') {
            startStreamingTurn(data.id, data.personaId, data.kind)
          } else if (data.type === 'token') {
            appendToken(data.id, data.token)
          } else if (data.type === 'turn') {
            commitTurn(data.turn as Turn)
          } else if (data.type === 'steer') {
            setSteer(data.directive ? { directive: data.directive, turnsLeft: data.turnsLeft } : null)
          } else if (data.type === 'paused') {
            setIsPausing(false)
            setStatus('paused')
          } else if (data.type === 'done') {
            setStatus(data.status === 'completed' ? 'completed' : 'idle')
          } else if (data.type === 'error') {
            setRunError(data.message ?? 'Unknown error from AI')
            setStatus('error')
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setRunError(String(err))
      setStatus('error')
    }
  }, [id, startStreamingTurn, appendToken, commitTurn, setStatus, setSteer])

  // -------------------------------------------------------------------------
  // Pause / Resume / Stop
  // -------------------------------------------------------------------------
  async function handlePause() {
    setIsPausing(true)
    await fetch(`/api/meetings/${id}/pause`, { method: 'POST' })
  }

  function handleResume(directive?: string) {
    setIsPausing(false)
    setSteerDraft('')
    startDiscussion(directive)
  }

  async function handleStop() {
    abortRef.current?.abort()
    await fetch(`/api/meetings/${id}/stop`, { method: 'POST' })
    setStatus('idle')
  }

  // -------------------------------------------------------------------------
  // Load meeting + personas
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const [meetingRes, personasRes] = await Promise.all([
          fetch(`/api/meetings/${id}`),
          fetch('/api/personas'),
        ])
        if (!meetingRes.ok) throw new Error('Meeting not found')
        const m: Meeting = await meetingRes.json()
        const ps: Persona[] = await personasRes.json()
        setMeeting(m)
        setPersonas(ps)

        if (m.currentTurn > 0) {
          const turnsRes = await fetch(`/api/meetings/${id}/turns`)
          if (turnsRes.ok) {
            const storedTurns: Turn[] = await turnsRes.json()
            setTurns(storedTurns)
          }
        }

        if (m.status === 'completed' || m.status === 'error') {
          setStatus(m.status)
        }
        if (m.status === 'paused') {
          setStatus('paused')
        }
      } catch (err) {
        setLoadError(String(err))
      }
    }
    reset()
    load()
    return () => { abortRef.current?.abort() }
  }, [id])

  // -------------------------------------------------------------------------
  // Rerun
  // -------------------------------------------------------------------------
  async function handleRerun() {
    const res = await fetch(`/api/meetings/${id}/turns`, { method: 'DELETE' })
    if (!res.ok) {
      setRunError('Failed to reset meeting')
      return
    }
    setRerunConfirm(false)
    setRunError('')
    reset()
    setMeeting((prev) => prev ? { ...prev, status: 'idle', currentTurn: 0 } : prev)
    startDiscussion()
  }

  // -------------------------------------------------------------------------
  // Report
  // -------------------------------------------------------------------------
  async function handleGenerateReport() {
    setGeneratingReport(true)
    try {
      const res = await fetch(`/api/meetings/${id}/report`, { method: 'POST' })
      if (res.ok) {
        router.push(`/meetings/${id}/report`)
      } else {
        const raw = await res.text().catch(() => '')
        let msg = raw
        try { msg = JSON.parse(raw).error ?? raw } catch {}
        setRunError(msg || 'Failed to generate report')
      }
    } finally {
      setGeneratingReport(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loadError) return <div className="text-center py-20 text-red-400">{loadError}</div>
  if (!meeting) return <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Loading…</div>

  const participantPersonas = (meeting.personaIds || []).map((pid) => personaMap[pid]).filter(Boolean)
  const canStart = status === 'idle' || status === 'error' || !status

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm transition-colors hover:text-white mb-2 inline-block" style={{ color: 'var(--muted)' }}>
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">{meeting.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{meeting.topic}</p>
          </div>
          <StatusBadge status={status || meeting.status} />
        </div>

        {/* Participants */}
        <div className="flex flex-wrap gap-2 mt-4">
          {participantPersonas.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <span>{p.name}</span>
              <span style={{ color: 'var(--muted)' }}>· {p.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      <AttachmentsPanel meetingId={id} />

      {/* Error banner */}
      {runError && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          <strong>Error:</strong> {runError}
        </div>
      )}

      {/* Controls */}
      <div ref={controlsRowRef} className="space-y-3 mb-6">
        {/* Active steer badge */}
        {steer && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs border"
            style={{ background: '#7c3aed18', borderColor: '#7c3aed60', color: '#a78bfa' }}
          >
            <span className="font-semibold shrink-0">Steering ({steer.turnsLeft} left):</span>
            <span className="opacity-80 italic">{steer.directive}</span>
          </div>
        )}

        {/* Button row */}
        <div className="flex flex-wrap gap-3">
          {canStart && (
            <button
              onClick={() => startDiscussion()}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'var(--accent)' }}
            >
              {status === 'error' ? '↺ Retry Discussion' : '▶ Start Discussion'}
            </button>
          )}
          {status === 'running' && (
            <>
              <button
                onClick={handlePause}
                disabled={isPausing}
                className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60"
                style={{ borderColor: '#7c3aed80', color: '#a78bfa' }}
              >
                {isPausing ? '⏸ Pausing…' : '⏸ Pause'}
              </button>
              <button
                onClick={handleStop}
                className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-red-500 hover:text-red-400"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                ■ Stop
              </button>
            </>
          )}
          {status === 'paused' && (
            <button
              onClick={() => handleResume()}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              ▶ Resume without steer
            </button>
          )}
          {(status === 'completed' || (status === 'idle' && turns.length > 0)) && (
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#10b981' }}
            >
              {isGeneratingReport ? (
                <>
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating…
                </>
              ) : 'Generate Report →'}
            </button>
          )}
          {meeting.status === 'completed' && (
            <Link
              href={`/meetings/${id}/report`}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-purple-500"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              View Report
            </Link>
          )}
          {turns.length > 0 && status !== 'running' && status !== 'paused' && (
            <button
              onClick={() => setRerunConfirm(true)}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors ml-auto"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              ↺ Rerun
            </button>
          )}
        </div>
      </div>

      {/* Floating Pause pill — appears when the controls row scrolls out of view */}
      {showFloatingPill && createPortal(
        <button
          onClick={handlePause}
          disabled={isPausing}
          className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          style={{ background: '#7c3aed', color: '#fff', boxShadow: '0 4px 24px #7c3aed60' }}
          aria-label="Pause discussion"
        >
          {isPausing ? '⏸ Pausing…' : '⏸ Pause'}
        </button>,
        document.body
      )}

      {/* Rerun confirmation banner */}
      {rerunConfirm && (
        <div
          className="mb-6 px-4 py-3 rounded-lg border flex items-center justify-between gap-4 text-sm"
          style={{ borderColor: '#f59e0b80', background: '#f59e0b10' }}
        >
          <span style={{ color: 'var(--foreground)' }}>
            <span className="font-semibold" style={{ color: '#f59e0b' }}>This will delete all {turns.length} turns and the existing report.</span>
            {' '}A fresh discussion will start immediately.
          </span>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleRerun}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ background: '#f59e0b' }}
            >
              Yes, rerun
            </button>
            <button
              onClick={() => setRerunConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {(status === 'running' || status === 'paused' || turns.length > 0) && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
            <span>{turns.filter((t) => t.kind !== 'interjection').length} / {meeting.maxTurns} turns</span>
            {status === 'running' && <span className="animate-pulse">● Live</span>}
            {status === 'paused' && <span style={{ color: '#f59e0b' }}>⏸ Paused</span>}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((turns.filter((t) => t.kind !== 'interjection').length / meeting.maxTurns) * 100, 100)}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {/* Discussion feed */}
      {turns.length === 0 && status !== 'running' ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-4">💬</p>
          <p>Click &quot;Start Discussion&quot; to begin the roundtable.</p>
        </div>
      ) : (
        <DiscussionFeed turns={turns} streamingTurns={streamingTurns} personaMap={personaMap} />
      )}

      {/* Steer panel — slides in below the feed when paused */}
      <SteerPanel
        paused={status === 'paused'}
        draft={steerDraft}
        setDraft={setSteerDraft}
        onResume={handleResume}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    idle: { label: 'Ready', color: 'var(--muted)' },
    running: { label: 'Running', color: '#10b981' },
    paused: { label: 'Paused', color: '#f59e0b' },
    completed: { label: 'Completed', color: 'var(--accent)' },
    error: { label: 'Error', color: '#ef4444' },
  }
  const s = map[status] ?? map.idle
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full border flex-shrink-0"
      style={{ borderColor: s.color, color: s.color }}
    >
      {s.label}
    </span>
  )
}
