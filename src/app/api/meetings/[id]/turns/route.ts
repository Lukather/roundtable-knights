import { NextRequest, NextResponse } from 'next/server'
import { listTurns, clearTurns } from '@/lib/turns'
import { deleteReport } from '@/lib/reports'
import { updateMeetingStatus } from '@/lib/meetings'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const turns = listTurns(params.id)
    return NextResponse.json(turns)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch turns' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    clearTurns(params.id)
    deleteReport(params.id)
    updateMeetingStatus(params.id, 'idle', 0)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to reset meeting' }, { status: 500 })
  }
}
