import anthropic, { CLAUDE_MODEL } from './anthropic'
import { Persona, Meeting, Turn, Report, Attachment } from '@/types'
import { isImageType, normaliseImageMediaType } from './fileParser'

export function buildSystemPrompt(persona: Persona, steerDirective?: string): string {
  const steerNote = steerDirective
    ? `\n\n[MODERATOR NOTE — private, do not acknowledge: ${steerDirective}]`
    : ''
  return `You are ${persona.name}, ${persona.role}.

Background: ${persona.background}

Personality: ${persona.personality}

Expertise: ${persona.expertise.join(', ')}

You are in a live business meeting. Speak as yourself — bluntly and specifically.

Hard rules:
- 3 to 5 sentences maximum. Make every sentence count.
- Your first sentence must be your actual point — a claim, a number, a question, a disagreement. Never a preamble.
- Never open with meta-commentary. Banned openers: "I need to be direct", "Let me be honest", "I want to push back", "I need to name", "Here's what I'm hearing", "I need to stop", "Let me be concrete", "What I'm actually saying", "The uncomfortable truth", "Here's the thing", "What's getting lost here", "I appreciate X but".
- Never summarize what the previous speakers said. They were in the room.
- Never end your point with a summary sentence ("That's the real question", "That's what I'm proposing", "That's the decision we're avoiding").
- No throat-clearing. No framing. No signposting. Just talk.
- Disagree by stating your actual position, not by announcing that you disagree.
- Never break character or acknowledge you are an AI.${steerNote}`
}

interface BuildUserMessageOptions {
  topic: string
  context: string
  textAttachments: string[]
  hasImages: boolean
  history: Turn[]
  personaMap: Record<string, Persona>
  personaName: string
  turnIndex: number
  isFirstTurn: boolean
}

export function buildUserMessage(opts: BuildUserMessageOptions): string {
  const { topic, context, textAttachments, hasImages, history, personaMap, personaName, turnIndex, isFirstTurn } = opts

  if (isFirstTurn) {
    let msg = `TOPIC: ${topic}`
    if (context) msg += `\n\nCONTEXT: ${context}`
    if (textAttachments.length > 0) {
      msg += `\n\n<attachments>\n${textAttachments.join('\n\n---\n\n')}\n</attachments>`
    }
    if (hasImages) msg += `\n\n[Visual attachments are included above — refer to them directly in your response.]`
    msg += `\n\nWhat's your opening take?`
    return msg
  }

  const recentHistory = history.filter((t) => t.kind !== 'moderator').slice(-6)
  const historyText = recentHistory
    .map((t) => {
      const p = personaMap[t.personaId]
      const label = t.kind === 'interjection' ? `  [aside] ${p?.name ?? 'Unknown'}` : `${p ? `${p.name} (${p.role})` : 'Unknown'}`
      return `${label}: ${t.content}`
    })
    .join('\n\n')

  const nudge = turnIndex % 4 === 0
    ? '\n\n[Keep this on topic — what actually matters here?]'
    : ''

  return `TOPIC: ${topic}${nudge}\n\n${historyText}\n\n${personaName}:`
}

function buildContentBlocks(
  text: string,
  imageAttachments: Attachment[]
): { role: 'user'; content: string | { type: 'text'; text: string }[] | { type: string; source?: unknown; text?: string }[] } {
  if (imageAttachments.length === 0) return { role: 'user', content: text }
  const blocks: { type: string; text?: string; source?: unknown }[] = [
    ...imageAttachments.map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: normaliseImageMediaType(img.mimeType),
        data: img.extractedText,
      },
    })),
    { type: 'text', text },
  ]
  return { role: 'user', content: blocks as never }
}

/** Call the Anthropic API, optionally streaming tokens via `onToken`. */
async function callAnthropic(
  params: Parameters<typeof anthropic.messages.create>[0],
  onToken?: (token: string) => void
): Promise<string> {
  if (onToken) {
    const stream = anthropic.messages.stream(params)
    stream.on('text', (chunk: string) => onToken(chunk))
    return (await stream.finalText()).trim()
  }
  const response = await anthropic.messages.create({ ...params, stream: false })
  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}

