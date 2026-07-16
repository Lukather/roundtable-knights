import { NextRequest, NextResponse } from 'next/server'
import { listMeetings, createMeeting } from '@/lib/meetings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const meetings = listMeetings()
    return NextResponse.json(meetings)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, topic, context, personaIds, attachmentIds, maxTurns } = body
    if (!title || !topic || !personaIds || !Array.isArray(personaIds) || personaIds.length === 0) {
      return NextResponse.json({ error: 'title, topic, and at least one personaId are required' }, { status: 400 })
    }
    const meeting = createMeeting({
      title: String(title).trim(),
      topic: String(topic).trim(),
      context: context ? String(context).trim() : '',
      personaIds,
      attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [],
      maxTurns: typeof maxTurns === 'number' ? maxTurns : 12,
    })
    return NextResponse.json(meeting, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
