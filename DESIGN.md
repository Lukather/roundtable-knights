---
name: Roundtable Knights
description: AI-powered roundtable simulation for structured multi-voice deliberation
colors:
  void: "#0f0f14"
  chamber: "#1a1a24"
  chamber-raised: "#22222e"
  bulwark: "#2e2e3e"
  counsel: "#6b6b80"
  violet: "#7c6af7"
  violet-deep: "#6b58f0"
  sentinel-green: "#10b981"
  amber-moderator: "#f59e0b"
  crimson-error: "#ef4444"
  void-light: "#f7f7fb"
  chamber-light: "#ffffff"
  chamber-raised-light: "#efeff7"
  bulwark-light: "#e0e0f0"
  counsel-light: "#8888a8"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
  label-upper:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.violet-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.counsel}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  button-ghost-hover:
    textColor: "#ffffff"
  turn-bubble:
    backgroundColor: "{colors.chamber-raised}"
    textColor: "{colors.void-light}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  persona-card:
    backgroundColor: "{colors.chamber}"
    rounded: "{rounded.xl}"
    padding: "20px"
  persona-card-hover:
    backgroundColor: "{colors.chamber}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.counsel}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  input:
    backgroundColor: "{colors.chamber-raised}"
    textColor: "{colors.void-light}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: Roundtable Knights

## Overview

**Creative North Star: "The Council Chamber"**

Roundtable Knights lives in a digital council chamber: a space of austere authority where deliberation happens under low, purposeful light. The aesthetic is architectural rather than decorative — deep void backgrounds recede so the personas and their arguments can command attention. The single violet accent is the chamber's one source of warmth, used with discipline; when it appears, it signals action or identity.

Density is moderate-high. This is a working tool, not a dashboard. Text is the product — turns, arguments, dissents — and the interface is designed to get out of its way. Cards have presence without mass. Borders are structural, not ornamental. Spacing is precise: tight groupings within components, generous gutters between them.

The light theme inverts the material — the chamber walls become pale and clean — but the structural logic is identical. Every spacing and color decision that works in dark reads clearly in light. No element relies on darkness to function.

**Key Characteristics:**
- Void-dark base with a single violet accent held in careful reserve
- Persona-color system: each participant gets a unique hue that tints their avatar ring, bubble border, and role chip
- Turn bubbles use a 3px left-border in the speaker's persona color — the visual signature of multi-voice structure
- Moderate-high density; legibility at speed is the primary layout concern
- Flat surfaces with tonal layering; elevation through background shifts, not shadows
- All motion is purposeful and brief: `fade-in-up` entrance at 220ms ease-out only

## Colors

A near-monochrome chamber palette anchored in deep indigo-black, with violet as the single deliberate accent.

### Primary
- **Violet** (`#7c6af7`): The chamber's sole accent. Used for the primary CTA, active states, accent links, focus rings, the hero glow, and the streaming cursor. Never decorative; every use is functional.
- **Violet Deep** (`#6b58f0`): Hover state of the primary accent. Slightly saturated and darker — signals engagement without shifting the palette.

### Neutral
- **Void** (`#0f0f14`): The page background. Near-black with a faint blue undertone — not pure black, which reads as a costume.
- **Chamber** (`#1a1a24`): Card and surface background. The walls of the room — distinct from the void but not competing with it.
- **Chamber Raised** (`#22222e`): Elevated surface: input backgrounds, turn bubbles, table rows. One step lighter than Chamber.
- **Bulwark** (`#2e2e3e`): Structural borders, dividers, scrollbar thumbs. Never used for text.
- **Counsel** (`#6b6b80`): Secondary text, labels, metadata, placeholder copy. The voice of context, not content.
- **Void Light** (`#f7f7fb`): Light-mode page background. Cool, not warm — maintains the chamber's temperature.
- **Chamber Light** (`#ffffff`): Light-mode card surface.
- **Chamber Raised Light** (`#efeff7`): Light-mode elevated surface.
- **Bulwark Light** (`#e0e0f0`): Light-mode border.
- **Counsel Light** (`#8888a8`): Light-mode secondary text.

### Status Colors (non-primary)
- **Sentinel Green** (`#10b981`): Running state, success. Used sparingly in status badges only.
- **Amber Moderator** (`#f59e0b`): Moderator persona identity. Signals facilitation, not primary action.
- **Crimson Error** (`#ef4444`): Error states and destructive actions. Never decorative.

