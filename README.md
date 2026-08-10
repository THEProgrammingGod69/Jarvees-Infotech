# Jarvees Academy

Marketing website for Jarvees Academy — an SAP and enterprise technology
training institute in Pune, operating since 2015 from two centres.

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Framer Motion.

- **`DESIGN.md`** — the design plan: palette, typography, the signature element, and a record of the decisions that changed during the build and why.
- **`CONTENT-TODO.md`** — everything the academy must supply or confirm before launch. **Read this before deploying.**

---

## Local development

```bash
npm install
cp .env.example .env      # optional for local work; see "Enquiry form" below
npm run dev               # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Node 20 or newer.

---

## Editing content

### Adding or changing a course

Every course is one file in `src/content/courses/`. To add one:

1. Copy any existing file in that folder — `sap-mm.ts` is a good full example, `java.ts` a good shorter one.
2. Change the values. The shape is documented in `src/content/types.ts`.
3. Add one import and one array entry in `src/content/courses/index.ts`.

That is the whole job. The catalogue, the filters, the detail page, the
sitemap, the footer, the related-course links and the structured data all read
from that one file.

**If you do not know a duration or a batch timing, leave the `{{TOKEN}}` in
place.** It renders as a quiet "To be confirmed" rather than a made-up number,
and `CONTENT-TODO.md` lists every one of them. Do not replace a token with a
guess.

### Changing addresses, phone numbers, hours or the rating

All of it lives in one file: **`src/lib/site.ts`**. It is the single source of
truth, and the structured data reads from the same constants as the visible
page — so updating the rating there updates the footer and the
`AggregateRating` schema together, and they cannot drift apart.

### Adding a photograph

The site ships no photographs. Every image is a **slot** declared in
`src/content/images.ts` with its dimensions fixed up front; until a slot has a
file it renders an on-brand drafting plate at exactly the right size. To supply
one, drop the file in `public/` and set `src` on the matching slot. Nothing else
changes, and because the box was already the right shape, adding the photograph
cannot shift the page.

Alt text is written on the slot, so it can never be left as a filename.

### Changing the module map

`src/content/landscape.ts` holds the nodes and the integration edges behind the
map on the home page. Every edge describes a real SAP integration and carries
the reason it exists. This file also drives the "related courses" on each SAP
course page — MM's related courses are FICO and SD because those are the
modules it actually integrates with. **If you edit this file, keep it accurate**;
its whole value is that a working SAP consultant would recognise it as correct.

---

## Enquiry form

Form submissions post to the route handler at `src/app/api/enquiry/route.ts`,
which forwards to whichever provider is configured by environment variable.
Configure exactly one:

**Formspree** — no server secret needed:

```
NEXT_PUBLIC_FORMSPREE_ID=xxxxxxx
```

**Resend** — server-side only:

```
RESEND_API_KEY=re_xxxxxxxx
ENQUIRY_TO_EMAIL=jarveesacademy.pune@gmail.com
ENQUIRY_FROM_EMAIL=enquiries@jarveesacademy.com
```

Behaviour when nothing is configured is deliberate: in development the enquiry
is logged to the console and the form reports success; **in production the form
returns a 503 and tells the visitor to call instead.** It never shows a success
message for an enquiry that went nowhere.

Anti-spam is a honeypot field — no CAPTCHA. Someone trying to book a course
should not have to prove anything.

Never commit a real `.env`. `.env*` is gitignored; `.env.example` is the
template.

---

## Deploying

Vercel, with no special configuration — there is no `vercel.json` because
nothing needs overriding.

1. Import the repository.
2. Set the environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to `https://www.jarveesacademy.com` — canonical URLs, the sitemap, and the structured data all derive from it.
4. Deploy, then submit `/sitemap.xml` to Google Search Console.

`sitemap.xml` and `robots.txt` are generated at build from the course registry,
so a new course appears in the sitemap automatically.

---

## Things that are the way they are on purpose

Short list, so nobody "fixes" one of them by accident.

**No hex values in components.** Every colour, type step and spacing value is a
token in `src/app/globals.css`. There is deliberately no shadow token, because
elevation on this site is expressed as luminance — which means "floating card
with a drop shadow" is unreachable rather than merely discouraged.

**`--color-steel-dim` is never used as text.** It measures 3.69:1 on the base
plane, which is fine for rules and borders and fails for text. The third level
of typographic hierarchy is carried by size, case and tracking, not by a dimmer
colour.

**Amber is never text on the light plane.** It measures 1.54:1 on `--color-paper`.
On `/courses` it may only appear as a fill with ink text on top.

**The amber budget is three elements per page.** Primary CTA, active map node,
current-section marker. Amber at more than about 5% coverage stops reading as
premium and starts reading as a warning state.

**The focus indicator is unlayered CSS.** It sits outside `@layer` in
`globals.css` on purpose: unlayered author styles beat every cascade layer, so
no Tailwind utility can weaken the focus ring. (`transition-colors` includes
`outline-color`, which made the ring fade in until this was moved.)

**`/courses` reads `?track=` from `window.location`, not `useSearchParams`.**
The Next hook would opt the route out of static generation, and a dynamically
rendered page streams its metadata into the body instead of the head — measured,
and it cost the page its meta description.

**Open Graph cards are generated, not designed by hand.** Every page produces
its own at build. Course cards read the landscape data, so an SAP course's card
lists the modules it genuinely integrates with — the same true thing the map on
the home page shows.

**The claims discipline is a compliance boundary, not a tone.** No placement
guarantee, no SAP partnership claim, no invented statistics, no unverifiable
testimonials. `CONTENT-TODO.md` §5 lists what is deliberately absent. Please
read it before adding anything to those areas.

---

## Verified quality floor

Measured against a production build, all nine routes:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 96–99 | 100 | 100 | 100 |

Cumulative layout shift is 0 (≤0.03 on the two routes with embedded maps). No
horizontal overflow at 320, 375, 768, 1024 or 1440px. `prefers-reduced-motion:
reduce` removes all animation with nothing left mid-transition. Every module on
the map is reachable by keyboard, with an amber focus ring on all tab stops.
