/**
 * Demo seed — Product & Strategy team
 *
 * Creates 5 personas and one meeting with 2 attachments.
 * Uses fixed IDs so re-running resets the demo to a clean state.
 *
 *   node scripts/seed-demo-prodstrat.mjs
 */

import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR ?? join(__dirname, '../data')
mkdirSync(dataDir, { recursive: true })
const db = new Database(join(dataDir, 'roundtable.db'))
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS personas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    background TEXT NOT NULL,
    personality TEXT NOT NULL,
    expertise TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT '',
    persona_ids TEXT NOT NULL DEFAULT '[]',
    attachment_ids TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'idle',
    max_turns INTEGER NOT NULL DEFAULT 12,
    current_turn INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extracted_text TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    uploaded_at TEXT NOT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS turns (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    persona_id TEXT NOT NULL,
    content TEXT NOT NULL,
    turn_index INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'regular',
    created_at TEXT NOT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL UNIQUE,
    executive_summary TEXT NOT NULL DEFAULT '',
    key_decisions TEXT NOT NULL DEFAULT '[]',
    open_questions TEXT NOT NULL DEFAULT '[]',
    action_items TEXT NOT NULL DEFAULT '[]',
    dissents TEXT NOT NULL DEFAULT '[]',
    raw_markdown TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  );
`)

const now = new Date().toISOString()

// ── Personas ──────────────────────────────────────────────────────────────────
// Fixed IDs so re-running this script resets data cleanly.

const personas = [
  {
    id: 'ps-sofia',
    name: 'Sofia Reyes',
    role: 'Chief Product Officer',
    background:
      'Seven years in product, the last three at Gather. Before this she was a Group PM at Notion during the AI-features push that drove their enterprise growth. She led the launch of Notion AI and watched usage numbers move in ways she had never seen before. She joined Gather specifically because she believed the work-management category was ripe for the same disruption. She has the product roadmap memorized and can recite the competitive landscape in her sleep.',
    personality:
      'Visionary and persuasive. Frames every argument around the user problem first, then the market opportunity. Gets quietly frustrated when discussions get stuck in engineering constraints or financial modelling — she considers those problems to be solvable once there is alignment on the "what." Has a tendency to call things "table stakes" that others would call "hard." Will concede when shown hard customer data, but needs specifics not feelings.',
    expertise: ['product strategy', 'AI product development', 'PLG / product-led growth', 'roadmap prioritization', 'competitive positioning'],
  },
  {
    id: 'ps-ben',
    name: 'Ben Nakamura',
    role: 'VP of Engineering',
    background:
      'Full-stack background with a strong platform instinct. Joined Gather two years ago from Workato, where he spent four years building integration infrastructure at scale. He has seen what happens when a SaaS product tries to sell enterprise without a proper integration story — deals stall, professional services balloons, and technical debt accumulates in the form of one-off connectors maintained by customer success. He is not opposed to AI investment but believes the data pipes have to be right first.',
    personality:
      'Precise and conditional — he speaks in "if/then" statements. Surfaces hidden complexity without catastrophising. Never says "no"; says "here is what that actually requires." Has a low tolerance for roadmap commitments made without his input. Will estimate timelines when pressed but insists on a scoping session first. Gets more animated when talking about architecture than about user experience.',
    expertise: ['system architecture', 'enterprise integrations', 'API platform design', 'technical debt', 'engineering org scaling'],
  },
  {
    id: 'ps-rachel',
    name: 'Rachel Torres',
    role: 'VP of Sales',
    background:
      'Built the commercial team from four to eighteen people over three years. Personally closed eleven of the top twenty accounts. Has a notebook full of deal post-mortems. She knows exactly why they won and why they lost, and she is not shy about reading from it. Three of the last five lost enterprise deals were attributed in part to "insufficient integration with existing tools." She also has two customers who are explicitly waiting for the AI automation features before expanding their seat count.',
    personality:
      'Direct and story-driven. Every point she makes is accompanied by a specific customer name or deal number. Protective of pipeline and very sensitive to anything that might slow deal velocity or create pricing confusion. Will support product investments she can sell — which means she needs a narrative and a timeline she can put in front of a customer. Gets impatient with abstract strategy debates when she has a quota.',
    expertise: ['enterprise sales', 'deal structuring', 'competitive displacement', 'customer negotiations', 'go-to-market execution'],
  },
  {
    id: 'ps-olivier',
    name: 'Olivier Bernard',
    role: 'Head of Strategy',
    background:
      'Former BCG consultant, three years at Gather after two years at a growth-stage fund doing due diligence on SaaS businesses. He joined to build the strategy function from scratch and is responsible for the annual planning process and competitive intelligence. He has a view on everything — market sizing, adjacencies, M&A optionality — and he is usually right, which sometimes makes him annoying to debate. He has been tracking how Notion, Asana, Monday, and ClickUp are each positioning on AI versus integrations for the past eighteen months.',
    personality:
      'Analytical and slightly detached. Argues from frameworks and market data, rarely from product intuition or customer empathy. Can be perceived as playing devil\'s advocate when he is actually just doing his job. Will state an uncomfortable truth without softening it. Dislikes consensus for its own sake — he would rather surface the right tension than smooth it over. His instinct is to slow down decisions that feel like they are being rushed.',
    expertise: ['market strategy', 'competitive intelligence', 'M&A and partnerships', 'annual planning', 'SaaS business models'],
  },
  {
    id: 'ps-camille',
    name: 'Camille Osei',
    role: 'CFO',
    background:
      'Joined eighteen months ago to prepare Gather for its Series C. Background in investment banking and two previous CFO roles at growth-stage B2B SaaS companies. She understands the product business deeply and does not need things explained to her, but she will probe every assumption in a financial model before she signs off. She is acutely aware that the next round of investors will scrutinize the bet they are making with the next $5M of capital.',
    personality:
      'Calm, methodical, hard to read. Asks questions that sound like curiosity but are actually stress tests. Does not kill good ideas — she makes them better or surfaces the ones that should be killed before they get expensive. Particularly focused on payback periods, CAC efficiency, and expansion revenue mechanics. Will explicitly flag when a decision is "a capital allocation choice" rather than a product debate.',
    expertise: ['financial modelling', 'SaaS unit economics', 'fundraising strategy', 'budget allocation', 'investor relations'],
  },
]

const insertPersona = db.prepare(`
  INSERT OR REPLACE INTO personas (id, name, role, background, personality, expertise, created_at)
  VALUES (@id, @name, @role, @background, @personality, @expertise, @created_at)
