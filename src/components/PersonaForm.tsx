'use client'

import { useState } from 'react'
import { Persona } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  initial?: Partial<Persona>
  mode: 'create' | 'edit'
  personaId?: string
}

const inputClass = "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-purple-500 transition-colors"
const inputStyle = { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }
const labelClass = "block text-sm font-medium mb-1.5"
const labelStyle = { color: 'var(--muted)' }

export default function PersonaForm({ initial = {}, mode, personaId }: Props) {
  const router = useRouter()

  // Manual form fields
  const [form, setForm] = useState({
    name: initial.name || '',
    role: initial.role || '',
    background: initial.background || '',
    personality: initial.personality || '',
    expertiseRaw: (initial.expertise || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // AI generation state
  const [aiMode, setAiMode] = useState(false)
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

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
      setForm({
        name,
        role,
        background,
        personality,
        expertiseRaw: (expertise as string[]).join(', '),
      })
      setAiMode(false) // flip to manual so user can review/edit
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
      const expertise = form.expertiseRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
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
    <div className="max-w-2xl">
      {/* Mode toggle — create only */}
      {mode === 'create' && (
        <div
          className="inline-flex rounded-lg p-1 mb-7 gap-1"
          style={{ background: 'var(--surface)' }}
        >
          <button
            type="button"
            onClick={() => setAiMode(false)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={
              !aiMode
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--muted)' }
            }
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setAiMode(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all"
            style={
              aiMode
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--muted)' }
            }
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Generate with AI
          </button>
        </div>
      )}

      {/* AI generation panel */}
      {aiMode && mode === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>
              Describe the persona
            </label>
            <textarea
              className={inputClass}
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder={`Describe the person in plain terms — role, background, personality, areas of expertise. Examples:\n\n"A skeptical CFO in her 50s, formerly a Big-4 auditor, who cuts through optimistic projections with hard numbers."\n\n"A young ML engineer, opinionated about architecture, uncomfortable with slow consensus, tends to dominate technical conversations."`}
              autoFocus
            />
          </div>

          {genError && <p className="text-red-400 text-sm">{genError}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !description.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {generating ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Generate
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/personas')}
              className="px-5 py-2 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Manual form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} style={labelStyle}>Name *</label>
            <input className={inputClass} style={inputStyle} value={form.name} onChange={set('name')} placeholder="Dr. Sarah Chen" required />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Role *</label>
            <input className={inputClass} style={inputStyle} value={form.role} onChange={set('role')} placeholder="Senior Product Manager" required />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Background *</label>
            <textarea
              className={inputClass}
              style={inputStyle}
              value={form.background}
              onChange={set('background')}
              rows={3}
              placeholder="2-3 sentences about their professional background and experience..."
              required
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Personality & Communication Style *</label>
            <textarea
              className={inputClass}
              style={inputStyle}
              value={form.personality}
              onChange={set('personality')}
              rows={2}
              placeholder="Direct, data-driven, skeptical of vague claims. Challenges assumptions openly."
              required
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Areas of Expertise</label>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.expertiseRaw}
              onChange={set('expertiseRaw')}
              placeholder="product strategy, user research, OKRs (comma-separated)"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create Persona' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/personas')}
              className="px-5 py-2 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
