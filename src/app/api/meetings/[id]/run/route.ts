import { NextRequest } from 'next/server'
import { getMeeting, updateMeetingStatus } from '@/lib/meetings'
import { getPersona } from '@/lib/personas'
import { listTurns, createTurn } from '@/lib/turns'
import { listAttachments } from '@/lib/attachments'
import { runTurn, generateInterjection } from '@/lib/simulation'
import { Persona } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const activeRuns = new Map<string, boolean>()

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const meetingId = params.id
  const meeting = getMeeting(meetingId)
  if (!meeting) {
    return new Response(JSON.stringify({ error: 'Meeting not found' }), { status: 404 })
  }
  // Allow retrying from error; only block if an active in-process run is happening
  if (meeting.status === 'running' && activeRuns.has(meetingId)) {
    return new Response(JSON.stringify({ error: 'Meeting is already running' }), { status: 409 })
  }

  const personas: Persona[] = []
  for (const pid of meeting.personaIds) {
    const p = getPersona(pid)
    if (p) personas.push(p)
  }
  if (personas.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid personas found' }), { status: 400 })
  }

  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]))
  const attachments = listAttachments(meetingId)

  updateMeetingStatus(meetingId, 'running', 0)
  activeRuns.set(meetingId, true)

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (data: object) => {
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch {}
      }

      try {
        const existingTurns = listTurns(meetingId)
        for (const t of existingTurns) send({ type: 'turn', turn: t })

        // roundIndex counts only regular turns (drives maxTurns and persona rotation)
        // insertIndex counts all rows including interjections (drives DB ordering)
        let roundIndex = existingTurns.filter((t) => t.kind !== 'interjection').length
        let insertIndex = existingTurns.length
        let lastWasInterjection = false

        while (roundIndex < meeting.maxTurns && activeRuns.get(meetingId)) {
          const persona = personas[roundIndex % personas.length]
          const history = listTurns(meetingId)

          send({ type: 'thinking', personaId: persona.id })

          const content = await runTurn(meeting, persona, history, personaMap, attachments)

          const turn = createTurn({
            meetingId,
            turnIndex: insertIndex++,
            personaId: persona.id,
            content,
            kind: 'regular',
          })

          roundIndex++
          updateMeetingStatus(meetingId, 'running', roundIndex)
          send({ type: 'turn', turn })

          // Spontaneous interjection: ~40% chance, never after the final turn
          const shouldInterject =
            roundIndex < meeting.maxTurns &&
            !lastWasInterjection &&
            activeRuns.get(meetingId) &&
            Math.random() < 0.4

          if (shouldInterject) {
            const others = personas.filter((p) => p.id !== persona.id)
            const interjector = others[Math.floor(Math.random() * others.length)]
            const freshHistory = listTurns(meetingId)

            send({ type: 'thinking', personaId: interjector.id })

            const interjectionContent = await generateInterjection(interjector, freshHistory, personaMap, attachments)

            const interjectionTurn = createTurn({
              meetingId,
              turnIndex: insertIndex++,
              personaId: interjector.id,
              content: interjectionContent,
              kind: 'interjection',
            })

            send({ type: 'turn', turn: interjectionTurn })
            lastWasInterjection = true
          } else {
            lastWasInterjection = false
          }
        }

        const finalStatus = activeRuns.get(meetingId) ? 'completed' : 'idle'
        updateMeetingStatus(meetingId, finalStatus, roundIndex)
        send({ type: 'done', status: finalStatus })
      } catch (err) {
        updateMeetingStatus(meetingId, 'error')
        send({ type: 'error', message: String(err) })
      } finally {
        activeRuns.delete(meetingId)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
