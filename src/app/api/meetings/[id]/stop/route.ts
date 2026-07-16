import { NextRequest, NextResponse } from 'next/server'
import { getMeeting, updateMeetingStatus } from '@/lib/meetings'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = getMeeting(params.id)
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (meeting.status === 'running') {
    updateMeetingStatus(params.id, 'idle')
  }

  return NextResponse.json({ success: true })
}
