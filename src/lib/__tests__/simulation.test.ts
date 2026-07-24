import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  buildUserMessage,
  extractSection,
  extractBullets,
} from '@/lib/simulation'
import { Persona, Turn } from '@/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const persona: Persona = {
  id: 'p1',
  name: 'Alice',
  role: 'CTO',
  background: 'Veteran engineer with 20 years at scale-ups.',
  personality: 'Blunt and data-driven.',
  expertise: ['distributed systems', 'cloud architecture'],
  createdAt: '2024-01-01T00:00:00.000Z',
}

const personaMap: Record<string, Persona> = { p1: persona }

const regularTurn: Turn = {
  id: 't1',
  meetingId: 'm1',
  turnIndex: 0,
  personaId: 'p1',
  content: 'We need to cut infra costs by 30% this quarter.',
  kind: 'regular',
  createdAt: '2024-01-01T00:01:00.000Z',
}

const interjectionTurn: Turn = {
  ...regularTurn,
  id: 't2',
  turnIndex: 1,
  content: 'That timeline is unrealistic.',
  kind: 'interjection',
}

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

describe('buildSystemPrompt', () => {
  it('includes the persona name and role', () => {
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('Alice')
    expect(prompt).toContain('CTO')
  })

  it('includes background and personality', () => {
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain(persona.background)
    expect(prompt).toContain(persona.personality)
  })

  it('joins expertise as comma-separated list', () => {
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('distributed systems, cloud architecture')
  })

  it('includes the hard rules section', () => {
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('3 to 5 sentences maximum')
    expect(prompt).toContain('Never break character')
  })
})

// ---------------------------------------------------------------------------
// buildUserMessage — first turn
// ---------------------------------------------------------------------------

describe('buildUserMessage (first turn)', () => {
  const baseOpts = {
    topic: 'Q4 Cost Reduction',
    context: '',
    textAttachments: [],
    hasImages: false,
    history: [],
    personaMap,
    personaName: 'Alice',
    turnIndex: 0,
    isFirstTurn: true,
  }

  it('starts with TOPIC', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg.startsWith('TOPIC: Q4 Cost Reduction')).toBe(true)
  })

  it('ends with opening prompt', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg).toContain("What's your opening take?")
  })

  it('includes CONTEXT when provided', () => {
    const msg = buildUserMessage({ ...baseOpts, context: 'Budget is €2M.' })
    expect(msg).toContain('CONTEXT: Budget is €2M.')
  })

  it('omits CONTEXT block when empty', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg).not.toContain('CONTEXT:')
  })

  it('embeds text attachments inside <attachments> tags', () => {
    const msg = buildUserMessage({
      ...baseOpts,
      textAttachments: ['[report.txt]\nRevenue down 10%.'],
    })
    expect(msg).toContain('<attachments>')
    expect(msg).toContain('Revenue down 10%.')
    expect(msg).toContain('</attachments>')
  })

  it('adds image note when hasImages is true', () => {
    const msg = buildUserMessage({ ...baseOpts, hasImages: true })
    expect(msg).toContain('Visual attachments are included above')
  })

  it('does not add image note when hasImages is false', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg).not.toContain('Visual attachments')
  })
})

// ---------------------------------------------------------------------------
// buildUserMessage — subsequent turns
// ---------------------------------------------------------------------------

describe('buildUserMessage (subsequent turns)', () => {
  const baseOpts = {
    topic: 'Q4 Cost Reduction',
    context: '',
    textAttachments: [],
    hasImages: false,
    history: [regularTurn],
    personaMap,
    personaName: 'Alice',
    turnIndex: 1,
    isFirstTurn: false,
  }

  it('starts with TOPIC', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg.startsWith('TOPIC:')).toBe(true)
  })

  it('ends with persona name followed by colon', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg.trimEnd().endsWith('Alice:')).toBe(true)
  })

  it('includes prior turn content', () => {
    const msg = buildUserMessage(baseOpts)
    expect(msg).toContain(regularTurn.content)
  })

  it('labels interjections with [aside]', () => {
    const msg = buildUserMessage({ ...baseOpts, history: [interjectionTurn] })
    expect(msg).toContain('[aside]')
  })

  it('appends a nudge on every 4th turn index', () => {
    const msg = buildUserMessage({ ...baseOpts, turnIndex: 4 })
    expect(msg).toContain('Keep this on topic')
  })

  it('does not append nudge on non-4th turn index', () => {
    const msg = buildUserMessage({ ...baseOpts, turnIndex: 3 })
    expect(msg).not.toContain('Keep this on topic')
  })

  it('limits history to the last 6 turns', () => {
    const manyTurns: Turn[] = Array.from({ length: 10 }, (_, i) => ({
      ...regularTurn,
      id: `t${i}`,
      turnIndex: i,
      content: `Turn content ${i}`,
    }))
    const msg = buildUserMessage({ ...baseOpts, history: manyTurns })
    // The oldest 4 turns should not appear
    expect(msg).not.toContain('Turn content 0')
    expect(msg).not.toContain('Turn content 3')
    // The last 6 should appear
    expect(msg).toContain('Turn content 4')
    expect(msg).toContain('Turn content 9')
  })
})

// ---------------------------------------------------------------------------
// extractSection
// ---------------------------------------------------------------------------

const sampleReport = `## Executive Summary
This is a summary paragraph.

Second paragraph here.

## Key Decisions
- Decision: Ship in Q4

## Open Questions
- Will the budget hold?
`

describe('extractSection', () => {
  it('extracts content under a ## heading', () => {
    const result = extractSection(sampleReport, 'Executive Summary')
    expect(result).toContain('This is a summary paragraph.')
    expect(result).toContain('Second paragraph here.')
  })

  it('stops at the next ## heading', () => {
    const result = extractSection(sampleReport, 'Executive Summary')
    expect(result).not.toContain('Key Decisions')
  })

  it('also matches # headings', () => {
    const md = '# My Section\nContent here.\n\n## Next\nOther.'
    const result = extractSection(md, 'My Section')
    expect(result).toContain('Content here.')
  })

  it('returns empty string for a missing heading', () => {
    expect(extractSection(sampleReport, 'Nonexistent')).toBe('')
  })

  it('returns content to end-of-string when there is no following heading', () => {
    const result = extractSection(sampleReport, 'Open Questions')
    expect(result).toContain('Will the budget hold?')
  })
})

// ---------------------------------------------------------------------------
// extractBullets
// ---------------------------------------------------------------------------

describe('extractBullets', () => {
  it('returns an array of bullet texts without the leading dash', () => {
    const bullets = extractBullets(sampleReport, 'Key Decisions')
    expect(bullets).toEqual(['Decision: Ship in Q4'])
  })

  it('handles * bullets as well as - bullets', () => {
    const md = '## Points\n* First point\n* Second point\n'
    const bullets = extractBullets(md, 'Points')
    expect(bullets).toEqual(['First point', 'Second point'])
  })

  it('returns empty array for missing section', () => {
    expect(extractBullets(sampleReport, 'Nonexistent')).toEqual([])
  })

  it('returns empty array when section contains only "None identified."', () => {
    const md = '## Action Items\nNone identified.\n'
    expect(extractBullets(md, 'Action Items')).toEqual([])
  })

  it('filters out non-bullet lines within a section', () => {
    const md = '## Section\nSome prose here.\n- Actual bullet\nMore prose.\n'
    expect(extractBullets(md, 'Section')).toEqual(['Actual bullet'])
  })
})
