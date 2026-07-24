import { NextRequest, NextResponse } from 'next/server'
import { createAttachment } from '@/lib/attachments'
import { extractText } from '@/lib/fileParser'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
])

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'docx', 'txt', 'md',
  'png', 'jpg', 'jpeg', 'gif', 'webp',
])

/** 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const meetingId = formData.get('meetingId') as string | null

    if (!file || !meetingId) {
      return NextResponse.json({ error: 'file and meetingId are required' }, { status: 400 })
    }

    // Validate file size before reading the full buffer
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 10 MB size limit' }, { status: 400 })
    }

    // Validate MIME type
    const mimeType = file.type || 'text/plain'
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 })
    }

    // Validate file extension as a secondary check
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `Unsupported file extension: .${ext}` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await extractText(buffer, mimeType, file.name)

    const attachment = createAttachment({
      meetingId,
      filename: file.name,
      mimeType,
      extractedText,
      sizeBytes: buffer.length,
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
