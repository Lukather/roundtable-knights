import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')
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

const personas = [
  {
    id: randomUUID(),
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    background:
      'Former senior engineer at a major cloud provider, joined FieldForce Industries three years ago to modernize its tech stack. Led the successful rollout of the mobile dispatch system that cut job assignment time by 40%. Has a strong network in the AI vendor space and has been attending AI conferences for the past two years.',
    personality:
      'Visionary and persuasive, sometimes glosses over implementation risk to sell the big picture. Gets impatient with prolonged debate and tends to move toward decisions faster than the room is ready. Genuinely believes AI is a competitive necessity, not a nice-to-have.',
    expertise: ['cloud infrastructure', 'digital transformation', 'AI/ML platforms', 'vendor management', 'enterprise software rollout'],
  },
  {
    id: randomUUID(),
    name: 'Marcus Webb',
    role: 'VP of Operations',
    background:
      'Twenty years in field operations, started as a technician himself. Has managed teams through three major technology transitions — two went well, one was a costly failure that he still brings up. Deeply respected by the field workforce. Skeptical of anything that sounds like it was invented by people who have never held a wrench.',
    personality:
      'Direct, sometimes blunt. Asks the question nobody else will ask. Protective of his technicians and allergic to top-down mandates. Will support a decision once he trusts it, but he needs to be convinced with specifics, not abstractions. Has a long memory for promises that didn\'t pan out.',
    expertise: ['field workforce management', 'operational efficiency', 'change management', 'scheduling and dispatch', 'safety compliance'],
  },
  {
    id: randomUUID(),
    name: 'Dr. Priya Nair',
    role: 'Head of Data Science',
    background:
      'PhD in applied mathematics, eight years in industry across logistics and energy. Built the current predictive maintenance model that reduced unplanned downtime by 18%. Known for being the person who can actually tell whether a vendor\'s AI demo is real or smoke and mirrors. Writes internal white papers that most people skim but everyone cites.',
    personality:
      'Measured, precise, and occasionally exhausting in her thoroughness. Will not overstate what the data shows. Frustrated by people who treat AI as magic. Will flag risk without catastrophizing. Tends to propose phased, testable approaches rather than big bets.',
    expertise: ['machine learning', 'predictive analytics', 'data infrastructure', 'model evaluation', 'statistical process control'],
  },
  {
    id: randomUUID(),
    name: 'James Okafor',
    role: 'Chief Financial Officer',
    background:
      'Joined from a private equity background two years ago to prepare FieldForce for a potential acquisition. Runs a tight ship on capex. Has approved two tech investments in his tenure — both with clear ROI models and milestone-based disbursements. Deeply aware that the company is being watched by potential buyers and that cost overruns kill valuations.',
    personality:
      'Calm, methodical, and hard to read. Probes every assumption in a financial model without showing his hand on whether he supports the initiative. His questions are never rhetorical — he actually wants the answer. Will not kill a good idea, but he will make you defend every number.',
    expertise: ['corporate finance', 'capex planning', 'M&A preparation', 'risk-adjusted ROI', 'vendor contract negotiation'],
  },
  {
    id: randomUUID(),
    name: 'Elena Vasquez',
    role: 'VP of Customer Success',
    background:
      'Has managed the company\'s top 50 enterprise accounts for six years. Watched a previous CRM rollout tank customer satisfaction scores for an entire quarter because the field team wasn\'t properly trained. Now treats any technology change as a customer experience risk until proven otherwise. Has a direct line to several key accounts who will tell her immediately if something feels off.',
    personality:
      'Empathetic and politically savvy. Frames everything through the customer lens, which sometimes gets dismissed as soft but usually turns out to be right. Will support ambitious initiatives if the change management plan is credible. Pushes back hard on timelines she thinks are unrealistic.',
    expertise: ['account management', 'customer experience', 'SLA governance', 'escalation handling', 'field-to-customer communication'],
  },
]

const insertPersona = db.prepare(`
  INSERT OR IGNORE INTO personas (id, name, role, background, personality, expertise, created_at)
  VALUES (@id, @name, @role, @background, @personality, @expertise, @created_at)
`)

for (const p of personas) {
  insertPersona.run({ ...p, expertise: JSON.stringify(p.expertise), created_at: now })
  console.log(`  persona: ${p.name}`)
}

// ── Meeting ───────────────────────────────────────────────────────────────────

const meetingId = randomUUID()

