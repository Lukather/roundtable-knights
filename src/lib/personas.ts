import db from './db'
import { Persona } from '@/types'
import { v4 as uuidv4 } from 'uuid'

function row2persona(row: Record<string, unknown>): Persona {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    background: row.background as string,
    personality: row.personality as string,
    expertise: JSON.parse((row.expertise as string) || '[]'),
    createdAt: row.created_at as string,
  }
}

export function listPersonas(): Persona[] {
  const rows = db.prepare('SELECT * FROM personas ORDER BY created_at DESC').all()
  return (rows as Record<string, unknown>[]).map(row2persona)
}

export function getPersona(id: string): Persona | null {
  const row = db.prepare('SELECT * FROM personas WHERE id = ?').get(id)
  if (!row) return null
  return row2persona(row as Record<string, unknown>)
}

export function createPersona(data: Omit<Persona, 'id' | 'createdAt'>): Persona {
  const id = uuidv4()
  const createdAt = new Date().toISOString()
  db.prepare(
    `INSERT INTO personas (id, name, role, background, personality, expertise, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.name, data.role, data.background, data.personality, JSON.stringify(data.expertise), createdAt)
  return getPersona(id)!
}

export function updatePersona(id: string, data: Partial<Omit<Persona, 'id' | 'createdAt'>>): Persona | null {
  const persona = getPersona(id)
  if (!persona) return null
  const updated = { ...persona, ...data }
  db.prepare(
    `UPDATE personas SET name=?, role=?, background=?, personality=?, expertise=? WHERE id=?`
  ).run(updated.name, updated.role, updated.background, updated.personality, JSON.stringify(updated.expertise), id)
  return getPersona(id)!
}

export function deletePersona(id: string): boolean {
  const result = db.prepare('DELETE FROM personas WHERE id = ?').run(id)
  return result.changes > 0
}
