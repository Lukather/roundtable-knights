import db from './db'
import { Turn } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function row2turn(row: Record<string, unknown>): Turn {
  return {
    id: row.id as string,
    meetingId: row.meeting_id as string,
    turnIndex: row.turn_index as number,
    personaId: row.persona_id as string,
    content: row.content as string,
    kind: (row.kind as string) === 'interjection' ? 'interjection' : 'regular',
    createdAt: row.created_at as string,
  }
}

export function listTurns(meetingId: string): Turn[] {
  const rows = db.prepare('SELECT * FROM turns WHERE meeting_id = ? ORDER BY turn_index ASC').all(meetingId)
  return (rows as Record<string, unknown>[]).map(row2turn)
}

export function clearTurns(meetingId: string): void {
  db.prepare('DELETE FROM turns WHERE meeting_id = ?').run(meetingId)
}

export function createTurn(data: Omit<Turn, 'id' | 'createdAt'>): Turn {
  const id = uuidv4()
  const createdAt = new Date().toISOString()
  const kind = data.kind ?? 'regular'
  db.prepare(
    `INSERT INTO turns (id, meeting_id, turn_index, persona_id, content, kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.meetingId, data.turnIndex, data.personaId, data.content, kind, createdAt)
  return row2turn(db.prepare('SELECT * FROM turns WHERE id = ?').get(id) as Record<string, unknown>)
}