`)

for (const p of personas) {
  insertPersona.run({ ...p, expertise: JSON.stringify(p.expertise), created_at: now })
  console.log(`  persona: ${p.name} (${p.role})`)
}

// ── Meeting ───────────────────────────────────────────────────────────────────

const meetingId = 'demo-ps-2026-q3-bet'

// Clean up any prior run of this meeting
db.prepare('DELETE FROM turns WHERE meeting_id = ?').run(meetingId)
db.prepare('DELETE FROM reports WHERE meeting_id = ?').run(meetingId)
db.prepare('DELETE FROM attachments WHERE meeting_id = ?').run(meetingId)
db.prepare('DELETE FROM meetings WHERE id = ?').run(meetingId)

db.prepare(`
  INSERT INTO meetings (id, title, topic, context, persona_ids, attachment_ids, status, max_turns, current_turn, created_at)
  VALUES (@id, @title, @topic, @context, @persona_ids, @attachment_ids, 'idle', 14, 0, @created_at)
`).run({
  id: meetingId,
  title: 'Q3 Product Bet: AI Automation vs. Enterprise Integrations',
  topic: 'Where should Gather focus its next 6 months of product investment — AI-powered workflow automation, or a first-class enterprise integrations platform?',
  context: `Gather is a B2B work-management SaaS at $18M ARR, 150 enterprise customers, growing 38% YoY. We have budget for one significant product bet in the next two quarters — roughly 60% of engineering capacity. Two camps have formed internally: the CPO is pushing for AI-native workflow automation (smart task routing, AI-generated briefs, automated status updates); the VP Engineering is pushing for an enterprise integrations platform (native Salesforce, SAP, and Jira connectors, a public API, and a webhook framework). Both have legitimate customer evidence. We cannot do both at full depth in the same period. This session is to pressure-test both options, surface the real tradeoffs, and identify which decision we would regret more.`,
  persona_ids: JSON.stringify(personas.map((p) => p.id)),
  attachment_ids: '[]',
  created_at: now,
})
console.log(`\n  meeting: "${db.prepare('SELECT title FROM meetings WHERE id = ?').get(meetingId).title}"`)

// ── Attachments ───────────────────────────────────────────────────────────────

const surveyText = `GATHER — CUSTOMER PRODUCT SURVEY
Q1 2026 | n=94 respondents (63 enterprise, 31 SMB) | Conducted Feb–Mar 2026
Internal use only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: TOP FEATURE REQUESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respondents were asked: "Which product capabilities would most increase your use of Gather or influence a seat expansion?"
(Select up to 3. Percentages = % of respondents who selected the option.)

