import { Turn, Persona } from '@/types'
import ReactMarkdown from 'react-markdown'
import { getInitials, avatarColor, avatarColorHex } from '@/lib/avatarUtils'

interface Props {
  turn: Turn
  persona: Persona | undefined
  index: number
  isStreaming?: boolean
}

export default function TurnBubble({ turn, persona, index, isStreaming }: Props) {
  const name = persona?.name ?? 'Unknown'
  const role = persona?.role ?? ''
  const color = persona ? avatarColorHex(persona.id) : '#6b7280'

  if (turn.kind === 'interjection') {
    return (
      <div className="flex gap-2 animate-fade-in pl-6 -mt-2">
        {/* Smaller avatar */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="rounded-full p-0.5" style={{ background: `${color}30` }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${persona ? avatarColor(persona.id) : 'bg-gray-600'}`}>
              {getInitials(name)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {/* Reply icon */}
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            <span className="font-medium text-xs" style={{ color }}>{name}</span>
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>· {role}</span>
          </div>

          {/* Compact bubble */}
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

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar with color ring */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className="rounded-full p-0.5"
          style={{ background: `${color}40` }}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${persona ? avatarColor(persona.id) : 'bg-gray-600'}`}>
            {getInitials(name)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Speaker header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm text-white">{name}</span>
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

        {/* Bubble with persona-colored left border */}
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
