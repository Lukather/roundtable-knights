import { NextRequest, NextResponse } from 'next/server'
import { listPersonas, createPersona } from '@/lib/personas'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const personas = listPersonas()
    return NextResponse.json(personas)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, role, background, personality, expertise } = body
    if (!name || !role || !background || !personality) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const persona = createPersona({
      name: String(name).trim(),
      role: String(role).trim(),
      background: String(background).trim(),
      personality: String(personality).trim(),
      expertise: Array.isArray(expertise) ? expertise.map(String) : [],
    })
    return NextResponse.json(persona, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
