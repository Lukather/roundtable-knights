import db from './db'
import { Report } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface ReportRow {
  id: string
  meeting_id: string
  executive_summary: string
  key_decisions: string
  open_questions: string
  action_items: string
  dissents: string
  raw_markdown: string
  created_at: string
}

function row2report(row: ReportRow): Report {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    executiveSummary: row.executive_summary,
    keyDecisions: JSON.parse(row.key_decisions || '[]') as string[],
    openQuestions: JSON.parse(row.open_questions || '[]') as string[],
    actionItems: JSON.parse(row.action_items || '[]') as string[],
    dissents: JSON.parse(row.dissents || '[]') as string[],
    rawMarkdown: row.raw_markdown,
    createdAt: row.created_at,
  }
}

export function saveReport(data: Omit<Report, 'id' | 'createdAt'>): Report {
  const id = uuidv4()
  const createdAt = new Date().toISOString()
  db.prepare(
    `INSERT OR REPLACE INTO reports (id, meeting_id, executive_summary, key_decisions, open_questions, action_items, dissents, raw_markdown, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.meetingId,
    data.executiveSummary,
    JSON.stringify(data.keyDecisions),
    JSON.stringify(data.openQuestions),
    JSON.stringify(data.actionItems),
    JSON.stringify(data.dissents),
    data.rawMarkdown,
    createdAt
  )
  return row2report(db.prepare('SELECT * FROM reports WHERE meeting_id = ?').get(data.meetingId) as ReportRow)
}

export function deleteReport(meetingId: string): void {
  db.prepare('DELETE FROM reports WHERE meeting_id = ?').run(meetingId)
}

export function getReport(meetingId: string): Report | null {
  const row = db.prepare('SELECT * FROM reports WHERE meeting_id = ?').get(meetingId)
  if (!row) return null
  return row2report(row as ReportRow)
}
