'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Meeting, Persona, Turn } from '@/types'
import { useMeetingStore } from '@/store/meetingStore'
import DiscussionFeed from '@/components/DiscussionFeed'
import AttachmentsPanel from '@/components/AttachmentsPanel'
import Link from 'next/link'

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [thinkingPersonaId, setThinkingPersonaId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [runError, setRunError] = useState('')
  const [rerunConfirm, setRerunConfirm] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const { turns, status, setStatus, addTurn, setTurns, isGeneratingReport, setGeneratingReport, reset } = useMeetingStore()

  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]))

  const startDiscussion = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setRunError('')
    setStatus('running')

    try {
      const res = await fetch(`/api/meetings/${id}/run`, {
        method: 'POST',
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => `HTTP ${res.status}`)
        let msg = body
        try { msg = JSON.parse(body).error ?? body } catch {}
        setRunError(msg)
        setStatus('error')
        return
      }

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += dec.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))

          if (data.type === 'turn') {
            setThinkingPersonaId(null)
            addTurn(data.turn as Turn)
          } else if (data.type === 'thinking') {
            setThinkingPersonaId(data.personaId)
          } else if (data.type === 'done') {
            setThinkingPersonaId(null)
            setStatus(data.status === 'completed' ? 'completed' : 'idle')
          } else if (data.type === 'error') {
            setThinkingPersonaId(null)
            setRunError(data.message ?? 'Unknown error from AI')
            setStatus('error')
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setRunError(String(err))
      setStatus('error')
    } finally {
      setThinkingPersonaId(null)
    }
  }, [id, addTurn, setStatus])

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
      } catch (err) {
        setLoadError(String(err))
      }
    }
    reset()
    load()
    return () => { abortRef.current?.abort() }
  }, [id])

  async function handleStop() {
    abortRef.current?.abort()
    await fetch(`/api/meetings/${id}/stop`, { method: 'POST' })
    setStatus('idle')
    setThinkingPersonaId(null)
  }

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

  async function handleGenerateReport() {
    setGeneratingReport(true)
    try {
      const res = await fetch(`/api/meetings/${id}/report`, { method: 'POST' })
      if (res.ok) {
        router.push(`/meetings/${id}/report`)
      } else {
        const body = await res.text().catch(() => '')
        let msg = body
        try { msg = JSON.parse(body).error ?? body } catch {}
        setRunError(msg || 'Failed to generate report')
      }
    } finally {
      setGeneratingReport(false)
    }
  }

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
      <div className="flex flex-wrap gap-3 mb-6">
        {canStart && (
          <button
            onClick={startDiscussion}
            className="px-5 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'var(--accent)' }}
          >
            {status === 'error' ? '↺ Retry Discussion' : '▶ Start Discussion'}
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={handleStop}
            className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-red-500 hover:text-red-400"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ■ Stop
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
        {turns.length > 0 && status !== 'running' && (
          <button
            onClick={() => setRerunConfirm(true)}
            className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors ml-auto"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ↺ Rerun
          </button>
        )}
      </div>

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
      {(status === 'running' || turns.length > 0) && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
            <span>{turns.length} / {meeting.maxTurns} turns</span>
            {status === 'running' && <span className="animate-pulse">● Live</span>}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(turns.length / meeting.maxTurns) * 100}%`, background: 'var(--accent)' }}
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
        <DiscussionFeed turns={turns} personaMap={personaMap} thinkingPersonaId={thinkingPersonaId} />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    idle: { label: 'Ready', color: 'var(--muted)' },
    running: { label: 'Running', color: '#10b981' },
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
