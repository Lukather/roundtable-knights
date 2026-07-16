# Roundtable Knights

An AI-powered roundtable simulation tool. Define a cast of synthetic personas, set a topic, attach documents or images, and watch a live multi-turn discussion unfold — complete with spontaneous interjections, a final report, and full markdown export.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![SQLite](https://img.shields.io/badge/SQLite-WAL-green) ![Anthropic](https://img.shields.io/badge/Powered%20by-Claude-orange)

---

## Features

- **Personas** — create participants manually or describe them in plain text and let AI fill in the fields
- **Meetings** — set a topic, optional context, number of rounds, and a cast of personas
- **Attachments** — upload PDFs, DOCX, TXT, or images (PNG/JPG/GIF/WEBP); AI summarises each one
- **Live discussion** — streaming SSE feed with per-turn thinking indicators and spontaneous interjections (~40% chance between turns)
- **Reports** — auto-generated executive summary, key decisions, open questions, action items, and notable dissents; exportable as Markdown
- **Rerun** — re-run a completed meeting from scratch with one click
- **Light / dark theme**

---

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)
- On Windows: [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (required by `better-sqlite3`)

### Installation

```bash
git clone https://github.com/Lukather/roundtable-knights.git
cd roundtable-knights
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Create personas** — go to Personas → New Persona. Use the manual form or switch to "Generate with AI" and describe the person in plain language.
2. **Start a meeting** — go to New Meeting, set a topic, pick personas, set the number of rounds, and optionally upload attachments.
3. **Run** — hit Start and watch the discussion stream live. Personas may interject between turns.
4. **Report** — once completed, generate a structured report and export it as Markdown.

### Demo seed

To pre-load a sample product & strategy meeting with 5 personas and 2 attachments:

```bash
node scripts/seed-demo-prodstrat.mjs
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| AI | Anthropic Claude (`claude-haiku-4-5`) |
| State | Zustand |
| Streaming | Server-Sent Events (SSE) |

---

## Project structure

```
src/
  app/          # Next.js pages and API routes
  components/   # React components
  lib/          # DB access, simulation logic, file parsing
  store/        # Zustand meeting store
  types/        # Shared TypeScript types
scripts/        # Seed scripts
data/           # SQLite DB (gitignored, created on first run)
```

---

## Notes

- The database is created automatically at `data/roundtable.db` on first run.
- Attachments are stored as extracted text (or base64 for images) inside the database — no separate file storage needed.
- The app is not designed for multi-user concurrent access; it's a single-user local tool.
