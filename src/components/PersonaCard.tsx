'use client'

import { Persona } from '@/types'
import Link from 'next/link'
import { getInitials, avatarColor } from '@/lib/avatarUtils'

export default function PersonaCard({ persona, onDelete }: { persona: Persona; onDelete?: (id: string) => void }) {
  return (
    <div
      className="rounded-xl p-5 border transition-[border-color,transform] hover:border-purple-500/50 active:scale-[0.99]"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(persona.id)}`}>
          {getInitials(persona.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white truncate">{persona.name}</h3>
              <p className="text-sm" style={{ color: 'var(--accent)' }}>{persona.role}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/personas/${persona.id}`}
                className="text-xs px-2 py-1 rounded border transition-colors hover:border-purple-500"
                style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(persona.id)}
                  className="text-xs px-2 py-1 rounded border transition-colors hover:border-red-500 hover:text-red-400"
                  style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--muted)' }}>{persona.background}</p>
          {persona.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {persona.expertise.slice(0, 4).map((e) => (
                <span
                  key={e}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  {e}
                </span>
              ))}
              {persona.expertise.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
                  +{persona.expertise.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
