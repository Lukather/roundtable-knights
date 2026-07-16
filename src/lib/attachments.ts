import db from './db'
import { Attachment } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function row2attachment(row: Record<string, unknown>): Attachment {
  return {
    id: row.id as string,
    meetingId: row.meeting_id as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    extractedText: row.extracted_text as string,
    sizeBytes: row.size_bytes as number,
    uploadedAt: row.uploaded_at as string,
  }
}

export function createAttachment(data: Omit<Attachment, 'id' | 'uploadedAt'>): Attachment {
  const id = uuidv4()
  const uploadedAt = new Date().toISOString()
  db.prepare(
    `INSERT INTO attachments (id, meeting_id, filename, mime_type, extracted_text, size_bytes, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.meetingId, data.filename, data.mimeType, data.extractedText, data.sizeBytes, uploadedAt)
  return row2attachment(db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as Record<string, unknown>)
}

export function listAttachments(meetingId: string): Attachment[] {
  const rows = db.prepare('SELECT * FROM attachments WHERE meeting_id = ? ORDER BY uploaded_at ASC').all(meetingId)
  return (rows as Record<string, unknown>[]).map(row2attachment)
}

export function getAttachment(id: string): Attachment | null {
  const row = db.prepare('SELECT * FROM attachments WHERE id = ?').get(id)
  if (!row) return null
  return row2attachment(row as Record<string, unknown>)
}

export function deleteAttachment(id: string): boolean {
  const result = db.prepare('DELETE FROM attachments WHERE id = ?').run(id)
  return result.changes > 0
}
