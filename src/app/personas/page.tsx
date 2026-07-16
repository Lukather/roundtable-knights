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
    if (!confirm('Delete this persona?')) return
    await fetch(`/api/personas/${id}`, { method: 'DELETE' })
    setPersonas((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Personas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading ? '…' : `${personas.length} persona${personas.length !== 1 ? 's' : ''} in your library`}
          </p>
        </div>
        <Link
          href="/personas/new"
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: 'var(--accent)' }}
        >
          + New Persona
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Loading…</div>
      ) : personas.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-4">🧑‍💼</p>
          <p className="text-lg font-medium text-white mb-2">No personas yet</p>
          <p className="text-sm mb-6">Create synthetic participants for your roundtable discussions.</p>
          <Link href="/personas/new" className="px-5 py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: 'var(--accent)' }}>
            Create your first persona
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
