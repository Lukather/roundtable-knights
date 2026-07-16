import { NextRequest, NextResponse } from 'next/server'
import { getPersona, updatePersona, deletePersona } from '@/lib/personas'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const persona = getPersona(params.id)
  if (!persona) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(persona)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const updated = updatePersona(params.id, {
      name: body.name ? String(body.name).trim() : undefined,
      role: body.role ? String(body.role).trim() : undefined,
      background: body.background ? String(body.background).trim() : undefined,
      personality: body.personality ? String(body.personality).trim() : undefined,
      expertise: Array.isArray(body.expertise) ? body.expertise.map(String) : undefined,
    })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deletePersona(params.id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
