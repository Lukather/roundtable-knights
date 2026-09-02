'use client'

import { Persona } from '@/types'
import Link from 'next/link'
import { avatarColorHex } from '@/lib/avatarUtils'
import { personaAvatarSvg } from '@/lib/personaAvatar'

export default function PersonaCard({ persona, onDelete }: { persona: Persona; onDelete?: (id: string) => void }) {
  const color = avatarColorHex(persona.id)
  const avatarSrc = personaAvatarSvg(persona.id, persona.name)

  return (
    <div
      className="persona-roster-row"
      style={{ '--persona-color': color } as React.CSSProperties}
    >
      {/* Color accent rail */}
      <div className="persona-rail" style={{ background: color }} />

      {/* Avatar + Identity */}
      <div className="persona-identity">
        <div
          className="persona-avatar-lg"
          style={{ background: `${color}15`, borderColor: `${color}40` }}
        >
          <img src={avatarSrc} alt={persona.name} width={28} height={28} style={{ display: 'block' }} />
        </div>
        <div className="persona-identity-text">
          <span className="persona-name">{persona.name}</span>
          <span className="persona-role" style={{ color }}>{persona.role}</span>
        </div>
      </div>

      {/* Background excerpt */}
      <p className="persona-background">{persona.background}</p>

      {/* Expertise */}
      {persona.expertise.length > 0 && (
        <div className="persona-expertise">
          {persona.expertise.slice(0, 2).map((e) => (
            <span key={e} className="persona-tag">{e}</span>
          ))}
          {persona.expertise.length > 2 && (
            <span className="persona-tag persona-tag-overflow">+{persona.expertise.length - 2}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="persona-actions">
        <Link href={`/personas/${persona.id}`} className="persona-action-btn" aria-label={`Edit ${persona.name}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(persona.id)}
            className="persona-action-btn persona-action-delete"
            aria-label={`Delete ${persona.name}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
