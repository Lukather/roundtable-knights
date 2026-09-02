'use client'

import { useEffect, useState } from 'react'
import { Persona } from '@/types'
import PersonaForm from '@/components/PersonaForm'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { avatarColorHex } from '@/lib/avatarUtils'
import { personaAvatarSvg } from '@/lib/personaAvatar'

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

  if (loading) return <div className="sleeve-loading">Loading…</div>
  if (!persona) return <div className="pf-error-page">Persona not found.</div>

  const color = avatarColorHex(persona.id)

  return (
    <div>
      <div className="persona-page-head" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="pf-breadcrumb">
            <Link href="/personas" className="pf-breadcrumb-link">Cast roster</Link>
            <span className="pf-breadcrumb-sep">/</span>
            <span>Edit</span>
          </div>
          <div className="pf-edit-head">
            <div className="pf-edit-avatar" style={{ background: `${color}18`, borderColor: `${color}50` }}>
              <img src={personaAvatarSvg(persona.id, persona.name)} alt={persona.name} width={32} height={32} style={{ display: 'block' }} />
            </div>
            <div>
              <h1 className="persona-page-title" style={{ marginTop: 0 }}>{persona.name}</h1>
              <p className="persona-page-sub" style={{ color }}>{persona.role}</p>
            </div>
          </div>
        </div>
      </div>
      <PersonaForm mode="edit" initial={persona} personaId={persona.id} />
    </div>
  )
}
