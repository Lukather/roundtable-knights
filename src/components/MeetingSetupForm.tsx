'use client'

import { useState, useEffect } from 'react'
import { Persona, Attachment } from '@/types'
import { useRouter } from 'next/navigation'
import AttachmentUploader from './AttachmentUploader'
import { v4 as uuidv4 } from 'uuid'

export default function MeetingSetupForm() {
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [form, setForm] = useState({ title: '', topic: '', context: '', maxTurns: 12 })
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [tempMeetingId] = useState(() => uuidv4())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/personas').then((r) => r.json()).then(setPersonas).catch(() => {})
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-purple-500 transition-colors"
  const inputStyle = { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }
  const labelClass = "block text-sm font-medium mb-1.5"
  const labelStyle = { color: 'var(--muted)' }

  const orderedSelected = selectedPersonaIds.map((id) => personas.find((p) => p.id === id)).filter(Boolean) as Persona[]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Meeting details */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Meeting Details</h2>
        <div>
          <label className={labelClass} style={labelStyle}>Title *</label>
          <input className={inputClass} style={inputStyle} value={form.title} onChange={set('title')} placeholder="Q3 Strategy Review" required />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Topic / Question *</label>
          <textarea
            className={inputClass}
            style={inputStyle}
            value={form.topic}
            onChange={set('topic')}
            rows={3}
            placeholder="What should our product roadmap priorities be for the next 6 months?"
            required
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Additional Context</label>
          <textarea
            className={inputClass}
            style={inputStyle}
            value={form.context}
            onChange={set('context')}
            rows={2}
            placeholder="Background information, constraints, or framing for the discussion..."
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Number of Turns: {form.maxTurns}</label>
          <input
            type="range"
            min="4"
            max="24"
            step="2"
            value={form.maxTurns}
            onChange={set('maxTurns')}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
            <span>4 (brief)</span>
            <span>12 (standard)</span>
            <span>24 (deep dive)</span>
          </div>
        </div>
      </div>

      {/* Persona selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Select Personas</h2>
        {personas.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No personas yet.{' '}
            <a href="/personas/new" className="underline" style={{ color: 'var(--accent)' }}>Create some first.</a>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map((p) => {
              const selected = selectedPersonaIds.includes(p.id)
              return (
                <div
                  key={p.id}
                  onClick={() => togglePersona(p.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors"
                  style={{
                    background: selected ? 'rgba(124, 106, 247, 0.1)' : 'var(--surface-2)',
                    borderColor: selected ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <input type="checkbox" checked={selected} readOnly className="accent-purple-500" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{p.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {orderedSelected.length > 1 && (
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Speaking order (drag to reorder):</p>
            <div className="space-y-1">
              {orderedSelected.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <span style={{ color: 'var(--muted)' }}>{idx + 1}.</span>
                  <span className="flex-1 text-white">{p.name}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => movePersona(p.id, -1)} disabled={idx === 0} className="text-xs px-1.5 py-0.5 rounded transition-colors hover:text-white disabled:opacity-30" style={{ color: 'var(--muted)' }}>↑</button>
                    <button type="button" onClick={() => movePersona(p.id, 1)} disabled={idx === orderedSelected.length - 1} className="text-xs px-1.5 py-0.5 rounded transition-colors hover:text-white disabled:opacity-30" style={{ color: 'var(--muted)' }}>↓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Attachments (optional)</h2>
        <AttachmentUploader
          meetingId={tempMeetingId}
          attachments={attachments}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-lg text-white font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--accent)' }}
      >
        {saving ? 'Creating Meeting…' : 'Start Roundtable →'}
      </button>
    </form>
  )
}