ENTERPRISE SEGMENT (n=63)
  Native Salesforce integration (bi-directional sync)          61%
  AI-generated status update briefs                            54%
  Native Jira / GitHub sync for engineering tasks              51%
  AI-powered task routing and auto-assignment                  44%
  Native SAP / ERP integration                                 39%
  Automated meeting-to-task pipeline (from calendar)           37%
  Better mobile experience                                     29%
  Deeper reporting / custom dashboards                         26%
  SSO improvements (SCIM, advanced RBAC)                       22%
  Slack / Teams message-to-task capture                        18%

SMB SEGMENT (n=31)
  AI-generated status update briefs                            71%
  Automated meeting-to-task pipeline (from calendar)           58%
  AI-powered task routing and auto-assignment                  52%
  Native Slack / Teams integration                             45%
  Native Salesforce integration                                29%
  Better mobile experience                                     48%
  Template library expansion                                   39%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: NPS AND OPEN COMMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall NPS: 41 (enterprise: 47, SMB: 29)

SELECTED VERBATIM RESPONSES

On integrations:
  "We spend 20 minutes per week manually copying Salesforce deal stages into Gather. If that sync existed natively, I'd renew without question and expand to the broader sales ops team." — Head of RevOps, 220-seat account

  "Every tool we evaluate now has to answer the SAP question. Gather cannot even speak to it. That cost you the legal ops deal." — VP IT, prospect (lost deal)

  "The Jira gap is our biggest pain. Engineering and product live in different worlds because there is no bridge." — VP Product, 85-seat customer

On AI features:
  "If Gather could automatically turn my Monday morning Slack messages into tasks with owners, I would evangelize it to every team in my company." — Head of Operations, 40-seat customer

  "The AI brief idea is interesting but I worry about accuracy. I need to trust the output before I stop checking it manually." — Program Manager, 110-seat customer

  "We evaluated Monday and they showed us an AI assistant that drafts project status reports. It looked impressive in the demo. We ended up staying with Gather for UX reasons but that feature is on our wishlist." — Head of PMO, 95-seat account

  "I genuinely don't know if I want AI features or just better fundamentals. Probably both, but in that order." — CTO, 60-seat customer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: CHURN AND EXPANSION SIGNALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Accounts with pending expansion decisions (seats > 25 currently):
  - Meridian Capital (210 seats): expansion contingent on Salesforce integration
  - Coda Systems (88 seats): CTO waiting for AI automation features before rolling out to eng team
  - FairPath Health (145 seats): actively evaluating Asana as alternative; cited integrations gap
  - Linton Group (62 seats): interested in AI brief feature; no integration dependency cited

Lost deals citing product gaps (last 6 months):
  - Integration gaps cited in 5 of last 8 enterprise losses
  - AI feature gap cited in 2 of last 8 enterprise losses
  - In 1 loss, both were cited

Customer health scores (Gainsight):
  - Red (at-risk): 11 accounts, 8 of which have cited integration limitations
  - Yellow (watch): 19 accounts
  - Green: 120 accounts
`

const competitiveText = `GATHER — COMPETITIVE INTELLIGENCE BRIEF
AI vs. Integrations: How the Market is Moving
Strategy Team | April 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This brief summarizes the strategic moves of our four primary competitors over the last 12 months with a focus on how they are prioritizing AI versus integration depth. The picture is not uniform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPETITOR POSITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTION — Betting heavily on AI, deferring deep integrations
  - Launched Notion AI 2.0 in Jan 2026: AI databases, auto-generated wikis, project briefs
  - Enterprise integrations: Slack, Google, GitHub (surface-level). No SAP, no Salesforce.
  - Strategic posture: positioning AI as the reason to consolidate tools onto Notion
  - Evidence of bet paying off: reported 28% increase in enterprise trial-to-paid conversion after AI 2.0
  - Vulnerability: large enterprise IT teams are skeptical of Notion's integration story; deals above $50K ACV often stall at security review due to limited SCIM/SSO depth

