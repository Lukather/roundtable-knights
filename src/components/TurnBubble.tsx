import { Turn, Persona } from '@/types'
import ReactMarkdown from 'react-markdown'
import { avatarColorHex } from '@/lib/avatarUtils'
import { personaAvatarSvg } from '@/lib/personaAvatar'

const MODERATOR_COLOR = 'var(--moderator)'
const MODERATOR_HEX = '#f59e0b'

interface Props {
  turn: Turn
  persona: Persona | undefined
  index: number
  isStreaming?: boolean
}

function AvatarImg({ id, name, size = 36, color }: { id: string; name: string; size?: number; color: string }) {
  const src = personaAvatarSvg(id, name)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}18`,
        border: `1.5px solid ${color}40`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img src={src} alt={name} width={size - 4} height={size - 4} style={{ display: 'block' }} />
    </div>
  )
}

export default function TurnBubble({ turn, persona, index, isStreaming }: Props) {
  const name = persona?.name ?? 'Unknown'
  const role = persona?.role ?? ''
  const color = persona ? avatarColorHex(persona.id) : '#6b6b80'

  // ── Moderator ──────────────────────────────────────────────────────────────
  if (turn.kind === 'moderator') {
    return (
      <div className="flex gap-3 justify-end animate-fade-in">
        <div className="max-w-[85%] min-w-0">
          <div className="flex items-center justify-end gap-2 mb-1.5">
            <span className="text-xs font-semibold" style={{ color: MODERATOR_COLOR }}>
              Moderator
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${MODERATOR_HEX}20`, color: MODERATOR_COLOR }}
            >
              directive
            </span>
          </div>
          <div
            className="rounded-xl rounded-tr-none px-4 py-3 border-r-[3px]"
            style={{
              background: `${MODERATOR_HEX}18`,
              borderRightColor: `${MODERATOR_HEX}60`,
              color: 'var(--foreground)',
            }}
          >
            <p className="text-sm italic" style={{ color: 'var(--foreground)' }}>
              {turn.content}
              {isStreaming && <StreamingCursor color={MODERATOR_HEX} />}
            </p>
          </div>
        </div>

        {/* Moderator "M" avatar — no illustration for the system voice */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="rounded-full p-0.5" style={{ background: `${MODERATOR_HEX}40` }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: MODERATOR_HEX, color: '#fff' }}
            >
              M
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Interjection ───────────────────────────────────────────────────────────
  if (turn.kind === 'interjection') {
    return (
      <div className="flex gap-2 animate-fade-in pl-6 -mt-2">
        <div className="flex-shrink-0 pt-0.5">
          {persona ? (
            <AvatarImg id={persona.id} name={name} size={28} color={color} />
          ) : (
            <div className="w-7 h-7 rounded-full" style={{ background: color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            <span className="font-medium text-xs" style={{ color }}>{name}</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>· {role}</span>
          </div>

          {/* impeccable-disable-next-line side-tab */}
          <div
            className="rounded-lg rounded-tl-none px-3 py-2 border-l-2 text-sm"
            style={{
              background: `${color}0d`,
              borderLeftColor: `${color}80`,
              color: 'var(--foreground)',
            }}
          >
            <div className="prose-bubble">
              <ReactMarkdown>{turn.content}</ReactMarkdown>
              {isStreaming && <StreamingCursor color={color} />}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Regular turn ───────────────────────────────────────────────────────────
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 pt-0.5">
        {persona ? (
          <AvatarImg id={persona.id} name={name} size={36} color={color} />
        ) : (
          <div className="w-9 h-9 rounded-full" style={{ background: color }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{name}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${color}20`, color }}
          >
            {role}
          </span>
          {index >= 0 && (
            <span className="text-xs ml-auto tabular-nums" style={{ color: 'var(--muted)' }}>
              #{index + 1}
            </span>
          )}
        </div>

        <div
          className="rounded-xl rounded-tl-none px-4 py-3 border-l-[3px]"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--foreground)',
            borderLeftColor: color,
          }}
        >
          <div className="prose-bubble">
            <ReactMarkdown>{turn.content}</ReactMarkdown>
            {isStreaming && <StreamingCursor color={color} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function StreamingCursor({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 -mb-0.5 animate-pulse rounded-sm"
      style={{ background: color }}
      aria-hidden
    />
  )
}