### Named Rules
**The One Voice Rule.** Violet is used at ≤15% of any screen's visual area. Its rarity makes it a reliable signal. Every additional use dilutes the effect; remove uses before adding them.

**The Persona Color Contract.** Each persona is assigned a color from a fixed palette keyed on their UUID. That color owns their avatar, bubble border, and role chip. It is never borrowed for global UI elements.

## Typography

**Body Font:** Inter (with -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif fallback)

Inter is the only typeface in use. Its high legibility at small sizes, clean numerals, and restrained character suit a dense deliberation tool. No display face is introduced.

**Character:** Clinical precision with warmth at scale. Inter's neutrality is a strength here — the personas' words are the content; the typeface is the container.

### Hierarchy
- **Headline** (700 weight, 2.5rem–3.125rem, line-height 1.2, tracking -0.02em): Page-level hero titles only. Used once per major view.
- **Title** (600 weight, 1.125rem, line-height 1.4): Section headers, card titles, dialog headers. The structural spine of each screen.
- **Body** (400 weight, 0.875rem, line-height 1.625): Turn content, descriptions, settings prose. The default reading size.
- **Label** (500 weight, 0.75rem, line-height 1.4): Role chips, metadata, timestamps, supporting context. Never used for reading; always for scanning.
- **Label Upper** (600 weight, 0.75rem, tracking 0.1em, uppercase): Section eyebrows ("How it works", "Who it's for"). Used sparingly; no more than one per page section.

### Named Rules
**The No-Scale-Jump Rule.** There is no intermediate step between Title (1.125rem) and Headline (2.5rem). The gap is intentional: the two levels serve distinct purposes and must not blur.

## Layout

The layout uses a single centered container (`max-w-6xl`, 1152px) with `px-6` horizontal padding. Below this breakpoint the layout stacks into single-column. There is no bespoke grid system — Tailwind's `grid` utilities are used with `md:grid-cols-3` and `lg:grid-cols-2` as needed.

**Vertical rhythm:** sections are separated by `border-top` + `py-14`–`py-16` (56–64px). Within sections, component groups use `space-y-4`–`space-y-8`. The principle: tight within groups, generous between them.

**The discussion feed** is a single-column scroll with `space-y-4` between turns. No max-width constraint on the feed — it fills the content column. Interjections are indented (`pl-6`) and reduced in visual weight to convey their spontaneous nature.

**Responsive:** content stacks at `md` breakpoint (768px). The hero splits 2-col at `lg` (1024px). The hero preview is always rendered but becomes visually secondary on mobile.

## Elevation & Depth

This system uses tonal layering exclusively. There are no box-shadows on cards, inputs, or standard surfaces — depth is communicated by background luminance steps (Void → Chamber → Chamber Raised). The one exception is the hero card (`shadow-2xl`), which anchors the live preview mockup as a floating artifact.

**The three-step tonal ladder:**
1. Void (`#0f0f14`) — the negative space; nothing interactive lives here
2. Chamber (`#1a1a24`) — cards, panels, the header bar
3. Chamber Raised (`#22222e`) — inputs, turn bubbles, selected states, hover fills

**Depth is therefore positional, not decorative.** A surface higher in the hierarchy is always lighter, not more shadowed. This makes the light-theme inversion clean: the same relative steps work in reverse.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The `shadow-2xl` on the hero preview is a deliberate feature exception — it marks the preview as a contained artifact, not a page section. Do not generalize it.

## Shapes

The system uses a consistently rounded language. All interactive components use `rounded-lg` (12px) for the outer boundary. Turn bubbles use `rounded-xl rounded-tl-none` (16px, one corner flattened toward the speaker) — the flattened corner is the signature form that communicates speech directionality. Chips and badges use `rounded-full` (pill). Avatars are circular.

No hard edges (`rounded-none`) appear in the product UI. The border-left accent on turn bubbles is a structural detail (3px), not a decorative frame — it carries speaker identity.

**Form vocabulary:** rounded inputs, pill chips, circular avatars, speech-bubble turns. The system does not use clipping masks, angled cuts, or geometric overlays.

## Components

### Buttons

Precise and quiet — buttons recede until invoked. They do not announce themselves.

- **Shape:** 12px radius (`rounded-lg`)
- **Primary:** Violet fill (`#7c6af7`), white text, `px-6 py-3`, 500 weight, 0.875rem
- **Hover:** `opacity: 0.9` + slight scale-down (`active:scale-[0.96]`); no color change, only presence shift
- **Ghost / Secondary:** Transparent fill, Counsel-color text and border, same radius. Hover to white text only.
- **Disabled:** `opacity: 0.5` — same shape, no distinct treatment

