import db from './db'
import { Turn } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface TurnRow {
  id: string
  meeting_id: string
  turn_index: number
  persona_id: string
  content: string
  kind: string
  created_at: string
}

function row2turn(row: TurnRow): Turn {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    turnIndex: row.turn_index,
    personaId: row.persona_id,
    content: row.content,
    kind: row.kind === 'interjection' ? 'interjection' : 'regular',
    createdAt: row.created_at,
  }
}

export function listTurns(meetingId: string): Turn[] {
  const rows = db.prepare('SELECT * FROM turns WHERE meeting_id = ? ORDER BY turn_index ASC').all(meetingId)
  return (rows as TurnRow[]).map(row2turn)
}

export function clearTurns(meetingId: string): void {
  db.prepare('DELETE FROM turns WHERE meeting_id = ?').run(meetingId)
}

export function createTurn(data: Omit<Turn, 'id' | 'createdAt'> & { id?: string }): Turn {
  const id = data.id ?? uuidv4()
  const createdAt = new Date().toISOString()
  const kind = data.kind ?? 'regular'
  db.prepare(
    `INSERT INTO turns (id, meeting_id, turn_index, persona_id, content, kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.meetingId, data.turnIndex, data.personaId, data.content, kind, createdAt)
  return row2turn(db.prepare('SELECT * FROM turns WHERE id = ?').get(id) as TurnRow)
}
