import { NextRequest, NextResponse } from 'next/server'
import { getAttachment } from '@/lib/attachments'
import anthropic from '@/lib/anthropic'
import { isImageType, normaliseImageMediaType } from '@/lib/fileParser'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const attachment = getAttachment(params.id)
  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!attachment.extractedText.trim()) {
    return NextResponse.json({ summary: 'No content could be extracted from this file.' })
  }

  const isImage = isImageType(attachment.mimeType, attachment.filename)

  const messages: Parameters<typeof anthropic.messages.create>[0]['messages'] = isImage
    ? [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: normaliseImageMediaType(attachment.mimeType),
              data: attachment.extractedText,
            },
          },
          {
            type: 'text',
            text: 'Describe this image in 3–4 concise sentences for someone about to discuss it in a business meeting. Focus on layout, key elements, and any notable design or content decisions visible. Use plain prose; do not use markdown formatting.',
          },
        ] as never,
      }]
    : [{
        role: 'user',
        content: `Summarize the following document in 3–4 concise sentences. Focus on the key facts, data points, or conclusions most relevant to a business discussion. Be specific — mention actual numbers or findings where present. Use plain prose; do not use markdown formatting.\n\n${attachment.extractedText.slice(0, 12000)}`,
      }]

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages,
  })

  const block = response.content[0]
  const summary = block.type === 'text' ? block.text.trim() : ''
  return NextResponse.json({ summary })
}
