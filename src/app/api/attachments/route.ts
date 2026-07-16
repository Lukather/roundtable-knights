import { NextRequest, NextResponse } from 'next/server'
import { createAttachment } from '@/lib/attachments'
import { extractText } from '@/lib/fileParser'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const meetingId = formData.get('meetingId') as string | null

    if (!file || !meetingId) {
      return NextResponse.json({ error: 'file and meetingId are required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await extractText(buffer, file.type, file.name)

    const attachment = createAttachment({
      meetingId,
      filename: file.name,
      mimeType: file.type || 'text/plain',
      extractedText,
      sizeBytes: buffer.length,
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
