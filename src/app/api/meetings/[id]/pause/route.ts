import { NextRequest, NextResponse } from 'next/server'
import { getMeeting } from '@/lib/meetings'
import { activeRuns, pendingPause } from '@/lib/activeRuns'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = getMeeting(params.id)
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!activeRuns.has(params.id)) {
    return NextResponse.json({ error: 'Meeting is not running' }, { status: 409 })
  }

  pendingPause.add(params.id)
  return NextResponse.json({ success: true })
}
