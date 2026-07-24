import { describe, it, expect } from 'vitest'
import { isImageType, normaliseImageMediaType, extractText } from '@/lib/fileParser'

// ---------------------------------------------------------------------------
// isImageType
// ---------------------------------------------------------------------------

describe('isImageType', () => {
  it('returns true for known image MIME types', () => {
    expect(isImageType('image/png', 'photo.png')).toBe(true)
    expect(isImageType('image/jpeg', 'photo.jpg')).toBe(true)
    expect(isImageType('image/jpg', 'photo.jpg')).toBe(true)
    expect(isImageType('image/gif', 'anim.gif')).toBe(true)
    expect(isImageType('image/webp', 'image.webp')).toBe(true)
  })

  it('returns true for image extensions even with generic MIME type', () => {
    expect(isImageType('application/octet-stream', 'photo.png')).toBe(true)
    expect(isImageType('', 'image.webp')).toBe(true)
  })

  it('returns false for non-image MIME types and extensions', () => {
    expect(isImageType('application/pdf', 'document.pdf')).toBe(false)
    expect(isImageType('text/plain', 'notes.txt')).toBe(false)
    expect(isImageType('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc.docx')).toBe(false)
  })

  it('is case-insensitive on MIME type', () => {
    expect(isImageType('IMAGE/PNG', 'photo.png')).toBe(true)
  })

  it('is case-insensitive on extension', () => {
    expect(isImageType('application/octet-stream', 'PHOTO.PNG')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// normaliseImageMediaType
// ---------------------------------------------------------------------------

describe('normaliseImageMediaType', () => {
  it('maps image/jpg to image/jpeg', () => {
    expect(normaliseImageMediaType('image/jpg')).toBe('image/jpeg')
  })

  it('passes through image/png, image/gif, image/webp unchanged', () => {
    expect(normaliseImageMediaType('image/png')).toBe('image/png')
    expect(normaliseImageMediaType('image/gif')).toBe('image/gif')
    expect(normaliseImageMediaType('image/webp')).toBe('image/webp')
  })

  it('falls back to image/jpeg for unknown types', () => {
    expect(normaliseImageMediaType('image/bmp')).toBe('image/jpeg')
    expect(normaliseImageMediaType('application/octet-stream')).toBe('image/jpeg')
  })
})

// ---------------------------------------------------------------------------
// extractText — plain text
// ---------------------------------------------------------------------------

describe('extractText (plain text)', () => {
  it('returns the text content of a plain text buffer', async () => {
    const buf = Buffer.from('Hello, world!', 'utf-8')
    const result = await extractText(buf, 'text/plain', 'notes.txt')
    expect(result).toBe('Hello, world!')
  })

  it('normalises Windows-style line endings', async () => {
    const buf = Buffer.from('line1\r\nline2\r\nline3', 'utf-8')
    const result = await extractText(buf, 'text/plain', 'notes.txt')
    expect(result).toBe('line1\nline2\nline3')
  })

  it('collapses runs of 3+ blank lines to 2', async () => {
    const buf = Buffer.from('a\n\n\n\nb', 'utf-8')
    const result = await extractText(buf, 'text/plain', 'notes.txt')
    expect(result).toBe('a\n\nb')
  })

  it('truncates text exceeding 32 000 chars and appends a truncation notice', async () => {
    const buf = Buffer.from('x'.repeat(33000), 'utf-8')
    const result = await extractText(buf, 'text/plain', 'big.txt')
    expect(result.length).toBeLessThan(33000)
    expect(result).toContain('[... truncated for length]')
  })
})

// ---------------------------------------------------------------------------
// extractText — images (base64)
// ---------------------------------------------------------------------------

describe('extractText (images)', () => {
  it('returns base64-encoded content for image MIME types', async () => {
    const data = 'fake image bytes'
    const buf = Buffer.from(data, 'utf-8')
    const result = await extractText(buf, 'image/png', 'photo.png')
    expect(result).toBe(buf.toString('base64'))
  })

  it('returns base64 when classified by extension regardless of MIME type', async () => {
    const buf = Buffer.from('pixel data', 'utf-8')
    const result = await extractText(buf, 'application/octet-stream', 'image.webp')
    expect(result).toBe(buf.toString('base64'))
  })
})
