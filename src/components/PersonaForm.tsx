'use client'

import { useState } from 'react'
import { Persona } from '@/types'
import { useRouter } from 'next/navigation'
import { getInitials, avatarColorHex } from '@/lib/avatarUtils'
import { personaAvatarSvg } from '@/lib/personaAvatar'

interface Props {
  initial?: Partial<Persona>
  mode: 'create' | 'edit'
  personaId?: string
}

// Stable preview ID so color stays consistent during creation
const PREVIEW_ID = 'preview-persona-draft'

export default function PersonaForm({ initial = {}, mode, personaId }: Props) {
  const router = useRouter()
  const previewId = personaId ?? PREVIEW_ID

  const [form, setForm] = useState({
    name: initial.name || '',
    role: initial.role || '',
    background: initial.background || '',
    personality: initial.personality || '',
    expertiseRaw: (initial.expertise || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const previewColor = avatarColorHex(previewId)
  const expertiseTags = form.expertiseRaw.split(',').map((s) => s.trim()).filter(Boolean)

  async function handleGenerate() {
    if (!description.trim()) return
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg || 'Generation failed')
      }
      const { name, role, background, personality, expertise } = await res.json()
      setForm({ name, role, background, personality, expertiseRaw: (expertise as string[]).join(', ') })
      setAiMode(false)
    } catch (err) {
      setGenError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const expertise = form.expertiseRaw.split(',').map((s) => s.trim()).filter(Boolean)
      const payload = { name: form.name, role: form.role, background: form.background, personality: form.personality, expertise }
      const url = mode === 'create' ? '/api/personas' : `/api/personas/${personaId}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      router.push('/personas')
      router.refresh()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pf-shell">
      {/* ── Left: form ── */}
      <div className="pf-form-col">
        {/* Mode toggle — create only */}
        {mode === 'create' && (
          <div className="pf-mode-toggle">
            <button
              type="button"
              onClick={() => setAiMode(false)}
              className={`pf-mode-btn ${!aiMode ? 'pf-mode-active' : ''}`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setAiMode(true)}
              className={`pf-mode-btn pf-mode-ai ${aiMode ? 'pf-mode-active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Generate with AI
            </button>
          </div>
        )}

        {/* AI panel */}
        {aiMode && mode === 'create' ? (
          <div className="pf-ai-panel">
            <p className="pf-ai-hint">
              Describe the person in plain terms — their role, background, disposition, and any opinions they should hold.
            </p>
            <textarea
              className="pf-input pf-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder={`"A skeptical CFO in her 50s, formerly a Big-4 auditor, who cuts through optimistic projections with hard numbers."\n\n"A young ML engineer, opinionated about architecture, uncomfortable with slow consensus."`}
              autoFocus
            />
            {genError && <p className="pf-error">{genError}</p>}
            <div className="pf-actions">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !description.trim()}
                className="pf-btn-primary"
              >
                {generating ? (
                  <>
                    <svg className="pf-spin" viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" opacity=".75" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
              <button type="button" onClick={() => router.push('/personas')} className="pf-btn-ghost">Cancel</button>
            </div>
          </div>
        ) : (
          /* Manual form */
          <form onSubmit={handleSubmit} className="pf-fields">
            <div className="pf-field">
              <label className="pf-label">Name</label>
              <input className="pf-input" value={form.name} onChange={set('name')} placeholder="Dr. Sarah Chen" required />
            </div>
            <div className="pf-field">
              <label className="pf-label">Role</label>
              <input className="pf-input" value={form.role} onChange={set('role')} placeholder="Senior Product Manager" required />
            </div>
            <div className="pf-field">
              <label className="pf-label">Background</label>
              <textarea
                className="pf-input pf-textarea"
                value={form.background}
                onChange={set('background')}
                rows={3}
                placeholder="2–3 sentences about their professional background and experience."
                required
              />
            </div>
            <div className="pf-field">
              <label className="pf-label">Personality & Communication Style</label>
              <textarea
                className="pf-input pf-textarea"
                value={form.personality}
                onChange={set('personality')}
                rows={2}
                placeholder="Direct, data-driven, skeptical of vague claims. Challenges assumptions openly."
                required
              />
            </div>
            <div className="pf-field">
              <label className="pf-label">Areas of Expertise <span className="pf-label-optional">comma-separated</span></label>
              <input
                className="pf-input"
                value={form.expertiseRaw}
                onChange={set('expertiseRaw')}
                placeholder="product strategy, user research, OKRs"
              />
            </div>

            {error && <p className="pf-error">{error}</p>}

            <div className="pf-actions">
              <button type="submit" disabled={saving} className="pf-btn-primary">
                {saving ? 'Saving…' : mode === 'create' ? 'Commission persona' : 'Save changes'}
              </button>
              <button type="button" onClick={() => router.push('/personas')} className="pf-btn-ghost">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Right: live preview ── */}
      <aside className="pf-preview-col">
        <div className="pf-preview-label">Character preview</div>
        <div className="pf-preview-card" style={{ borderColor: `${previewColor}30` }}>
          {/* Top accent line */}
          <div className="pf-preview-top-rule" style={{ background: previewColor }} />

          {/* Avatar + name block */}
          <div className="pf-preview-head">
            <div className="pf-preview-avatar" style={{ background: `${previewColor}18`, borderColor: `${previewColor}50` }}>
              <img src={personaAvatarSvg(previewId, form.name || undefined)} alt="preview" width={32} height={32} style={{ display: 'block' }} />
            </div>
            <div>
              <div className="pf-preview-name">{form.name || <span className="pf-preview-empty">Name</span>}</div>
              <div className="pf-preview-role" style={{ color: previewColor }}>{form.role || <span className="pf-preview-empty">Role</span>}</div>
            </div>
          </div>

          {/* Background */}
          {form.background ? (
            <p className="pf-preview-bio">{form.background}</p>
          ) : (
            <p className="pf-preview-bio pf-preview-empty">Background will appear here…</p>
          )}

          {/* Personality */}
          {form.personality && (
            <div className="pf-preview-personality">
              <span className="pf-preview-personality-label">Disposition</span>
              <p className="pf-preview-personality-text">{form.personality}</p>
            </div>
          )}

          {/* Expertise */}
          {expertiseTags.length > 0 && (
            <div className="pf-preview-tags">
              {expertiseTags.map((t) => (
                <span key={t} className="pf-preview-tag">{t}</span>
              ))}
            </div>
          )}
        </div>

        <p className="pf-preview-note">
          This is how your persona will appear across sessions. Their avatar color is derived from their ID and is fixed once saved.
        </p>
      </aside>
    </div>
  )
}
