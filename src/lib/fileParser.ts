const MAX_CHARS = 32000

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp'])
const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'])

export function isImageType(mimeType: string, filename: string): boolean {
  if (IMAGE_MIME_TYPES.has(mimeType.toLowerCase())) return true
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  return IMAGE_EXTENSIONS.has(ext)
}

/** Normalise image mime type to the values Claude's vision API accepts */
export function normaliseImageMediaType(mimeType: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  if (mimeType === 'image/jpg') return 'image/jpeg'
  if (mimeType === 'image/png') return 'image/png'
  if (mimeType === 'image/gif') return 'image/gif'
  if (mimeType === 'image/webp') return 'image/webp'
  return 'image/jpeg'
}

export async function extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  // Images: store raw base64 for the vision API
  if (isImageType(mimeType, filename)) {
    return buffer.toString('base64')
  }

  let text = ''

  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer)
    text = data.text
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.toLowerCase().endsWith('.docx')
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  } else {
    text = buffer.toString('utf-8')
  }

  text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS) + '\n\n[... truncated for length]'
  }

  return text
}
