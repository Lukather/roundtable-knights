import db from './db'
import { Meeting } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function row2meeting(row: Record<string, unknown>): Meeting {
  return {
    id: row.id as string,
    title: row.title as string,
    topic: row.topic as string,
    context: (row.context as string) || '',
    personaIds: JSON.parse((row.persona_ids as string) || '[]'),
    attachmentIds: JSON.parse((row.attachment_ids as string) || '[]'),
    status: row.status as Meeting['status'],
    maxTurns: row.max_turns as number,
    currentTurn: row.current_turn as number,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | undefined,
  }
}

export function listMeetings(): Meeting[] {
  const rows = db.prepare('SELECT * FROM meetings ORDER BY created_at DESC').all()
  return (rows as Record<string, unknown>[]).map(row2meeting)
}

export function getMeeting(id: string): Meeting | null {
  const row = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id)
  if (!row) return null
  return row2meeting(row as Record<string, unknown>)
}

export function createMeeting(data: Omit<Meeting, 'id' | 'createdAt' | 'currentTurn' | 'status'>): Meeting {
  const id = uuidv4()
  const createdAt = new Date().toISOString()
  db.prepare(
    `INSERT INTO meetings (id, title, topic, context, persona_ids, attachment_ids, status, max_turns, current_turn, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'idle', ?, 0, ?)`
  ).run(id, data.title, data.topic, data.context || '', JSON.stringify(data.personaIds), JSON.stringify(data.attachmentIds), data.maxTurns, createdAt)
  return getMeeting(id)!
}

export function updateMeetingStatus(id: string, status: Meeting['status'], currentTurn?: number): void {
  if (status === 'completed') {
    db.prepare(
      `UPDATE meetings SET status=?, current_turn=COALESCE(?, current_turn), completed_at=? WHERE id=?`
    ).run(status, currentTurn ?? null, new Date().toISOString(), id)
  } else {
    db.prepare(
      `UPDATE meetings SET status=?, current_turn=COALESCE(?, current_turn) WHERE id=?`
    ).run(status, currentTurn ?? null, id)
  }
}

export function addAttachmentToMeeting(meetingId: string, attachmentId: string): void {
  const meeting = getMeeting(meetingId)
  if (!meeting) return
  const ids = [...meeting.attachmentIds, attachmentId]
  db.prepare('UPDATE meetings SET attachment_ids=? WHERE id=?').run(JSON.stringify(ids), meetingId)
}
