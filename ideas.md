# Feature Ideas

A running list of potential improvements to Roundtable Knights, roughly ordered by impact within each category.

---

## UX / Core experience

### Token-by-token streaming
Stream each turn token-by-token as the AI generates, rather than delivering the complete block at once.
The SSE infrastructure is already in place; it needs a new streaming event type and a live text-update handler on the client.
**Biggest single UX uplift — makes the discussion feel genuinely alive.**

### User turn injection
Let you type your own message into a live discussion and have it appear as a named participant (e.g. "Facilitator").
Turns the simulator from a spectator tool into an interactive rehearsal where you can ask a question, challenge an assumption, or redirect the room.

### Pause and steer
Pause mid-discussion and submit a directional nudge ("bring this back to budget", "push harder on the risk angle") that is injected into the system prompt for the next N turns, without you appearing as a speaker.
Lower barrier than user turn injection — no need to craft a message, just a steering directive.

---

## Setup / Onboarding

### Persona library / quick-start templates
A set of archetypal personas (skeptical CFO, optimistic designer, process-heavy PM, first-principles engineer, legal/compliance hawk, etc.) available as one-click presets on the persona creation screen.
**Biggest friction reduction — building a good cast from scratch is the hardest part of getting started.**

### Meeting templates
Pre-configured topic + context bundles for common meeting scenarios: architecture decision, post-mortem, go/no-go review, budget review, product roadmap prioritisation.
Users pick a template, adjust the details, and start a meaningful meeting in under a minute.

---

## Post-meeting

### Step-through replay
A mode on completed meetings that reveals turns one at a time (with a "next" control), making it easier to absorb a long discussion without being overwhelmed by the full transcript at once.

### PDF / clipboard export
The report already renders as Markdown.
- One-click **PDF download** (client-side via `window.print()` or a library like `jsPDF`).
- **Copy section** buttons on each report section (Summary, Decisions, Action Items, etc.) for pasting into Notion, email, Slack.

---

## Technical / Quality

### Full migration system
Replace the inline `ALTER TABLE … ADD COLUMN` hack in `db.ts` with a versioned migration table (`schema_migrations`) and a small runner, so future schema changes are tracked and applied cleanly.

### Streaming error recovery
If the AI call fails mid-turn, the client currently shows a generic error banner. A retry-from-last-turn mechanism (server-side checkpoint + client resume logic) would make long meetings more resilient.
