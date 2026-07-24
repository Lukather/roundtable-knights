export interface Persona {
  id: string
  name: string
  role: string
  background: string
  personality: string
  expertise: string[]
  createdAt: string
}

export interface Meeting {
  id: string
  title: string
  topic: string
  context: string
  personaIds: string[]
  attachmentIds: string[]
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  maxTurns: number
  currentTurn: number
  createdAt: string
  completedAt?: string
}

export interface Attachment {
  id: string
  meetingId: string
  filename: string
  mimeType: string
  extractedText: string
  sizeBytes: number
  uploadedAt: string
}

export interface Turn {
  id: string
  meetingId: string
  turnIndex: number
  personaId: string
  content: string
  kind: 'regular' | 'interjection'
  createdAt: string
}

export interface Report {
  id: string
  meetingId: string
  executiveSummary: string
  keyDecisions: string[]
  openQuestions: string[]
  actionItems: string[]
  dissents: string[]
  rawMarkdown: string
  createdAt: string
}
