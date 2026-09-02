'use client'

import { useEffect, useState } from 'react'
import { Meeting } from '@/types'
import Link from 'next/link'
import { avatarColorHex } from '@/lib/avatarUtils'
import { personaAvatarSvg } from '@/lib/personaAvatar'

// ── Status registry ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  idle:      { label: 'Pending',   color: '#7c6af7', bg: 'rgba(124,106,247,0.08)' },
  running:   { label: 'Live',      color: '#059669', bg: 'rgba(5,150,105,0.1)'    },
  completed: { label: 'Concluded', color: '#a49cb8', bg: 'rgba(164,156,184,0.12)' },
  error:     { label: 'Aborted',   color: '#c0392b', bg: 'rgba(192,57,43,0.08)'  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Cast ───────────────────────────────────────────────────────────────────────

const CAST = [
  { initials: 'SC', name: 'Sarah Chen',     role: 'CTO',           bias: 'Move fast, defend market share',   id: 'demo-sc' },
  { initials: 'MW', name: 'Marcus Webb',    role: 'VP Operations', bias: 'Question every assumption',        id: 'demo-mw' },
  { initials: 'PN', name: 'Dr. Priya Nair', role: 'Head of Data',  bias: 'Evidence first, headlines second', id: 'demo-pn' },
  { initials: 'JO', name: 'James Okafor',  role: 'CFO',           bias: 'Fiscal discipline above all',      id: 'demo-jo' },
]

// ── Demo turns ─────────────────────────────────────────────────────────────────

const DEMO_TURNS = [
  {
    id: 'demo-sc', initials: 'SC', name: 'Sarah Chen', role: 'CTO',
    color: avatarColorHex('demo-sc'),
    content: 'The competitive data is clear — our top two rivals are already deploying this. Wait another quarter and we\'re playing catch-up from behind.',
  },
  {
    id: 'demo-mw', initials: 'MW', name: 'Marcus Webb', role: 'VP Operations',
    color: avatarColorHex('demo-mw'),
    content: 'I\'ve heard "competitive necessity" three times in five years. Two of those cost more to unwind than to skip. What is the actual rollback plan?',
  },
  {
    id: 'demo-pn', initials: 'PN', name: 'Dr. Priya Nair', role: 'Head of Data',
    color: avatarColorHex('demo-pn'),
    content: 'Marcus is right. The pilot showed a 4-point improvement — real, but below the vendor\'s claimed range. Before we commit $2M I need to know if that gap is a data ceiling or a quality issue.',
  },
]

// ── Session preview (revealed under the band) ─────────────────────────────────

function SessionPreview() {
  const thinkColor = avatarColorHex('demo-jo')
  return (
    <div className="sleeve-session-preview">
      {/* Header */}
      <div className="sleeve-session-header">
        <div className="sleeve-session-topic">
          Should we invest $2M in AI tooling for our field workforce?
        </div>
        <div className="flex items-center gap-2">
          <span className="sleeve-live-dot" />
          <span className="sleeve-session-meta">Turn 3 / 12</span>
        </div>
      </div>

      {/* Turns */}
      <div className="sleeve-turns">
        {DEMO_TURNS.map((t) => (
            <div key={t.initials} className="sleeve-turn">
              <div className="sleeve-turn-avatar" style={{ background: `${t.color}18`, borderColor: `${t.color}50` }}>
                <img src={personaAvatarSvg(t.id, t.name)} alt={t.name} width={20} height={20} style={{ display: 'block' }} />
              </div>
            <div className="flex-1 min-w-0">
              <div className="sleeve-turn-header">
                <span className="sleeve-turn-name">{t.name}</span>
                <span className="sleeve-turn-role" style={{ color: t.color }}>{t.role}</span>
              </div>
              {/* impeccable-disable-next-line side-tab */}
              <div className="sleeve-turn-content" style={{ borderLeftColor: t.color }}>
                {t.content}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking */}
        <div className="sleeve-turn">
          <div className="sleeve-turn-avatar sleeve-thinking-avatar" style={{ background: `${thinkColor}12`, borderColor: `${thinkColor}40` }}>
            <img src={personaAvatarSvg('demo-jo', 'James Okafor')} alt="James Okafor" width={20} height={20} style={{ display: 'block' }} />
          </div>
          <div className="flex-1">
            <div className="sleeve-turn-header">
              <span className="sleeve-turn-name">James Okafor</span>
              <span className="sleeve-session-meta" style={{ fontStyle: 'italic' }}>deliberating…</span>
            </div>
            <div className="sleeve-turn-content" style={{ borderLeftColor: `${thinkColor}50` }}>
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="thinking-dot" style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block', background: thinkColor, animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const [bandOpen, setBandOpen] = useState(false)

  return (
    <section className="sleeve-hero">
      {/* Face — sparse, the title owns all the space */}
      <div className={`sleeve-face ${bandOpen ? 'band-open' : ''}`}>
        {/* Eyebrow */}
        <div className="sleeve-eyebrow">
          Multi-voice AI deliberation
        </div>

        {/* Title — enormous, alone */}
        <h1 className="sleeve-title text-balance">
          Run the meeting<br />
          <em>before</em> the meeting.
        </h1>

        {/* CTA row — sits just above the band */}
        <div className="sleeve-face-cta">
          <Link href="/meetings/new" className="sleeve-cta-primary">
                Run it through Crucible
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/personas" className="sleeve-cta-ghost">
            Manage voices
          </Link>
        </div>
      </div>

      {/* Obi band — dense, crowded, wraps the lower portion */}
      <div className={`sleeve-band ${bandOpen ? 'band-lifted' : ''}`}>
        <div className="sleeve-band-inner">
          {/* Left: cast credits — dense columns */}
          <div className="sleeve-band-cast">
            <div className="sleeve-band-label">Commissioned voices</div>
            <div className="sleeve-cast-grid">
              {CAST.map((p) => {
                const color = avatarColorHex(p.id)
                return (
                  <div key={p.id} className="sleeve-cast-entry">
                    <div className="sleeve-cast-avatar" style={{ background: `${color}25`, borderColor: color }}>
                      <img src={personaAvatarSvg(p.id, p.name)} alt={p.name} width={16} height={16} style={{ display: 'block' }} />
                    </div>
                    <div className="sleeve-cast-text">
                      <span className="sleeve-cast-name">{p.name}</span>
                      <span className="sleeve-cast-role">{p.role}</span>
                      <span className="sleeve-cast-bias">{p.bias}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="sleeve-band-divider" />

          {/* Right: product specs + reveal trigger */}
          <div className="sleeve-band-meta">
            <div className="sleeve-band-label">Session format</div>
            <div className="sleeve-band-specs">
              <span>— Structured turns, open interjection</span>
              <span>— Each voice stays in character</span>
              <span>— Live streaming · structured report</span>
              <span>— PDF, DOCX, image attachments</span>
            </div>

            {/* Reveal toggle */}
            <button
              className="sleeve-reveal-btn"
              onClick={() => setBandOpen((v) => !v)}
              aria-label={bandOpen ? 'Hide session preview' : 'Show session preview'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12, transform: bandOpen ? 'rotate(180deg)' : 'none', transition: 'transform 400ms' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              {bandOpen ? 'Hide session' : 'See a session'}
            </button>
          </div>
        </div>

        {/* Session preview — lives below the band content, revealed on open */}
        <div className={`sleeve-preview-well ${bandOpen ? 'preview-open' : ''}`}>
          <SessionPreview />
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '1',
    title: 'Commission the council',
    body: 'Create personas with names, roles, and declared biases. The more exacting the character, the sharper the dissent.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    n: '2',
    title: 'Set the motion',
    body: 'State the question. Attach documents. Each voice reads the full brief before the session convenes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    n: '3',
    title: 'Receive the record',
    body: 'The table debates in turns. A structured report follows: decisions, action items, open questions, every dissent.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
]

// ── Audience ──────────────────────────────────────────────────────────────────

const AUDIENCES = [
  {
    label: 'Product & Strategy',
    quote: '"Hear the CFO\'s objection before you\'re in the room with one."',
    body: 'Stress-test the decision before sprint planning. Surface the risks your team won\'t say out loud.',
  },
  {
    label: 'Consultants & Advisors',
    quote: '"Find the weak spots in your recommendation before the client does."',
    body: 'Run your proposal through the client\'s stakeholder cast. Arrive knowing every counter-argument.',
  },
  {
    label: 'Leaders & Decision-Makers',
    quote: '"A pre-mortem you can run in ten minutes."',
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
    <div className="sleeve-page">

      <Hero />

      {/* ── Pull quote ── */}
      <section className="sleeve-section sleeve-quote-section">
        <blockquote className="sleeve-quote">
          <p>
            &ldquo;It&rsquo;s like running a meeting with everyone&rsquo;s devil&rsquo;s advocate
            <em> before</em> you run the real meeting.&rdquo;
          </p>
        </blockquote>
      </section>

      {/* ── How it works ── */}
      <section className="sleeve-section">
        <div className="sleeve-section-head">
          <span className="sleeve-section-label">How it works</span>
        </div>
        <div className="sleeve-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="sleeve-step">
              <div className="sleeve-step-number">{s.n}</div>
              <div className="sleeve-step-icon">{s.icon}</div>
              <h3 className="sleeve-step-title">{s.title}</h3>
              <p className="sleeve-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="sleeve-section">
        <div className="sleeve-section-head">
          <span className="sleeve-section-label">Who it&rsquo;s for</span>
        </div>
        <div className="sleeve-audience">
          {AUDIENCES.map((a) => (
            <div key={a.label} className="sleeve-audience-item">
              <div className="sleeve-audience-label">{a.label}</div>
              <p className="sleeve-audience-quote">{a.quote}</p>
              <p className="sleeve-audience-body">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent sessions ── */}
      <section className="sleeve-section">
        <div className="sleeve-section-head">
          <span className="sleeve-section-label">Recent sessions</span>
          <Link href="/meetings/new" className="sleeve-section-action">
            + New session
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
      </section>

      {/* ── Footer ── */}
      <div className="sleeve-footer">
        <span>Crucible · Local deliberation system</span>
        <span>All voices synthetic · All arguments structured</span>
      </div>

    </div>
  )
}
