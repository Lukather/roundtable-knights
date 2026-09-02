'use client'

import { useEffect, useState } from 'react'
import { Persona } from '@/types'
import PersonaCard from '@/components/PersonaCard'
import Link from 'next/link'

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/personas')
      .then((r) => r.json())
      .then(setPersonas)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Remove this persona from the roster?')) return
    await fetch(`/api/personas/${id}`, { method: 'DELETE' })
    setPersonas((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      {/* Page header */}
      <div className="persona-page-head">
        <div>
          <h1 className="persona-page-title">Cast roster</h1>
          <p className="persona-page-sub">
            {loading ? '—' : personas.length === 0
              ? 'No voices commissioned yet'
              : `${personas.length} voice${personas.length !== 1 ? 's' : ''} available for deployment`}
          </p>
        </div>
        <Link href="/personas/new" className="sleeve-cta-primary" style={{ fontSize: '0.8125rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Commission voice
        </Link>
      </div>

      {loading ? (
        <div className="sleeve-loading">Assembling roster…</div>
      ) : personas.length === 0 ? (
        <div className="sleeve-empty">
          <div className="sleeve-empty-icon">🔥</div>
          <p className="sleeve-empty-title">No voices on record</p>
          <p className="sleeve-empty-body">Commission synthetic voices to cast in your Crucible sessions.</p>
          <Link href="/personas/new" className="sleeve-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
            Commission your first voice →
          </Link>
        </div>
      ) : (
        <div className="persona-roster">
          {/* Column headers */}
          <div className="persona-roster-header">
            <span style={{ paddingLeft: '2.5rem' }}>Name</span>
            <span className="persona-roster-header-background">Background</span>
            <span className="persona-roster-header-expertise">Expertise</span>
            <span />
          </div>
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
