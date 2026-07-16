'use client'

import { useEffect, useState } from 'react'
import { Persona } from '@/types'
import PersonaForm from '@/components/PersonaForm'
import { useParams } from 'next/navigation'

export default function EditPersonaPage() {
  const { id } = useParams<{ id: string }>()
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/personas/${id}`)
      .then((r) => r.json())
      .then(setPersona)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20" style={{ color: 'var(--muted)' }}>Loading…</div>
  if (!persona) return <div className="text-center py-20 text-red-400">Persona not found.</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Persona</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{persona.name} · {persona.role}</p>
      </div>
      <PersonaForm mode="edit" initial={persona} personaId={persona.id} />
    </div>
  )
}
