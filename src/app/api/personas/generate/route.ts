import { NextRequest, NextResponse } from 'next/server'
import anthropic, { CLAUDE_MODEL } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json()
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: `You generate structured persona profiles for a business roundtable simulation tool.

Given a plain-text description of a person, output ONLY a valid JSON object with these exact fields:
{
  "name": "Full Name",
  "role": "Job Title / Role",
  "background": "2–3 sentences about professional background and experience",
  "personality": "1–2 sentences describing communication style and dominant personality traits",
  "expertise": ["area 1", "area 2", "area 3"]
}

Rules:
- Invent a plausible, specific name if none is given.
- Make background and personality vivid and distinct — avoid generic corporate filler.
- expertise should have 3–6 short, specific items.
- Output ONLY the JSON object. No markdown, no explanation.`,
      messages: [{ role: 'user', content: description.trim() }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response')

    const text = block.text.trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON in response')

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    const { name, role, background, personality, expertise } = parsed

    if (!name || !role || !background || !personality) {
      throw new Error('Incomplete persona generated')
    }

    return NextResponse.json({
      name: String(name).trim(),
      role: String(role).trim(),
      background: String(background).trim(),
      personality: String(personality).trim(),
      expertise: Array.isArray(expertise) ? expertise.map(String) : [],
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
