'use client'

import { useEffect, useState } from 'react'
import { Meeting } from '@/types'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  idle:      { label: 'Ready',     color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  running:   { label: 'Running',   color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  completed: { label: 'Completed', color: '#7c6af7', bg: 'rgba(124,106,247,0.1)' },
  error:     { label: 'Error',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Static discussion preview shown in the hero ───────────────────────────────

const DEMO_TURNS = [
  {
    initials: 'SC', name: 'Sarah Chen', role: 'CTO',
    color: '#9333ea',
    content: 'The competitive data is clear — our top two rivals are already rolling this out. If we wait another quarter, we\'re playing catch-up.',
  },
  {
    initials: 'MW', name: 'Marcus Webb', role: 'VP Operations',
    color: '#2563eb',
    content: 'I\'ve heard "competitive necessity" three times in five years. Two of those cost more to unwind than to skip. What\'s the actual rollback plan here?',
  },
  {
    initials: 'PN', name: 'Dr. Priya Nair', role: 'Head of Data Science',
    color: '#059669',
    content: 'Marcus is right to push on that. The pilot showed a 4-point improvement — real, but below the vendor\'s claimed range. Before we commit $2M I need to know if that gap is a data ceiling or a quality issue.',
  },
]

function HeroPreview() {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-2xl"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(239,68,68,0.5)' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(245,158,11,0.5)' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(16,185,129,0.5)' }} />
        <span className="ml-3 text-xs truncate" style={{ color: 'var(--muted)' }}>
          Should we invest $2M in AI tooling for our field workforce?
        </span>
      </div>

      {/* Turns */}
      <div className="p-5 space-y-4">
        {DEMO_TURNS.map((s) => (
          <div key={s.initials} className="flex gap-3">
            <div className="flex-shrink-0 rounded-full p-0.5" style={{ background: `${s.color}30` }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: s.color }}
              >
                {s.initials}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white">{s.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.role}
                </span>
              </div>
              <div
                className="rounded-xl rounded-tl-none px-3 py-2.5 text-xs leading-relaxed border-l-2"
                style={{ background: 'var(--surface-2)', color: 'var(--foreground)', borderLeftColor: s.color }}
              >
                {s.content}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 rounded-full p-0.5 animate-pulse" style={{ background: '#d9770625' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#d97706' }}>
              JO
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-white">James Okafor</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>thinking…</span>
            </div>
            <div
              className="rounded-xl rounded-tl-none px-3 py-2.5 border-l-2"
              style={{ background: 'var(--surface-2)', borderLeftColor: '#d97706' }}
            >
              <div className="flex gap-1 items-center h-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#d97706', animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Build your cast',
    body: 'Create personas with names, roles, backgrounds, and communication styles. The more specific the character, the sharper the debate.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Set the agenda',
    body: 'Define the topic, add context, attach documents. Every persona reads the briefing before anyone speaks.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Run the table',
    body: 'Personas debate in turns, each staying in character. Stop when you want. Get a structured report: decisions, action items, open questions, and dissents.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
]

// ── Who it's for ──────────────────────────────────────────────────────────────

const AUDIENCES = [
  {
    label: 'Product & strategy teams',
    color: '#7c6af7',
    quote: '"Hear the CFO\'s objection before you\'re in the room with one."',
    body: 'Stress-test a feature decision before sprint planning. Surface the risks your team won\'t say out loud.',
  },
  {
    label: 'Consultants & advisors',
    color: '#10b981',
    quote: '"Find the weak spots in your recommendation before the client does."',
    body: 'Run your proposal through the client\'s cast of stakeholders. Arrive knowing every counter-argument.',
  },
  {
    label: 'Leaders & decision-makers',
    color: '#f59e0b',
    quote: '"A pre-mortem you can run in 10 minutes."',
    body: 'Design the room of critics you wish you had time to consult. Walk in prepared, not surprised.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
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

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,106,247,0.12), transparent)' }}
        />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-6"
              style={{ borderColor: 'rgba(124,106,247,0.4)', color: 'var(--accent)', background: 'rgba(124,106,247,0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              AI-powered decision facilitation
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 text-balance">
              Run the meeting<br />
              <span style={{ color: 'var(--accent)' }}>before the meeting.</span>
            </h1>

            <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: 'var(--muted)' }}>
              Design a cast of AI stakeholders, set the agenda, and watch them debate your hardest decisions —
              then walk into the real meeting already knowing every objection.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/meetings/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium text-sm transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
                style={{ background: 'var(--accent)' }}
              >
                Start a roundtable
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link
                href="/personas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm border transition-[border-color,transform] hover:border-purple-500 active:scale-[0.96]"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Manage personas
              </Link>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="lg:block">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ── One-liner ── */}
      <section className="py-14 border-t" style={{ borderColor: 'var(--border)' }}>
        <blockquote className="text-center max-w-2xl mx-auto">
          <p className="text-xl lg:text-2xl font-medium leading-snug text-white">
            &ldquo;It&apos;s like running a meeting with everyone&apos;s devil&apos;s advocate
            <span style={{ color: 'var(--accent)' }}> before</span> you run the real meeting.&rdquo;
          </p>
        </blockquote>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-10 text-center" style={{ color: 'var(--muted)' }}>
          How it works
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border p-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,106,247,0.12)', color: 'var(--accent)' }}
                >
                  {s.icon}
                </div>
                <span className="text-2xl font-bold tabular-nums" style={{ color: 'rgba(124,106,247,0.2)' }}>
                  {s.n}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-10 text-center" style={{ color: 'var(--muted)' }}>
          Who it&apos;s for
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {AUDIENCES.map((a) => (
            <div
              key={a.label}
              className="rounded-xl border p-6 border-l-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: a.color }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: a.color }}
              >
                {a.label}
              </p>
              <p className="text-sm font-medium text-white mb-3 leading-snug italic">
                {a.quote}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent meetings ── */}
      <section className="py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Meetings</h2>
          <Link
            href="/meetings/new"
            className="text-xs px-3 py-1.5 rounded-lg border transition-[border-color,transform] hover:border-purple-500 active:scale-[0.96]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            + New meeting
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : meetings.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl border"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            <p className="text-3xl mb-3">⚔️</p>
            <p className="font-medium text-white mb-1">No roundtables yet</p>
            <p className="text-sm mb-5">Start your first meeting to see it here.</p>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
              style={{ background: 'var(--accent)' }}
            >
              Start a roundtable →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => {
              const s = STATUS_MAP[m.status] ?? STATUS_MAP.idle
              const pct = m.maxTurns > 0 ? Math.round((m.currentTurn / m.maxTurns) * 100) : 0
              return (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border transition-[border-color,transform] hover:border-purple-500/50 active:scale-[0.99]"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{m.title}</p>
                    <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{m.topic}</p>
                  </div>

                  {/* Progress bar */}
                  {m.currentTurn > 0 && (
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0 w-24">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: s.color }}
                        />
                      </div>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                        {m.currentTurn}/{m.maxTurns}
                      </span>
                    </div>
                  )}

                  <span className="text-xs flex-shrink-0 hidden md:block" style={{ color: 'var(--muted)' }}>
                    {formatDate(m.createdAt)}
                  </span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: s.color, background: s.bg }}
                  >
                    {s.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
