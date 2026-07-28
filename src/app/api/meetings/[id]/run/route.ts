import { NextRequest } from 'next/server'
import { getMeeting, updateMeetingStatus } from '@/lib/meetings'
import { getPersona } from '@/lib/personas'
import { listTurns, createTurn } from '@/lib/turns'
import { listAttachments } from '@/lib/attachments'
import { runTurn, generateInterjection } from '@/lib/simulation'
import { activeRuns, pendingPause, pendingDirective } from '@/lib/activeRuns'
import { Persona } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/** How many turns a steer directive stays active after being submitted */
const STEER_TURNS = 3

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const meetingId = params.id
  const meeting = getMeeting(meetingId)
  if (!meeting) {
    return new Response(JSON.stringify({ error: 'Meeting not found' }), { status: 404 })
  }
  if (meeting.status === 'running' && activeRuns.has(meetingId)) {
    return new Response(JSON.stringify({ error: 'Meeting is already running' }), { status: 409 })
  }

  // Optional steer directive sent when resuming after a pause
  let bodyDirective: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    if (typeof body?.directive === 'string' && body.directive.trim()) {
      bodyDirective = body.directive.trim()
    }
  } catch {}

  if (bodyDirective) {
    pendingDirective.set(meetingId, bodyDirective)
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

  updateMeetingStatus(meetingId, 'running', undefined)
  activeRuns.set(meetingId, true)
  pendingPause.delete(meetingId)

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      let closed = false

      const close = () => {
        if (closed) return
        closed = true
        controller.close()
      }

      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (err) {
          console.warn('[SSE] Failed to enqueue event:', err)
        }
      }

      try {
        const existingTurns = listTurns(meetingId)
        for (const t of existingTurns) send({ type: 'turn', turn: t })

        let roundIndex = existingTurns.filter((t) => t.kind !== 'interjection').length
        let insertIndex = existingTurns.length
        let lastWasInterjection = false

        // Steer state: active directive + turns remaining
        let activeDirective: string | undefined = pendingDirective.get(meetingId)
        let steerTurnsLeft = activeDirective ? STEER_TURNS : 0
        pendingDirective.delete(meetingId)

        if (activeDirective) {
          send({ type: 'steer', directive: activeDirective, turnsLeft: steerTurnsLeft })
        }

        while (roundIndex < meeting.maxTurns && activeRuns.get(meetingId)) {
          // Check for a pending pause before starting the next turn
          if (pendingPause.has(meetingId)) {
            pendingPause.delete(meetingId)
            activeRuns.delete(meetingId)
            updateMeetingStatus(meetingId, 'paused', roundIndex)
            send({ type: 'paused' })
            close()
            return
          }

          const persona = personas[roundIndex % personas.length]
          const history = listTurns(meetingId)

          const turnId = uuidv4()
          send({ type: 'turn_start', id: turnId, personaId: persona.id, kind: 'regular' })

          const content = await runTurn(
            meeting, persona, history, personaMap, attachments,
            (token) => send({ type: 'token', id: turnId, token }),
            activeDirective
          )

          const turn = createTurn({
            id: turnId,
            meetingId,
            turnIndex: insertIndex++,
            personaId: persona.id,
            content,
            kind: 'regular',
          })

          roundIndex++
          updateMeetingStatus(meetingId, 'running', roundIndex)
          send({ type: 'turn', turn })

          // Tick down the steer directive window
          if (activeDirective) {
            steerTurnsLeft--
            if (steerTurnsLeft <= 0) {
              activeDirective = undefined
              send({ type: 'steer', directive: null, turnsLeft: 0 })
            } else {
              send({ type: 'steer', directive: activeDirective, turnsLeft: steerTurnsLeft })
            }
          }

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

            const interjectionId = uuidv4()
            send({ type: 'turn_start', id: interjectionId, personaId: interjector.id, kind: 'interjection' })

            const interjectionContent = await generateInterjection(
              interjector, freshHistory, personaMap, attachments,
              (token) => send({ type: 'token', id: interjectionId, token })
            )

            const interjectionTurn = createTurn({
              id: interjectionId,
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
        close()
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