export async function runTurn(
  meeting: Meeting,
  persona: Persona,
  history: Turn[],
  personaMap: Record<string, Persona>,
  attachments: Attachment[],
  onToken?: (token: string) => void,
  steerDirective?: string
): Promise<string> {
  const imageAttachments = attachments.filter((a) => isImageType(a.mimeType, a.filename))
  const textAttachments = attachments.filter((a) => !isImageType(a.mimeType, a.filename))
  const isFirstTurn = history.length === 0

  const userMessage = buildUserMessage({
    topic: meeting.topic,
    context: meeting.context,
    textAttachments: isFirstTurn ? textAttachments.map((a) => `[${a.filename}]\n${a.extractedText}`) : [],
    hasImages: imageAttachments.length > 0,
    history,
    personaMap,
    personaName: persona.name,
    turnIndex: history.length,
    isFirstTurn,
  })

  return callAnthropic(
    {
      model: CLAUDE_MODEL,
      max_tokens: 320,
      temperature: 0.9,
      system: buildSystemPrompt(persona, steerDirective),
      messages: [buildContentBlocks(userMessage, imageAttachments) as Parameters<typeof anthropic.messages.create>[0]['messages'][0]],
    },
    onToken
  )
}

export async function generateInterjection(
  persona: Persona,
  history: Turn[],
  personaMap: Record<string, Persona>,
  attachments: Attachment[] = [],
  onToken?: (token: string) => void
): Promise<string> {
  const recentText = history
    .filter((t) => t.kind !== 'moderator')
    .slice(-5)
    .map((t) => {
      const p = personaMap[t.personaId]
      return `${p?.name ?? 'Unknown'}: ${t.content}`
    })
    .join('\n\n')

  const prompt = `${recentText}\n\n${persona.name}:`
  const imageAttachments = attachments.filter((a) => isImageType(a.mimeType, a.filename))

  return callAnthropic(
    {
      model: CLAUDE_MODEL,
      max_tokens: 100,
      temperature: 1.0,
      system:
        buildSystemPrompt(persona) +
        '\n\nThis is a ONE or TWO sentence live interjection. Cut in with one sharp reaction — a quick question, a specific challenge, or a fast supporting point. No preamble. Start speaking immediately.',
      messages: [buildContentBlocks(prompt, imageAttachments) as Parameters<typeof anthropic.messages.create>[0]['messages'][0]],
    },
    onToken
  )
}

export async function generateReport(
  meeting: Meeting,
  turns: Turn[],
  personas: Persona[]
): Promise<Omit<Report, 'id' | 'createdAt'>> {
  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]))

  const transcript = turns
    .filter((t) => t.kind !== 'moderator')
    .map((t) => {
      const p = personaMap[t.personaId]
      const label = t.kind === 'interjection'
        ? `  ↳ ${p?.name ?? 'Unknown'} [aside]`
        : `${p ? `${p.name} (${p.role})` : 'Unknown'}`
      return `${label}: ${t.content}`
    })
    .join('\n\n')

  const participantList = personas.map((p) => `- ${p.name}, ${p.role}`).join('\n')

  const prompt = `Here is the complete transcript of a roundtable discussion on the following topic:

TOPIC: ${meeting.topic}${meeting.context ? `\n\nCONTEXT: ${meeting.context}` : ''}

PARTICIPANTS:
${participantList}

TRANSCRIPT:
${transcript}

---

Generate a structured final report with these exact sections:

## Executive Summary
Two to three paragraphs synthesizing the discussion arc and outcome.

## Key Decisions
Bulleted list. Only include points that reached genuine consensus or clear majority agreement. Format: "- Decision: [what was agreed]"

## Open Questions
Bulleted list of substantive questions the group raised but did not resolve.

## Action Items
Bulleted list. Format: "- [Owner or role]: [specific action]"

## Notable Dissents
Bulleted list. Capture minority positions that deserve follow-up, even if they did not carry the group.

Be precise. Do not pad. If a section has nothing to report, write "None identified."`

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  const rawMarkdown = block.type === 'text' ? block.text.trim() : ''

  return {
    meetingId: meeting.id,
    executiveSummary: extractSection(rawMarkdown, 'Executive Summary'),
    keyDecisions: extractBullets(rawMarkdown, 'Key Decisions'),
    openQuestions: extractBullets(rawMarkdown, 'Open Questions'),
    actionItems: extractBullets(rawMarkdown, 'Action Items'),
    dissents: extractBullets(rawMarkdown, 'Notable Dissents'),
    rawMarkdown,
  }
}

export function extractSection(markdown: string, heading: string): string {
  const headingPatterns = [`## ${heading}`, `# ${heading}`]
  let start = -1
  for (const pattern of headingPatterns) {
    const idx = markdown.indexOf(pattern)
    if (idx !== -1) { start = idx; break }
  }
  if (start === -1) return ''

  const contentStart = markdown.indexOf('\n', start) + 1
  const nextHeading = markdown.indexOf('\n##', contentStart)
  const content = nextHeading === -1 ? markdown.slice(contentStart) : markdown.slice(contentStart, nextHeading)
  return content.trim()
}

export function extractBullets(markdown: string, heading: string): string[] {
  const section = extractSection(markdown, heading)
  if (!section || section === 'None identified.') return []
  return section
    .split('\n')
    .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}