### Chips / Role Badges

- **Style:** Pill (`rounded-full`), persona-color background at 12% opacity (`${color}20`), persona-color text. Compact: `px-2 py-0.5`, 0.75rem.
- **Status Chips:** Same pill shape with status-color fill at 10% opacity, status-color text. Used for meeting status only.
- **Expertise Tags:** Chamber Raised background, Counsel text — purely informational, no persona color.

### Turn Bubbles

The signature component. Each speaker's message is a speech bubble anchored to their identity.

- **Shape:** `rounded-xl rounded-tl-none` — top-left corner flattened, pointing toward the avatar
- **Background:** Chamber Raised (`#22222e`)
- **Left border:** 3px solid, persona color — the primary identity signal within the feed
- **Padding:** `px-4 py-3`
- **Interjection variant:** reduced size (`rounded-lg rounded-tl-none`), 2px left border, `pl-6` indent — visually subordinate to regular turns
- **Moderator variant:** right-aligned, right border instead of left, amber color system

### Persona Cards

- **Corner Style:** 12px radius (`rounded-xl`)
- **Background:** Chamber (`#1a1a24`)
- **Border:** Bulwark (`#2e2e3e`) at rest; transitions to `purple-500/50` on hover
- **Padding:** `p-5` (20px)
- **Shadow Strategy:** none; tonal elevation only
- **Active state:** `scale-[0.99]` — tactile micro-response

### Inputs / Fields

- **Style:** Chamber Raised background, Bulwark border, 8px radius, `px-3 py-2`
- **Focus:** 2px violet outline (`var(--accent)`) at 2px offset — consistent with `:focus-visible` global rule
- **Placeholder:** Counsel color
- **Error:** No custom field treatment; error message appears below in `text-red-400`

### Navigation

- **Structure:** Single horizontal bar, Chamber surface, Bulwark bottom border, `max-w-6xl` container, `px-6 py-4`
- **Logo:** Sword emoji + "Roundtable Knights" in 500 weight, 1.125rem. Primary nav anchor.
- **Nav links:** Counsel color at rest; white on hover. No active underline — the page context communicates location.
- **Primary CTA:** "New Meeting" button using button-primary style — the only violet element in the nav.

### Avatar

- **Shape:** Circular, fixed size (36px standard, 28px interjection, 40px card)
- **Color:** Deterministic from persona UUID — one of 8 Tailwind background colors (`bg-purple-500`, `bg-blue-600`, `bg-emerald-600`, etc.)
- **Ring:** A translucent circle at 25–40% opacity of the persona color wraps the avatar; the ring signals the speaker's active color outside the bubble border
- **Initials:** White, 10–12px bold, 1–2 characters from the persona name

## Do's and Don'ts

### Do:
- **Do** use the 3-step tonal ladder (Void → Chamber → Chamber Raised) to communicate depth. Background luminance is the depth system.
- **Do** assign persona colors from the deterministic avatar utility. Every mention of a persona — avatar, bubble border, role chip — must use the same color.
- **Do** hold Violet (`#7c6af7`) in reserve. Use it only for: the primary CTA, active/selected states, the focus ring, accent links, and the streaming cursor.
- **Do** use `rounded-xl rounded-tl-none` for primary turn bubbles and preserve the flattened corner convention — it is the system's most recognizable form.
- **Do** uppercase section eyebrows with `tracking-widest` (0.1em) in Counsel color. One per section only.
- **Do** use `text-balance` on multi-line headings to prevent orphan words.

### Don't:
- **Don't** introduce a shadow on cards, inputs, or list rows. The hero preview's `shadow-2xl` is a deliberate exception, not a pattern.
- **Don't** use a `border-left` wider than 3px on turn bubbles. The existing 3px is already at the maximum weight for this system. Wider borders read as decorative.
- **Don't** use gradient text. Weight and size create emphasis.
- **Don't** use monospace fonts outside of inline code within turn content (`<code>` in `.prose-bubble`). Monospace as a "technical" costume is off-world.
- **Don't** reuse status colors (green, amber, red) for non-status purposes. Their meaning depends on scarcity.
- **Don't** add a new section eyebrow ("01 / 02 / 03" numbering) unless the sequence itself carries navigation or ordering meaning for the user.
