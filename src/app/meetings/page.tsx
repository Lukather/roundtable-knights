'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Meeting } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  idle:      { label: 'Pending',   color: '#7c6af7', bg: 'rgba(124,106,247,0.08)' },
  running:   { label: 'Live',      color: '#059669', bg: 'rgba(5,150,105,0.1)'    },
  completed: { label: 'Concluded', color: '#a49cb8', bg: 'rgba(164,156,184,0.12)' },
  error:     { label: 'Aborted',   color: '#c0392b', bg: 'rgba(192,57,43,0.08)'  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/meetings')
      .then((r) => r.json())
      .then(setMeetings)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Sessions</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>All recorded sessions.</p>
        </div>
        <Link
          href="/meetings/new"
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
          style={{ background: 'var(--accent)' }}
        >
          New Meeting
        </Link>
      </div>

      {loading ? (
        <div className="sleeve-loading">Retrieving records…</div>
      ) : meetings.length === 0 ? (
        <div className="sleeve-empty">
          <div className="sleeve-empty-icon">🔥</div>
          <p className="sleeve-empty-title">No sessions on record</p>
          <p className="sleeve-empty-body">Run your first question through Crucible to open the archive.</p>
          <Link href="/meetings/new" className="sleeve-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
            Run a session →
          </Link>
        </div>
      ) : (
        <div className="sleeve-sessions">
          {meetings.map((m) => {
            const s = STATUS_MAP[m.status] ?? STATUS_MAP.idle
            const pct = m.maxTurns > 0 ? Math.round((m.currentTurn / m.maxTurns) * 100) : 0
            return (
              <Link key={m.id} href={`/meetings/${m.id}`} className="sleeve-session-row">
                <div className="min-w-0 flex-1">
                  <p className="sleeve-session-title">{m.title}</p>
                  <p className="sleeve-session-topic">{m.topic}</p>
                </div>

                {m.currentTurn > 0 && (
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0" style={{ width: 80 }}>
                    <div className="sleeve-progress-track">
                      <div className="sleeve-progress-fill" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="sleeve-progress-label">{m.currentTurn}/{m.maxTurns}</span>
                  </div>
                )}

                <span className="hidden md:block sleeve-session-date">{formatDate(m.createdAt)}</span>
                <span className="sleeve-status-chip" style={{ color: s.color, background: s.bg }}>{s.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
