import { NextRequest, NextResponse } from 'next/server'
import { deleteAttachment } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deleteAttachment(params.id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
