'use client'

import { useState, useEffect, useCallback } from 'react'
import { Persona, Attachment } from '@/types'
import { useRouter } from 'next/navigation'
import AttachmentUploader from './AttachmentUploader'
import { v4 as uuidv4 } from 'uuid'
import { getInitials, avatarColor, avatarColorHex } from '@/lib/avatarUtils'

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'The Question' },
  { id: 2, label: 'The Cast' },
  { id: 3, label: 'The Stage' },
  { id: 4, label: 'Launch' },
] as const

type StepId = (typeof STEPS)[number]['id']

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepProgress({ current }: { current: StepId }) {
  return (
    <div className="relative flex items-start justify-between mb-10" aria-label="Setup progress">
      {/* connecting line */}
      <div
        className="absolute top-4 left-0 right-0 h-px"
        style={{ background: 'var(--border)' }}
        aria-hidden
      />
      {/* progress fill */}
      <div
        className="absolute top-4 left-0 h-px transition-all duration-500 ease-out"
        style={{
          background: 'var(--accent)',
          width: `${((current - 1) / (STEPS.length - 1)) * 100}%`,
        }}
        aria-hidden
      />
      {STEPS.map((step) => {
        const done = step.id < current
        const active = step.id === current
        return (
          <div key={step.id} className="relative flex flex-col items-center gap-2 z-10">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
              style={{
                background: done
                  ? 'var(--accent)'
                  : active
                  ? 'var(--accent)'
                  : 'var(--surface-2)',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: done || active ? 'var(--accent)' : 'var(--border)',
                color: done || active ? '#fff' : 'var(--muted)',
                boxShadow: active ? '0 0 0 4px rgba(124,106,247,0.15)' : 'none',
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: active ? 'var(--foreground)' : done ? 'var(--accent)' : 'var(--muted)' }}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PersonaAvatar({
  persona,
  size = 40,
  ring = false,
}: {
  persona: Persona
  size?: number
  ring?: boolean
}) {
  const color = avatarColorHex(persona.id)
  return (
    <div
      className="relative flex-shrink-0 rounded-full flex items-center justify-center font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        boxShadow: ring ? `0 0 0 2px ${color}` : undefined,
      }}
    >
      <div
        className={`w-full h-full rounded-full flex items-center justify-center ${avatarColor(persona.id)}`}
        style={{ color: '#fff' }}
      >
        {getInitials(persona.name)}
      </div>
      {ring && (
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 3px ${color}40` }}
          aria-hidden
        />
      )}
    </div>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────

export default function MeetingSetupForm() {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(1)
  const [animKey, setAnimKey] = useState(0)

  const [personas, setPersonas] = useState<Persona[]>([])
  const [loadingPersonas, setLoadingPersonas] = useState(true)

  const [form, setForm] = useState({ title: '', topic: '', context: '', maxTurns: 12 })
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [tempMeetingId] = useState(() => uuidv4())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/personas')
      .then((r) => r.json())
      .then((data) => { setPersonas(data); setLoadingPersonas(false) })
      .catch(() => setLoadingPersonas(false))
  }, [])

  const goTo = useCallback((next: StepId) => {
    setAnimKey((k) => k + 1)
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  function togglePersona(id: string) {
    setSelectedPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function movePersona(id: string, dir: -1 | 1) {
    setSelectedPersonaIds((prev) => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: key === 'maxTurns' ? Number(e.target.value) : e.target.value }))

  async function handleSubmit() {
    if (selectedPersonaIds.length === 0) { setError('Select at least one persona'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          personaIds: selectedPersonaIds,
          attachmentIds: attachments.map((a) => a.id),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const meeting = await res.json()
      router.push(`/meetings/${meeting.id}`)
    } catch (err) {
      setError(String(err))
      setSaving(false)
    }
  }

  const orderedSelected = selectedPersonaIds
    .map((id) => personas.find((p) => p.id === id))
    .filter(Boolean) as Persona[]

  // Step validity gates
  const step1Valid = form.title.trim().length > 0 && form.topic.trim().length > 0
  const step2Valid = selectedPersonaIds.length >= 1

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none'
  const inputStyle = {
    background: 'var(--surface-2)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  }
  const inputFocusClass = 'focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60'

  return (
    <div>
      <StepProgress current={step} />

      {/* ── Animated step panel ── */}
      <div
        key={animKey}
        style={{
          animation: 'stepEnter 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        {/* ━━━━ STEP 1: The Question ━━━━ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">What are you deciding?</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Set the stakes. Every persona in the room will argue around this question.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Meeting Title
                </label>
                <input
                  id="title"
                  className={`${inputClass} ${inputFocusClass}`}
                  style={inputStyle}
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Q3 Product Strategy Review"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="topic"
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Central Question
                  <span className="ml-1 normal-case tracking-normal font-normal" style={{ color: 'var(--muted)' }}>
                    — the session debates this
                  </span>
                </label>
                <textarea
                  id="topic"
                  className={`${inputClass} ${inputFocusClass} resize-none`}
                  style={inputStyle}
                  value={form.topic}
                  onChange={set('topic')}
                  rows={4}
                  placeholder="What should our product roadmap priorities be for the next 6 months? Consider market position, engineering capacity, and user demand."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="context"
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Additional Context
                  <span className="ml-1 normal-case tracking-normal font-normal" style={{ color: 'var(--muted)' }}>
                    — optional background or constraints
                  </span>
                </label>
                <textarea
                  id="context"
                  className={`${inputClass} ${inputFocusClass} resize-none`}
                  style={inputStyle}
                  value={form.context}
                  onChange={set('context')}
                  rows={3}
                  placeholder="Background information, constraints, or framing for the discussion…"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => goTo(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)' }}
              >
                Next: Assemble the Cast
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ━━━━ STEP 2: The Cast ━━━━ */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Assemble the cast</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Choose who sits at the table. Each persona brings a distinct perspective and bias.
              </p>
            </div>

            {/* Cast strip */}
            <div
              className="rounded-xl p-4 min-h-[64px] flex items-center gap-3 flex-wrap"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {orderedSelected.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Your cast will appear here — select personas below
                </p>
              ) : (
                orderedSelected.map((p) => {
                  const color = avatarColorHex(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={`Remove ${p.name}`}
                      onClick={() => togglePersona(p.id)}
                      className="group relative flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                    >
                      <PersonaAvatar persona={p} size={40} ring />
                      {/* remove badge */}
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M2 2l4 4M6 2L2 6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="sr-only">Remove {p.name}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Persona grid */}
            {loadingPersonas ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl h-28 animate-pulse"
                    style={{ background: 'var(--surface-2)' }}
                  />
                ))}
              </div>
            ) : personas.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm text-white font-medium mb-1">No personas yet</p>
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                  Create some personas before setting up a meeting.
                </p>
                <a
                  href="/personas/new"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--accent)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Create your first persona
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((p) => {
                  const selected = selectedPersonaIds.includes(p.id)
                  const color = avatarColorHex(p.id)
                  const backstory = p.background?.slice(0, 110) + (p.background?.length > 110 ? '…' : '')
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePersona(p.id)}
                      className="text-left rounded-xl p-4 border transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                      style={{
                        background: selected ? `${color}12` : 'var(--surface)',
                        borderColor: selected ? color : 'var(--border)',
                        borderWidth: selected ? 1.5 : 1,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <PersonaAvatar persona={p} size={40} ring={selected} />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-white truncate" title={p.name}>
                            {p.name}
                          </p>
                          <span
                            className="inline-block text-xs font-medium rounded-full px-2 py-0.5 mt-0.5"
                            style={{
                              background: `${color}20`,
                              color: color,
                            }}
                          >
                            {p.role}
                          </span>
                        </div>
                        {selected && (
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: color }}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5 3.5-3.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {backstory && (
                        <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
                          {backstory}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'var(--muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 10L3 7l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <div className="flex items-center gap-3">
                {selectedPersonaIds.length > 0 && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {selectedPersonaIds.length} selected
                  </span>
                )}
                <button
                  type="button"
                  disabled={!step2Valid}
                  onClick={() => goTo(3)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--accent)' }}
                >
                  Next: Configure
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ STEP 3: The Stage ━━━━ */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Configure the stage</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Set the depth and ground rules for the discussion.
              </p>
            </div>

            {/* Speaking order */}
            {orderedSelected.length > 1 && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Speaking Order
                </label>
                <div className="space-y-2">
                  {orderedSelected.map((p, idx) => {
                    const color = avatarColorHex(p.id)
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                      >
                        <span
                          className="text-xs font-semibold w-5 text-center tabular-nums"
                          style={{ color: 'var(--muted)' }}
                        >
                          {idx + 1}
                        </span>
                        <PersonaAvatar persona={p} size={28} ring />
                        <span className="flex-1 text-sm font-medium text-white">{p.name}</span>
                        <span
                          className="text-xs rounded-full px-2 py-0.5"
                          style={{ background: `${color}18`, color }}
                        >
                          {p.role}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => movePersona(p.id, -1)}
                            disabled={idx === 0}
                            aria-label={`Move ${p.name} up`}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:text-white disabled:opacity-25"
                            style={{ color: 'var(--muted)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => movePersona(p.id, 1)}
                            disabled={idx === orderedSelected.length - 1}
                            aria-label={`Move ${p.name} down`}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:text-white disabled:opacity-25"
                            style={{ color: 'var(--muted)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 3v6M9 6L6 9 3 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Turn depth */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Discussion Depth
                </label>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {form.maxTurns} turns
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={form.maxTurns}
                onChange={set('maxTurns')}
                className="w-full accent-purple-500"
                style={{ accentColor: 'var(--accent)' }}
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                <span>4 — brief</span>
                <span>12 — standard</span>
                <span>24 — deep dive</span>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Attachments
                <span className="ml-1 normal-case tracking-normal font-normal">— optional</span>
              </label>
              <AttachmentUploader
                meetingId={tempMeetingId}
                attachments={attachments}
                onAdd={(a) => setAttachments((prev) => [...prev, a])}
                onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goTo(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'var(--muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 10L3 7l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <button
                type="button"
                onClick={() => goTo(4)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background: 'var(--accent)' }}
              >
                Review & Launch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ━━━━ STEP 4: Launch ━━━━ */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Ready to convene</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Review your session before running it through Crucible.
              </p>
            </div>

            {/* Summary card */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Topic */}
              <div className="space-y-1">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Meeting
                </span>
                <p className="text-base font-semibold text-white">{form.title}</p>
              </div>

              <div
                className="h-px"
                style={{ background: 'var(--border)' }}
              />

              <div className="space-y-1">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Central Question
                </span>
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: 'var(--foreground)' }}
                >
                  &ldquo;{form.topic}&rdquo;
                </p>
              </div>

              {form.context && (
                <>
                  <div className="h-px" style={{ background: 'var(--border)' }} />
                  <div className="space-y-1">
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--muted)' }}
                    >
                      Context
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {form.context}
                    </p>
                  </div>
                </>
              )}

              <div className="h-px" style={{ background: 'var(--border)' }} />

              {/* Cast row */}
              <div className="space-y-2">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Cast — {orderedSelected.length} {orderedSelected.length === 1 ? 'voice' : 'voices'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {orderedSelected.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <PersonaAvatar persona={p} size={32} ring />
                      <span className="text-sm text-white">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--border)' }} />

              {/* Meta */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--muted)' }}
                  >
                    Turns
                  </span>
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                    style={{
                      background: 'rgba(124,106,247,0.15)',
                      color: 'var(--accent)',
                    }}
                  >
                    {form.maxTurns}
                  </span>
                </div>
                {attachments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--muted)' }}
                    >
                      Files
                    </span>
                    <span
                      className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                      style={{
                        background: 'var(--surface-2)',
                        color: 'var(--foreground)',
                      }}
                    >
                      {attachments.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goTo(3)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'var(--muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 7H3M6 10L3 7l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
                    </svg>
                    Creating Meeting…
                  </>
                ) : (
                  <>
                    Run through Crucible
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2l5 5-5 5M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes stepEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