ASANA — Betting on enterprise integrations and workflow structure, cautious on AI
  - Launched 140+ native integrations in 2025; Salesforce sync is now genuinely bi-directional
  - AI features: present but described by reviewers as "conservative" — AI is advisory, not autonomous
  - Won 3 accounts we were competing for in Q4 2025; integration story cited in 2 of 3 post-mortems
  - Strategic posture: "we are the system of record for work; everything else plugs into us"
  - Vulnerability: customers find Asana rigid and expensive; NPS among SMB is well below industry average; AI roadmap is unclear

MONDAY.COM — Pursuing both aggressively; showing signs of overextension
  - Launched Monday AI (workflow automation) in Sep 2025; press coverage was strong
  - Also launching native Salesforce integration (announced Q1 2026, not yet GA)
  - Field reports: AI features are demo-impressive but not deeply reliable in production
  - Support burden has increased visibly; G2 reviews mention "features that don't always work"
  - Strategic posture: "everything at once" — broad platform play with a large engineering org
  - Vulnerability: execution risk is real; customers evaluating Monday are increasingly citing product quality concerns

CLICKUP — Unfocused; not a primary threat in enterprise
  - Launched an AI features roadmap in 2024; adoption data not available
  - Integration story is broad but shallow — many connectors, limited depth
  - Mostly competing in SMB; lost relevance at $10K+ ACV
  - Strategic posture: unclear; appear to be reacting rather than leading

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYST PERSPECTIVE (Gartner, Forrester — Q1 2026 research)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gartner's latest Magic Quadrant for Collaborative Work Management (Jan 2026):
  - "Enterprise buyers in 2026 are primarily evaluating vendors on integration depth with CRM and ERP systems. AI features are considered differentiating but not decisive — buyers want to see a credible AI roadmap, not necessarily a shipped product."

Forrester Wave, Work Management Platforms (Mar 2026):
  - "The vendors that will win enterprise accounts in the next 18 months are those that can credibly answer the 'does it plug into our stack' question. AI is a secondary evaluation criterion — buyers want to know it's coming, but they are not delaying purchase for it."
  - "SMB buyers have a more immediate appetite for AI automation. For companies targeting both segments, sequencing matters."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRATEGIC FRAMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The market appears to be bifurcating:
  - Enterprise (>$15K ACV): integrations are necessary to close; AI is a differentiator on the roadmap
  - SMB (<$8K ACV): AI features drive trial conversion and expansion

Gather's current customer mix: 68% enterprise by revenue, 32% SMB.
Gather's growth target for the next 12 months leans toward enterprise expansion.

The core question this brief cannot answer: which bet is reversible? Building deep Salesforce integration is expensive and slow but its value is durable. Building AI features is faster to prototype but has a higher obsolescence risk if foundation models commoditize the feature layer.
`

const att1Id = 'ps-att-survey'
const att2Id = 'ps-att-competitive'

const insertAttachment = db.prepare(`
  INSERT INTO attachments (id, meeting_id, filename, mime_type, extracted_text, size_bytes, uploaded_at)
  VALUES (@id, @meeting_id, @filename, @mime_type, @extracted_text, @size_bytes, @uploaded_at)
`)

insertAttachment.run({
  id: att1Id,
  meeting_id: meetingId,
  filename: 'customer-product-survey-q1-2026.txt',
  mime_type: 'text/plain',
  extracted_text: surveyText,
  size_bytes: Buffer.byteLength(surveyText, 'utf8'),
  uploaded_at: now,
})
console.log(`  attachment: customer-product-survey-q1-2026.txt`)

insertAttachment.run({
  id: att2Id,
  meeting_id: meetingId,
  filename: 'competitive-intelligence-ai-vs-integrations.txt',
  mime_type: 'text/plain',
  extracted_text: competitiveText,
  size_bytes: Buffer.byteLength(competitiveText, 'utf8'),
  uploaded_at: now,
})
console.log(`  attachment: competitive-intelligence-ai-vs-integrations.txt`)

db.prepare(`UPDATE meetings SET attachment_ids = ? WHERE id = ?`).run(
  JSON.stringify([att1Id, att2Id]),
  meetingId
)

db.close()

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Demo data seeded for Product & Strategy.
Meeting ID: ${meetingId}
Open: http://localhost:3000/meetings/${meetingId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
