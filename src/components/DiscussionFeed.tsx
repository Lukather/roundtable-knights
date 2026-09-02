'use client'

import { useEffect, useRef } from 'react'
import { Turn, Persona } from '@/types'
import TurnBubble from './TurnBubble'
import { getInitials, avatarColor, avatarColorHex } from '@/lib/avatarUtils'
import { StreamingTurn } from '@/store/meetingStore'

interface Props {
  turns: Turn[]
  streamingTurns: Map<string, StreamingTurn>
  personaMap: Record<string, Persona>
}

export default function DiscussionFeed({ turns, streamingTurns, personaMap }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamingList = Array.from(streamingTurns.values())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns.length, streamingList.length, streamingList.map((s) => s.content.length).join(',')])

  // Build a combined display list: committed turns + active streaming turns
  // Compute regularIndex for numbering across both
  const committedRegularCount = turns.filter((t) => t.kind !== 'interjection').length

  return (
    <div className="space-y-6">
      {turns.map((turn, i) => {
        const regularIndex = turns.slice(0, i + 1).filter((t) => t.kind !== 'interjection').length - 1
        return (
          <TurnBubble key={turn.id} turn={turn} persona={personaMap[turn.personaId]} index={regularIndex} />
        )
      })}

      {streamingList.map((streaming, i) => {
        const persona = personaMap[streaming.personaId]
        const color = persona ? avatarColorHex(persona.id) : '#6b7280'

        // While content is empty show the thinking indicator
        if (!streaming.content) {
          return (
            <div key={streaming.id} className="flex gap-3 animate-fade-in">
              <div className="flex-shrink-0 pt-0.5">
                <div className="rounded-full p-0.5 animate-pulse" style={{ background: `${color}40` }}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${persona ? avatarColor(persona.id) : 'bg-gray-600'}`}>
                    {persona ? getInitials(persona.name) : '…'}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-white">{persona?.name ?? '…'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>
                    {persona?.role ?? ''}
                  </span>
                </div>
                <div
                  className="rounded-xl rounded-tl-none px-4 py-3 border-l-[3px]"
                  style={{ background: 'var(--surface-2)', borderLeftColor: color }}
                >
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 rounded-full inline-block thinking-dot"
                        style={{ background: color, animationDelay: `${j * 200}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Once tokens arrive, render it as a TurnBubble with isStreaming
        const syntheticTurn: Turn = {
          id: streaming.id,
          meetingId: '',
          turnIndex: -1,
          personaId: streaming.personaId,
          content: streaming.content,
          kind: streaming.kind,
          createdAt: '',
        }
        const regularIndex =
          streaming.kind !== 'interjection'
            ? committedRegularCount + streamingList.slice(0, i).filter((s) => s.kind !== 'interjection').length
            : -1

        return (
          <TurnBubble
            key={streaming.id}
            turn={syntheticTurn}
            persona={persona}
            index={regularIndex}
            isStreaming
          />
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}
