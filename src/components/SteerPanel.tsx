'use client'

import { useEffect, useRef } from 'react'

const STEER_TURNS = 3

interface Props {
  /** Whether the meeting is currently paused and awaiting a steer or resume. */
  paused: boolean
  draft: string
  setDraft: (v: string) => void
  onResume: (directive?: string) => void
}

export default function SteerPanel({ paused, draft, setDraft, onResume }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!paused) return
    // Wait for the CSS transition to open the panel before scrolling and focusing
    const t = setTimeout(() => {
      textareaRef.current?.focus()
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 320)
    return () => clearTimeout(t)
  }, [paused])

  return (
    <div
      ref={panelRef}
      className="overflow-hidden transition-all duration-300"
      style={{
        maxHeight: paused ? '240px' : '0px',
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
          <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
            ✦ Steer the conversation
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
              onResume(draft.trim())
            }
          }}
          placeholder={'e.g. \u201cbring this back to the budget\u201d, \u201cpush harder on the risk angle\u201d\u2026'}
          rows={2}
          className="w-full text-sm resize-none rounded-lg px-3 py-2 outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />

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
              onClick={() => draft.trim() && onResume(draft.trim())}
              disabled={!draft.trim()}
              className="px-4 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity disabled:opacity-40"
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
