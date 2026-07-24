import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Anthropic SDK before importing simulation
// ---------------------------------------------------------------------------

const mockStream = {
  on: vi.fn(),
  finalText: vi.fn(),
}

vi.mock('@/lib/anthropic', () => ({
  default: {
    messages: {
      create: vi.fn(),
      stream: vi.fn(),
    },
  },
  CLAUDE_MODEL: 'claude-test-model',
}))

import { runTurn, generateInterjection } from '@/lib/simulation'
import anthropic from '@/lib/anthropic'
import { Persona, Meeting, Turn } from '@/types'

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

const meeting: Meeting = {
  id: 'm1',
  title: 'Q4 Planning',
  topic: 'Cost reduction',
  context: '',
  personaIds: ['p1'],
  attachmentIds: [],
  status: 'running',
  maxTurns: 6,
  currentTurn: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const personaMap: Record<string, Persona> = { p1: persona }

const history: Turn[] = []

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Build a fake Anthropic stream that emits the given chunks then completes */
function fakeStream(chunks: string[]) {
  const handlers: Record<string, (arg: unknown) => void> = {}
  return {
    on: vi.fn((event: string, cb: (arg: unknown) => void) => {
      handlers[event] = cb
    }),
    finalText: vi.fn(async () => {
      // Emit text delta events then the final message
      for (const chunk of chunks) {
        handlers['text']?.(chunk)
      }
      return chunks.join('')
    }),
  }
}

// ---------------------------------------------------------------------------
// runTurn — with onToken callback
// ---------------------------------------------------------------------------

describe('runTurn streaming (onToken)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onToken for each streamed chunk', async () => {
    const stream = fakeStream(['Hello', ', ', 'world!'])
    vi.mocked(anthropic.messages.stream).mockReturnValue(stream as never)
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Hello, world!' }],
    } as never)

    const tokens: string[] = []
    await runTurn(meeting, persona, history, personaMap, [], (t) => tokens.push(t))

    expect(tokens).toEqual(['Hello', ', ', 'world!'])
  })

  it('uses anthropic.messages.stream when onToken is provided', async () => {
    const stream = fakeStream(['text'])
    vi.mocked(anthropic.messages.stream).mockReturnValue(stream as never)

    await runTurn(meeting, persona, history, personaMap, [], () => {})

    expect(anthropic.messages.stream).toHaveBeenCalled()
    expect(anthropic.messages.create).not.toHaveBeenCalled()
  })

  it('falls back to messages.create when onToken is not provided', async () => {
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    } as never)

    await runTurn(meeting, persona, history, personaMap, [])

    expect(anthropic.messages.create).toHaveBeenCalled()
    expect(anthropic.messages.stream).not.toHaveBeenCalled()
  })

  it('returns the complete text as the resolved value', async () => {
    const stream = fakeStream(['Hello', ' world'])
    vi.mocked(anthropic.messages.stream).mockReturnValue(stream as never)

    const result = await runTurn(meeting, persona, history, personaMap, [], () => {})

    expect(result).toBe('Hello world')
  })
})

// ---------------------------------------------------------------------------
// generateInterjection — with onToken callback
// ---------------------------------------------------------------------------

describe('generateInterjection streaming (onToken)', () => {
  const historyWithTurn: Turn[] = [
    {
      id: 't1',
      meetingId: 'm1',
      turnIndex: 0,
      personaId: 'p1',
      content: 'We need to cut costs.',
      kind: 'regular',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  beforeEach(() => vi.clearAllMocks())

  it('calls onToken for each streamed chunk', async () => {
    const stream = fakeStream(['Quick', ' take!'])
    vi.mocked(anthropic.messages.stream).mockReturnValue(stream as never)
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Quick take!' }],
    } as never)

    const tokens: string[] = []
    await generateInterjection(persona, historyWithTurn, personaMap, [], (t) => tokens.push(t))

    expect(tokens).toEqual(['Quick', ' take!'])
  })

  it('uses stream when onToken provided, create when not', async () => {
    // With onToken
    const stream = fakeStream(['text'])
    vi.mocked(anthropic.messages.stream).mockReturnValue(stream as never)
    await generateInterjection(persona, historyWithTurn, personaMap, [], () => {})
    expect(anthropic.messages.stream).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()

    // Without onToken
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    } as never)
    await generateInterjection(persona, historyWithTurn, personaMap, [])
    expect(anthropic.messages.create).toHaveBeenCalledTimes(1)
    expect(anthropic.messages.stream).not.toHaveBeenCalled()
  })
})
