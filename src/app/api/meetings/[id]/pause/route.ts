import { NextRequest, NextResponse } from 'next/server'
import { getMeeting } from '@/lib/meetings'
import { pendingPause } from '@/lib/activeRuns'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = getMeeting(params.id)
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Set the flag unconditionally — the run loop checks it between turns.
  // Skipping the activeRuns guard avoids silent 409s caused by in-process
  // module state being reset (e.g. HMR in dev).
  pendingPause.add(params.id)
  return NextResponse.json({ success: true })
}
