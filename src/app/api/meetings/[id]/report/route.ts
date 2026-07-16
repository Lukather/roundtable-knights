import { NextRequest, NextResponse } from 'next/server'
import { getMeeting } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
import { getPersona } from '@/lib/personas'
import { listTurns } from '@/lib/turns'
import { getReport, saveReport } from '@/lib/reports'
import { generateReport } from '@/lib/simulation'
import { Persona } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const report = getReport(params.id)
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  return NextResponse.json(report)
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meeting = getMeeting(params.id)
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

    const turns = listTurns(params.id)
    if (turns.length === 0) {
      return NextResponse.json({ error: 'No turns found — run the meeting first' }, { status: 400 })
    }

    const personas: Persona[] = []
    for (const pid of meeting.personaIds) {
      const p = getPersona(pid)
      if (p) personas.push(p)
    }

    const reportData = await generateReport(meeting, turns, personas)
    const report = saveReport(reportData)
    return NextResponse.json(report, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
