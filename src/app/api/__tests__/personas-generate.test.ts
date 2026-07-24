import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the Anthropic SDK client before importing the route
// ---------------------------------------------------------------------------

vi.mock('@/lib/anthropic', () => {
  const create = vi.fn()
  return {
    default: { messages: { create } },
    CLAUDE_MODEL: 'claude-test-model',
  }
})

import { POST } from '@/app/api/personas/generate/route'
import anthropic from '@/lib/anthropic'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/personas/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validPersonaJson = JSON.stringify({
  name: 'Jordan Lee',
  role: 'Head of Product',
  background: 'Launched five B2B SaaS products.',
  personality: 'Pragmatic and concise.',
  expertise: ['product strategy', 'user research', 'roadmapping'],
})

function mockSuccess(text: string) {
  vi.mocked(anthropic.messages.create).mockResolvedValue({
    content: [{ type: 'text', text }],
  } as never)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/personas/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when description is missing', async () => {
    const res = await POST(makeRequest({}) as never)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/)
  })

  it('returns 400 when description is empty string', async () => {
    const res = await POST(makeRequest({ description: '   ' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 200 with a valid persona on a clean AI response', async () => {
    mockSuccess(validPersonaJson)
    const res = await POST(makeRequest({ description: 'A pragmatic product lead.' }) as never)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Jordan Lee')
    expect(body.role).toBe('Head of Product')
    expect(body.expertise).toEqual(['product strategy', 'user research', 'roadmapping'])
  })

  it('extracts JSON even when the AI wraps it in markdown code fence', async () => {
    mockSuccess('```json\n' + validPersonaJson + '\n```')
    const res = await POST(makeRequest({ description: 'A product lead.' }) as never)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Jordan Lee')
  })

  it('calls the Anthropic API with the trimmed description', async () => {
    mockSuccess(validPersonaJson)
    await POST(makeRequest({ description: '  A product lead.  ' }) as never)
    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'A product lead.' }],
      }),
    )
  })

  it('returns 500 when AI returns no JSON object', async () => {
    mockSuccess('I cannot help with that.')
    const res = await POST(makeRequest({ description: 'A product lead.' }) as never)
    expect(res.status).toBe(500)
  })

  it('returns 500 when the AI response is missing required fields', async () => {
    mockSuccess(JSON.stringify({ name: 'Alice' })) // role, background, personality missing
    const res = await POST(makeRequest({ description: 'A product lead.' }) as never)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/Incomplete/)
  })

  it('coerces non-array expertise to an empty array', async () => {
    const json = JSON.stringify({
      name: 'Bob',
      role: 'Engineer',
      background: 'Backend specialist.',
      personality: 'Quiet and methodical.',
      expertise: null,
    })
    mockSuccess(json)
    const res = await POST(makeRequest({ description: 'An engineer.' }) as never)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.expertise).toEqual([])
  })
})
