'use client'

import { useEffect, useRef, useState } from 'react'
import { STEER_TURNS, STEER_EXTRA_TURNS_DEFAULT, STEER_EXTRA_TURNS_MAX } from '@/lib/constants'

interface Props {
  /** Whether the meeting is currently paused and awaiting a steer or resume. */
  paused: boolean
  draft: string
  setDraft: (v: string) => void
  onResume: (directive?: string, extraTurns?: number) => void
}

export default function SteerPanel({ paused, draft, setDraft, onResume }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [extraTurns, setExtraTurns] = useState(STEER_EXTRA_TURNS_DEFAULT)

  // Reset extraTurns each time the panel opens
  useEffect(() => {
    if (paused) setExtraTurns(STEER_EXTRA_TURNS_DEFAULT)
  }, [paused])

  useEffect(() => {
    if (!paused) return
    // Wait for the CSS transition to open the panel before scrolling and focusing
    const t = setTimeout(() => {
      textareaRef.current?.focus()
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 320)
    return () => clearTimeout(t)
  }, [paused])

  function handleSendAndResume() {
    if (!draft.trim()) return
    onResume(draft.trim(), extraTurns)
  }

  return (
    <div
      ref={panelRef}
      className="overflow-hidden transition-[max-height,opacity,margin-top] duration-300"
      style={{
        maxHeight: paused ? '320px' : '0px',
        opacity: paused ? 1 : 0,
        marginTop: paused ? '24px' : '0px',
        pointerEvents: paused ? 'auto' : 'none',
      }}
    >
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: 'var(--surface-2)', borderColor: '#7c3aed60' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#a78bfa' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Steer the conversation
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            · active for next {STEER_TURNS} turns
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && draft.trim()) {
              handleSendAndResume()
            }
          }}
          placeholder={'e.g. \u201cbring this back to the budget\u201d, \u201cpush harder on the risk angle\u201d\u2026'}
          rows={2}
          className="w-full text-sm resize-none rounded-lg px-3 py-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />

        {/* Extra turns stepper */}
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Add turns on resume:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExtraTurns((n) => Math.max(0, n - 1))}
              disabled={extraTurns <= 0}
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              aria-label="Decrease extra turns"
            >
              −
            </button>
            <span
              className="w-6 text-center text-sm font-medium tabular-nums"
              style={{ color: 'var(--foreground)' }}
            >
              {extraTurns}
            </span>
            <button
              onClick={() => setExtraTurns((n) => Math.min(STEER_EXTRA_TURNS_MAX, n + 1))}
              disabled={extraTurns >= STEER_EXTRA_TURNS_MAX}
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              aria-label="Increase extra turns"
            >
              +
            </button>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            (only applied with steer)
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onResume()}
            className="text-xs transition-colors hover:text-white"
            style={{ color: 'var(--muted)' }}
          >
            Resume without steer
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>⌘↵</span>
            <button
              onClick={handleSendAndResume}
              disabled={!draft.trim()}
              className="px-4 py-1.5 rounded-lg text-white text-xs font-medium transition-[background-color,transform] hover:opacity-90 active:scale-[0.96] disabled:opacity-40"
              style={{ background: '#7c3aed' }}
            >
              Send & Resume →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
