import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Module mocks — declared before any import that transitively needs them
// ---------------------------------------------------------------------------

vi.mock('@/lib/attachments', () => ({
  createAttachment: vi.fn(),
}))

vi.mock('@/lib/fileParser', () => ({
  extractText: vi.fn(),
  isImageType: vi.fn(),
  normaliseImageMediaType: vi.fn(),
}))

import { POST } from '@/app/api/attachments/route'
import { createAttachment } from '@/lib/attachments'
import { extractText } from '@/lib/fileParser'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFormData(fields: Record<string, string | File>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value)
  }
  return fd
}

function makeTextFile(content: string, name: string, type = 'text/plain'): File {
  return new File([content], name, { type })
}

function makeRequest(formData: FormData): Request {
  return new Request('http://localhost/api/attachments', {
    method: 'POST',
    body: formData,
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/attachments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(extractText).mockResolvedValue('extracted text')
    vi.mocked(createAttachment).mockReturnValue({
      id: 'att1',
      meetingId: 'mtg1',
      filename: 'notes.txt',
      mimeType: 'text/plain',
      extractedText: 'extracted text',
      sizeBytes: 13,
      uploadedAt: new Date().toISOString(),
    })
  })

  it('returns 400 when file is missing', async () => {
    const fd = makeFormData({ meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/)
  })

  it('returns 400 when meetingId is missing', async () => {
    const fd = makeFormData({ file: makeTextFile('hello', 'notes.txt') })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when the file exceeds 10 MB', async () => {
    const bigContent = 'x'.repeat(11 * 1024 * 1024)
    const file = new File([bigContent], 'big.txt', { type: 'text/plain' })
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/10 MB/)
  })

  it('returns 400 for a disallowed MIME type', async () => {
    const file = new File(['data'], 'exploit.exe', { type: 'application/x-msdownload' })
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Unsupported file type/)
  })

  it('returns 400 for a disallowed extension', async () => {
    const file = new File(['data'], 'script.sh', { type: 'text/plain' })
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Unsupported file extension/)
  })

  it('returns 201 and the created attachment for a valid txt upload', async () => {
    const file = makeTextFile('Hello world', 'notes.txt')
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('att1')
    expect(body.filename).toBe('notes.txt')
  })

  it('calls extractText with the file buffer, MIME type, and filename', async () => {
    const file = makeTextFile('content', 'notes.txt')
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    await POST(makeRequest(fd) as never)
    expect(extractText).toHaveBeenCalledWith(
      expect.any(Buffer),
      'text/plain',
      'notes.txt',
    )
  })

  it('calls createAttachment with the extracted text', async () => {
    const file = makeTextFile('content', 'notes.txt')
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    await POST(makeRequest(fd) as never)
    expect(createAttachment).toHaveBeenCalledWith(
      expect.objectContaining({ extractedText: 'extracted text', meetingId: 'mtg1' }),
    )
  })

  it('accepts PDF files', async () => {
    const file = new File(['%PDF-1.4'], 'report.pdf', { type: 'application/pdf' })
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(201)
  })

  it('accepts image files', async () => {
    const file = new File([Buffer.from([0x89, 0x50, 0x4e, 0x47])], 'photo.png', { type: 'image/png' })
    const fd = makeFormData({ file, meetingId: 'mtg1' })
    const res = await POST(makeRequest(fd) as never)
    expect(res.status).toBe(201)
  })
})
