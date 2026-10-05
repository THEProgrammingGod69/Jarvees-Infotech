# CSE (AI) · VIT Pune

Website for the **Department of Computer Science & Engineering (Artificial
Intelligence), Vishwakarma Institute of Technology, Pune**.

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Framer Motion ·
raw WebGL.

- **`DESIGN.md`** — the concept, palette, type, motion system and the rules the build follows.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (all routes are static) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Node 20 or newer.

## Deploy

Vercel: import the repository — no Root Directory or build settings needed.
Set `NEXT_PUBLIC_SITE_URL` to the production origin — canonical URLs, the
sitemap and the structured data derive from it. No other configuration.

---

## Routes

| Route | What is on it |
|---|---|
| `/` | Hero with the Neural Core, stats, vision terminal, the four-layer "forward pass", labs, achievements, recruiters, CODE APEX 3.0 countdown, testimonials |
| `/about` | Vision, mission, PEOs, Head's message, mentors, institute credentials, POs/PSOs |
| `/programme` | Interactive curriculum explorer (Modules III–VIII), final-year tracks, certifications, electives, syllabus PDFs |
| `/faculty` | Head of Department, filterable faculty directory, mentors |
| `/research` | Research-domain constellation, filterable patent board, publications, industry projects, student patents |
| `/placements` | AY 2025–26 summary, best offer per company, internship stipends, recruiters |
| `/labs` | Building diagram, the four labs with seat maps, spaces |
| `/events` | CODE APEX 3.0 (countdown, stages, prizes), event log, achievement wall |
| `/students` | AISF, testimonials, social impact, student patents |
| `/contact` | Channels, compose-an-email form, map |

Press **⌘K / Ctrl K** anywhere for the command palette.

---

## Editing content

All facts live in two places; components only render them.

- **`src/lib/site.ts`** — names, phone numbers, emails, address, socials, navigation.
- **`src/content/*.ts`** — one file per subject: `about`, `curriculum`, `people`
  (faculty, testimonials, social activities), `research`, `outcomes`
  (placements, internships), `events` (CODE APEX, past events, achievements), `labs`.

Counts shown on the site ("7 granted patents listed", "39 companies") are computed
from these arrays, never typed in — add an entry and every count updates.

### Where the content came from

Everything was compiled from the department's and institute's own published pages
on vit.edu (Home, About, Programmes, Research, Placements, Internship, Facilities,
Events & Highlights, Students & Alumni, Rankings & Recognitions) and the AY 2025–26
Structure & Syllabus PDF, in October 2026.

### Before launch — please confirm

- **Faculty roster and designations.** The department's faculty page publishes no
  roster, so `src/content/people.ts` is compiled from the 2025–26 patent,
  publication and FDP registers. Designations other than the Head's are deliberately
  not stated. Replace with the official list when available.
- **Photographs** are referenced from vit.edu. If the institute blocks hot-linking,
  copy the files into `public/` and change the paths in `src/content/labs.ts` and
  `src/lib/site.ts`. A missing photo already degrades to a drawn plate, never a broken image.
- **Placement figures** are a snapshot of a season that was still running
  ("66% (Ongoing)"); update `src/content/outcomes.ts` when it closes.
- **CODE APEX 3.0** dates and links are in `src/content/events.ts`; the countdown
  switches to "in progress" by itself when the finale starts.

---

## Things that are the way they are on purpose

- **Nothing above the fold waits for JavaScript.** Hero entrances are CSS (`.rise`);
  `[data-reveal]` elements only start hidden once an inline head script has marked
  the page as scripted, so a no-JS visitor sees everything.
- **Every animation stops under `prefers-reduced-motion`.** The Neural Core renders a
  single still frame, the decode effect is skipped, the boot sequence never shows.
- **No `backdrop-filter` on cards.** The atmosphere behind them is animated; blurring
  it per card would re-rasterise every frame. Blur is kept for the header and overlays.
- **The page transition animates opacity only.** A transform or filter on a page
  wrapper would become the containing block of the fixed Neural Core canvas.
- **The contact form opens the visitor's email app.** There is no backend that
  could silently drop a message.
