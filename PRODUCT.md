# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router), TypeScript, Tailwind CSS v3, SQLite via better-sqlite3, Anthropic Claude, Zustand, SSE.

## Users

Solo builder / experimenter — a single person running the app locally to explore ideas, stress-test decisions, or simulate conversations. No multi-user scenario currently in scope.

## Product Purpose

Crucible is a personal simulation tool that lets you stage a multi-voice AI debate. You define a cast of named personas, set a topic, optionally attach documents, and watch a live streaming argument unfold with automatic interjections, spontaneous disagreement, and a structured post-session report (decisions, action items, open questions).

Success means: you finish a session with a richer, more stress-tested understanding of a topic than you had before — surfaced by voices that don't all agree with you.

## Positioning

Multi-voice simulation: unlike a single ChatGPT prompt, the product creates a genuine clash of disagreeing perspectives, each with a distinct backstory and bias, who argue *with each other* — not just at the user. This makes dissent structural, not accidental.

## Operating Context

- Runs locally via `npm run dev`; single-user, no auth, no cloud storage
- User builds a cast of personas before starting a meeting (manually or via AI generation)
- Meetings can include uploaded PDFs, DOCX, TXT, or images that all personas respond to
- Discussions stream live (SSE); a final report is auto-generated and exportable as Markdown
- Light / dark theme toggle

## Capabilities and Constraints

- AI backend: Anthropic Claude (`claude-haiku-4-5`)
- Database: SQLite (WAL mode); auto-created at `data/roundtable.db`
- Attachments stored as extracted text or base64 inside the DB — no separate file storage
- Not designed for concurrent multi-user access
- Interjections fire at ~40% chance between turns (spontaneous)
- Rerun: completed meetings can be re-run from scratch with one click

## Brand Commitments

Name: **Crucible** — a vessel that stress-tests materials under extreme heat. Put a question in, apply adversarial pressure from multiple voices, and what comes out is harder and truer than what went in.
No formal brand identity committed yet beyond the name.

## Evidence on Hand

- README with screenshot (GitHub)
- `ideas.md` with a backlog of potential features
- Seed script (`scripts/seed-demo-prodstrat.mjs`) for a sample product-strategy meeting

## Product Principles

1. **Disagreement is the product** — a good session should surface a perspective the user hadn't considered.
2. **Personas are the cast, not the tool** — named characters with backstory are the primary creative input; the rest serves them.
3. **Local-first and frictionless** — zero config beyond an API key; the tool gets out of the way.
4. **Structure from chaos** — the mess of a live debate resolves into a clean, actionable report.
5. **Experimental over polished** — this is a side project built to explore what's possible; craft serves curiosity.

## Accessibility & Inclusion

No product-specific requirement established. Standard web accessibility baseline applies.