db.prepare(`
  INSERT OR IGNORE INTO meetings (id, title, topic, context, persona_ids, attachment_ids, status, max_turns, current_turn, created_at)
  VALUES (@id, @title, @topic, @context, @persona_ids, @attachment_ids, 'idle', 14, 0, @created_at)
`).run({
  id: meetingId,
  title: 'AI Investment Decision — Field Technician Workforce',
  topic: 'Should FieldForce Industries commit $2M to AI-powered tools for our 400-person field technician workforce over the next 18 months?',
  context:
    'The board has asked for a recommendation by end of quarter. Two vendors have submitted proposals: one focused on AI-assisted diagnostics and parts prediction, the other on a generative AI copilot for work order documentation. A small 12-person pilot of the diagnostics tool ran for 60 days and produced mixed results. The full investment would affect all field regions and require integration with the existing dispatch system.',
  persona_ids: JSON.stringify(personas.map((p) => p.id)),
  attachment_ids: '[]',
  created_at: now,
})
console.log(`  meeting: ${meetingId}`)

// ── Attachments ───────────────────────────────────────────────────────────────

const attachment1Text = `FIELDFORCE INDUSTRIES — FIELD OPERATIONS EFFICIENCY REPORT
Q3 2024 | Internal Use Only

EXECUTIVE SUMMARY
Field operations completed 47,200 work orders in Q3 2024. First-time fix rate held at 71%, unchanged from Q3 2023 and three points below the industry benchmark of 74%. Average job duration increased 8 minutes year-over-year to 94 minutes, driven primarily by parts lookup and work order documentation time.

KEY METRICS

Job Completion
  Total work orders completed:          47,200
  First-time fix rate:                  71%   (industry benchmark: 74%)
  Rework jobs (callback within 7 days): 13,700  (29%)
  Average job duration:                 94 min  (+8 min YoY)

Time-on-Task Breakdown (average per job)
  Travel time:                          22 min
  Diagnosis / fault isolation:          18 min
  Repair execution:                     31 min
  Parts lookup and sourcing:            12 min  (+4 min YoY)
  Work order documentation:             11 min  (+3 min YoY)

Parts and Inventory
  Jobs with correct part on first truck roll:   68%
  Emergency same-day parts orders:              8,900 (19% of jobs)
  Average cost of emergency parts order:        $47
  Estimated annual cost of wrong-part rolls:    $2.1M

Documentation and Compliance
  Work orders with complete notes on close:     61%
  Average time for supervisor documentation review: 18 min/order
  Compliance audit findings (Q3):              34 (up from 21 in Q3 2023)

TECHNICIAN SURVEY — TOP FRICTION POINTS (n=312, conducted Sept 2024)
Technicians were asked to rank their top three daily frustrations:

1. Looking up the right part number for unfamiliar equipment  — cited by 71%
2. Filling out work order notes at end of shift               — cited by 64%
3. Not knowing if a part is in stock before driving to site   — cited by 58%
4. Inconsistent job notes from previous technicians           — cited by 52%
5. Finding the right wiring diagram for older equipment       — cited by 49%

REGIONAL PERFORMANCE VARIANCE
  Highest-performing region (Pacific NW):  78% first-time fix rate
  Lowest-performing region (Gulf Coast):   63% first-time fix rate
  Gulf Coast has the highest concentration of legacy HVAC-R equipment (avg age: 11 years)

NOTES FOR LEADERSHIP
The 8-minute increase in average job duration is not explained by job complexity changes — work order mix has been stable. The increase is concentrated in documentation (+3 min) and parts lookup (+4 min). Both are information-retrieval tasks where tooling improvements are plausible. The Gulf Coast variance is a known issue tied to equipment age and technician tenure distribution; a new hire cohort of 28 technicians joined that region in Q2.
`

