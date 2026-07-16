import { NextRequest, NextResponse } from 'next/server'
import { getMeeting } from '@/lib/meetings'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = getMeeting(params.id)
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(meeting)
}
