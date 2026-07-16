import { NextRequest, NextResponse } from 'next/server'
import { listAttachments } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attachments = listAttachments(params.id)
    return NextResponse.json(attachments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 })
  }
}