const attachment2Text = `COMPETITIVE INTELLIGENCE BRIEF
AI Adoption in Field Services — Synthesis of Public Sources and Partner Conversations
Prepared by Strategy Team | October 2024

PURPOSE
This brief summarizes what we know about AI tool adoption among direct competitors and adjacent field-service operators. It is based on public earnings calls, press releases, industry conference presentations, and two conversations with peers at non-competing companies who participated in similar pilots.

COMPETITOR SNAPSHOT

Apex Field Services (direct competitor, ~600 technicians)
  - Deployed an AI parts recommendation engine in January 2024 across two regions
  - Reported on Q2 earnings call: "early data suggests a 6-point improvement in first-time fix rate in pilot regions"
  - Did not disclose cost; estimated investment based on vendor pricing and headcount: $1.2M–$1.8M
  - Known issue: integration with their legacy dispatch system required 4-month delay
  - Current status: rolling out to remaining regions in Q4 2024

Consolidated Infrastructure Group (adjacent, utilities field service, ~1,200 technicians)
  - Deployed generative AI work order assistant in pilot (80 technicians) — results published in trade press
  - Reported 7-minute reduction in documentation time per job
  - Reported 22% reduction in compliance audit findings
  - Adoption challenge: technicians over 45 showed significantly lower engagement with the tool
  - Required structured change management program (4 weeks, role-specific training)
  - Investment: $3.4M for full rollout (includes change management and integration)
  - Status: full rollout completed; customer satisfaction scores improved 4 points in pilot regions

Meridian Technical Services (smaller competitor, ~180 technicians)
  - Attempted AI diagnostic tool pilot in 2023
  - Pilot was discontinued after 90 days; reasons not publicly disclosed
  - Our network contact: "the data quality going into the model was the problem — their job notes were too inconsistent to train on"

VENDOR LANDSCAPE (two proposals received)

Vendor A — DiagnosticIQ
  - Focus: AI-assisted fault diagnosis and parts prediction
  - Claims: 8–12 point improvement in first-time fix rate, 15% reduction in parts costs
  - Deployment model: tablet app + integration with existing dispatch via API
  - Pilot with our 12-person team: 4-point improvement in first-time fix (below claimed range)
  - Integration took 6 weeks vs. 2 weeks promised
  - Note from pilot technicians: useful for familiar equipment types; struggled on equipment older than 10 years

Vendor B — NoteFlow AI
  - Focus: Generative AI copilot for work order documentation
  - Claims: 8–10 minute reduction in documentation time, significant compliance improvement
  - Deployment model: voice-to-text + structured field entry on mobile
  - No pilot run with our team; references available from two other operators
  - Reference check (Consolidated Infrastructure): "the documentation quality improvement was real; adoption took longer than expected"

ANALYST VIEW (Forrester, Sept 2024 report)
"Field service organizations deploying AI tools report a consistent 18–24 month payback window when the use case is tightly scoped to a measurable friction point — typically first-time fix rate or documentation compliance. Organizations that deploy broadly without a defined primary KPI report lower satisfaction and slower adoption."

KEY UNCERTAINTIES
1. Our data quality: NoteFlow AI requires consistent historical job notes to personalize recommendations. Our 61% documentation completeness rate is below the 75% threshold they recommended.
2. Legacy equipment coverage: 31% of our fleet is equipment older than 10 years. DiagnosticIQ's pilot performance gap on older equipment is a direct concern for the Gulf Coast region.
3. Technician adoption: no AI field tool succeeds without frontline buy-in. The Meridian failure and the Consolidated Infrastructure adoption lag both point to this as the critical variable.
4. Acquisition timing: if FieldForce is acquired in the next 18 months, the acquiring entity may have its own tooling preferences. An $2M investment that gets shelved post-acquisition is a sunk cost.
`

const att1Id = randomUUID()
const att2Id = randomUUID()

const insertAttachment = db.prepare(`
  INSERT OR IGNORE INTO attachments (id, meeting_id, filename, mime_type, extracted_text, size_bytes, uploaded_at)
  VALUES (@id, @meeting_id, @filename, @mime_type, @extracted_text, @size_bytes, @uploaded_at)
`)

insertAttachment.run({
  id: att1Id,
  meeting_id: meetingId,
  filename: 'field-ops-efficiency-report-q3-2024.txt',
  mime_type: 'text/plain',
  extracted_text: attachment1Text,
  size_bytes: Buffer.byteLength(attachment1Text, 'utf8'),
  uploaded_at: now,
})
console.log(`  attachment: field-ops-efficiency-report-q3-2024.txt`)

insertAttachment.run({
  id: att2Id,
  meeting_id: meetingId,
  filename: 'competitive-intelligence-ai-field-services.txt',
  mime_type: 'text/plain',
  extracted_text: attachment2Text,
  size_bytes: Buffer.byteLength(attachment2Text, 'utf8'),
  uploaded_at: now,
})
console.log(`  attachment: competitive-intelligence-ai-field-services.txt`)

db.prepare(`UPDATE meetings SET attachment_ids = ? WHERE id = ?`).run(
  JSON.stringify([att1Id, att2Id]),
  meetingId
)

db.close()
console.log('\nDemo data seeded.')
console.log(`Meeting ID: ${meetingId}`)
console.log(`Open: http://localhost:3001/meetings/${meetingId}`)
