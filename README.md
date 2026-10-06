# CSE (AI) · VIT Pune

Website for the **Department of Computer Science & Engineering (Artificial
Intelligence), Vishwakarma Institute of Technology, Pune**.

Next.js 15 (App Router, static export) · TypeScript (strict) · Tailwind CSS v4 ·
GSAP 3 (loaded on demand) · CSS scroll-driven animations · WebGL in a Web Worker.

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
| `npm run build` | Production build → plain static files in `out/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Node 20 or newer. To preview the production build: `npm run build && npx serve out`.

## Deploy

The build is a folder of static files (`out/`). There is no server, no
database and no function to cold-start, so there is nothing to keep running,
patch or scale: a CDN serves the same files to one visitor or ten thousand at
once, and nothing can go down under load except the host itself.

**Vercel (recommended)** — import the repository; no settings needed. The
production domain is picked up automatically for canonical URLs and the
sitemap. Caching and security headers come from `vercel.json`.

**Netlify / Cloudflare Pages** — build command `npm run build`, publish
directory `out`. Headers come from `public/_headers` (copied into `out/`).

**Any web server (e.g. the institute's own)** — run
`NEXT_PUBLIC_SITE_URL=https://your.domain npm run build` and copy `out/` to the
web root. For nginx:

```nginx
location /_next/static/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location /images/       { add_header Cache-Control "public, max-age=31536000, immutable"; }
location / {
  try_files $uri $uri/index.html =404;
  add_header Cache-Control "public, max-age=0, must-revalidate";
}
error_page 404 /404.html;
gzip on; gzip_types text/css application/javascript image/svg+xml application/json;
```

Set `NEXT_PUBLIC_SITE_URL` to the public address on any host that is not
Vercel, Netlify or Cloudflare Pages — the build prints a warning if it cannot
work the address out. File names under `/_next/static/` and `/images/` carry
content hashes, so they are cached forever and a new deployment can never
serve a stale script or photo; HTML always revalidates.

---

## Routes

| Route | What is on it |
|---|---|
| `/` | Hero whose headline is pulled into the Neural Core on scroll, stats, attention-scrubbed vision quote, the pinned four-year "forward pass", labs, a throwable achievements rail, recruiters, CODE APEX 3.0 split-flap countdown, stacked testimonials |
| `/about` | Vision, mission, PEOs, Head's message, mentors, institute credentials, POs/PSOs |
| `/programme` | Curriculum explorer (Modules III–VIII), a scroll-scrubbed gradient-descent training run, final-year tracks, certifications, electives, syllabus PDFs |
| `/faculty` | Head of Department, filterable faculty directory, mentors |
| `/research` | Research-domain constellation, filterable patent board, publications, industry projects, student patents |
| `/placements` | AY 2025–26 summary, best offer per company, internship stipends, recruiters |
| `/labs` | Building that assembles as you scroll, the four labs with seat maps, spaces |
| `/events` | CODE APEX 3.0 (countdown, stages, prizes), event log, achievement wall |
| `/students` | AISF, testimonials, social impact, student patents |
| `/contact` | Channels, compose-an-email form, map (loaded on request) |

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

### Photos

Photos are self-hosted. Put the original in `assets/photos/` and run:

```bash
npm i --no-save sharp && node scripts/optimize-images.mjs
```

It writes resized WebP files (with content hashes in their names) to
`public/images/` and the manifest `src/content/photos.generated.ts`; refer to
a photo by its file name without extension (`photo: "lab-innovation"`).

### Fonts

The three typefaces are subset to exactly the characters the site uses
(`src/fonts/`, built by `scripts/subset-fonts.py`). If new text needs a script
they do not cover, add its Unicode range in that script and run it again:

```bash
python3 -m pip install fonttools brotli && python3 scripts/subset-fonts.py
```

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
- **Placement figures** are a snapshot of a season that was still running
  ("66% (Ongoing)"); update `src/content/outcomes.ts` when it closes.
- **CODE APEX 3.0** dates and links are in `src/content/events.ts`; the countdown
  switches to "in progress" by itself when the finale starts.

---

## Performance

Measured on the same machine before and after the performance rebuild
(Lighthouse 12, simulated mobile and desktop; scroll benchmark = steady
1600 px/s scroll in a software-rendered Chromium, so only the comparison is
meaningful):

| | Before | After |
|---|---|---|
| Home — Lighthouse performance (mobile / desktop) | 50 / 68 | 93–94 / 100 |
| Inner pages — performance (mobile / desktop) | 77–91 / 95–97 | 94–96 / 99–100 |
| Accessibility · Best practices · SEO | 96 · 100 · 100 | 100 · 100 · 100 (and 0 axe-core WCAG 2.2 AA issues) |
| Home — total blocking time (mobile) | 1,585 ms | 74–118 ms |
| Scroll frame rate, home / about / events (software compositing) | 7 / 7.7 / 7.1 fps | 48 / 59.6 / 55.4 fps |
| Long tasks while scrolling the home page | 1 (315 ms) | 0 |
| Fonts downloaded on a page with prices | ~245 KB | 87 KB |

What made the difference is listed in `DESIGN.md` → *Performance*.

---

## Things that are the way they are on purpose

- **Nothing above the fold waits for JavaScript.** Hero entrances are CSS (`.rise`);
  `[data-reveal]` elements only start hidden once an inline head script has marked
  the page as scripted, so a no-JS visitor sees everything — full faculty, patent
  and achievement lists included.
- **Every animation stops under `prefers-reduced-motion`.** Scroll-driven effects
  are off, GSAP never loads, reveals show their final state, the core is still.
- **No `filter`, `backdrop-filter` or `mix-blend-mode` over moving content.** They
  force the browser to re-rasterise every frame; they were the main cause of the
  old site's lag.
- **The page transition animates opacity only.** A transform or filter on a page
  wrapper would become the containing block of the fixed Neural Core canvas.
- **The map loads on request.** Google Maps is over a megabyte of third-party
  script; the contact page shows a plate with a button and a plain link instead.
- **The contact form opens the visitor's email app.** There is no backend that
  could silently drop a message.
