# Jarvees Academy — Design Plan

**Concept name: System Landscape.**

---

## 1. The idea

A student learning SAP is learning to read a machine that runs a company. The
native visual language of that world is the *system landscape diagram*: boxes
that are modules, lines that are real integrations, codes that are real
transactions, and a legend that tells you how to read it. It is schematic,
structured, load-bearing, and completely unlike the visual language of an
education marketing site.

So the site is drafted as an enterprise architecture document that has been
art-directed to museum standard. Structure is visible and does work: modules sit
on a schematic grid, the connections between them are actually drawn, and a
reader can trace a path from *learner → module → live project → role*.

The test applied to every decision: **does this encode something true about
enterprise systems, or is it decoration that could sit on any site?** Anything
in the second category was cut.

---

## 2. Palette — 6 named values

Deep, cool, genuine-blue near-black. Not `#000`, not Tailwind's `slate-900`.
Elevation is expressed as a few percent luminance, never as a drop shadow.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#080C14` | Base plane. Blue-black; a hair of blue in the blacks so the whole page reads cool rather than muddy. |
| `--graphite` | `#0F1420` | Elevated plane 1 — cards, the header bar, form wells. |
| `--slate` | `#171E2C` | Elevated plane 2 — the plane a hovered/active node sits on. |
| `--steel` | `#7C8CA8` | Secondary text, schematic rules, node borders. Desaturated blue-gray — the colour of a technical drawing, not a UI framework. |
| `--signal` | `#FFB000` | **Amber.** The single accent. Active node, live-data pulse, primary CTA. |
| `--paper` | `#E9EBF0` | Cool paper. The inversion plane for `/courses`. |

Support values derived from these, not new hues: `--hairline #232C3E` (1px
structure lines on dark), `--steel-dim #5D6C86` (non-text rules only),
`--chalk #E4E8F0` (body text on dark), `--paper-alt #DCDFE7` (raised plane on
paper).

### Why amber, specifically

The accent had to be one saturated signal colour and it had to be *defended*.
Amber `#FFB000` is the phosphor colour of the monochrome terminals that
enterprise resource planning was actually born on — the register of industrial
instrumentation, before ERP had a GUI. It carries "live system, value in a
field, status indicator" natively. It is also, usefully, none of the things the
brief rules out: not ed-tech purple-blue, not acid green, not terracotta, and
critically **not SAP's own brand blue** — using SAP blue as our accent would
visually imply the partnership we are explicitly forbidden from claiming. Amber
is the accent that is both true to the subject and legally safest.

### Verified contrast (WCAG 2.1, computed not assumed)

| Pair | Ratio | |
|---|---|---|
| chalk on ink / graphite / slate | 15.9 / 15.0 / 13.6 | AAA |
| steel on ink / graphite / slate | 5.75 / 5.41 / 4.91 | AA |
| ink/65 · ink/70 on paper | 5.80 · 6.88 | AA |
| amber on ink / graphite / slate | 10.7 / 10.0 / 9.11 | AAA |
| ink on amber (button fill) | 10.7 | AAA |
| ink on paper / paper-alt | 16.4 / 14.7 | AAA |
| steel-dim on ink | 3.69 | **non-text only** — rules, borders |

**Correction made during build.** `steel-dim` is listed above as non-text, and
the first pass then used it as text in 76 places — small mono labels, mostly.
The audit caught it. Rather than lighten the token until it passed (which would
have collapsed it into `steel` anyway), every text use moved to `steel` and
`steel-dim` is now strictly rules and borders. The lesson is in the token
comment now: **AA on a dark plane leaves no room for a third legible tone**, so
the third level of hierarchy is carried by size, case and tracking — the mono
label — not by a dimmer colour.

**Hard rule, discovered by measurement:** amber on paper is **1.54:1**. On the
light plane amber may only appear as a *fill with ink text on top*, or as a
rule/marker — never as text, never as a link colour. This is encoded as a
comment on the token and there is no utility class that would let it happen by
accident.

---

## 3. Typography — three roles

Self-hosted through `next/font` (fonts are downloaded and served from our own
origin at build time — no render-blocking third-party stylesheet, no CLS).

**Display — Archivo.** A neo-grotesque with genuine personality at large sizes.
Set at 700 with tracking pulled to `-0.035em`, it reads as engineered signage —
the lettering of a technical drawing or a plant schematic — not as a marketing
headline. Used with restraint, at four sizes only.

*Revised during build.* This originally specified Archivo **Expanded**, loading
the family's width axis and setting headings at `wdth 108–112`. The axis was
dropped after measurement. Loading it took the face from 35KB to 90KB and cost
roughly four Lighthouse mobile points — it is large enough that it arrives late,
reflows the headline and re-triggers largest-contentful-paint — and no preload
configuration recovered them. What it bought was an 8–12% width change that a
designer would notice and a visitor would not. For an audience largely on Indian
mobile networks that is the wrong trade, so the axis went and the rationale is
corrected rather than quietly left standing. Archivo still earns its place on
weight, tracking and its behaviour at display sizes; it was never the AI-default
pick, with or without the axis.

**Body — Public Sans.** Humanist, variable 100–900, drawn for the US Web Design
System, so it is engineered for exactly our problem: long-form legibility at
16–18px on screen with a wide weight range and unusually clear numerals. It is
quiet next to Archivo Expanded, which is what a support face should be. It is
also not the face every AI-built site reaches for.

**Utility / data — IBM Plex Mono.** This is the choice that carries the concept.
In the SAP world **monospace is the native register** — transaction codes,
table names, batch timings, durations, module codes all live in it. Plex Mono
was drawn by IBM for enterprise systems, which is the same lineage as the
subject. Applied to: module codes (`FICO`, `MM`, `SD`), transaction codes
(`ME21N`, `VF01`), durations, batch dates, section numbering, and every label in
the module map. Uppercase, `0.12em` tracking, at `0.6875–0.75rem`.

### Type scale (explicit, not derived at call sites)

| Token | Size | Weight / width | Tracking | Leading |
|---|---|---|---|---|
| `display-xl` | `clamp(2.25rem, 4.6vw, 3.75rem)` | 700 | `-0.035em` | 0.94 |
| `display-l` | `clamp(1.85rem, 3.4vw, 2.75rem)` | 700 | `-0.03em` | 1.0 |
| `display-m` | `clamp(1.6rem, 2.8vw, 2.25rem)` | 600 | `-0.02em` | 1.08 |
| `heading` | `1.25rem` | 600 | `-0.01em` | 1.3 |
| `body-l` | `1.125rem` | 400 | `0` | 1.7 |
| `body` | `1rem` | 400 | `0` | 1.65 |
| `micro` | `0.75rem` | 500 | `0.12em` | 1.4 |
| `mono-label` | `0.6875rem` | 500 | `0.14em` | 1.4 |

Spacing rhythm is a 4px base with a named step scale; section vertical rhythm is
`clamp(5rem, 10vw, 9rem)` so the generosity survives at 1440.

---

## 4. Signature element — **The Module Map**

One bold thing. Everything around it stays quiet.

A schematic node graph of the SAP landscape rendered in SVG, in which **the
integration lines are the real ones**:

```
                    ┌──────────┐
                    │   HANA   │  in-memory database
                    └────┬─────┘
                         │ runs only on
                    ┌────▼─────┐        ┌──────────┐
                    │ S/4HANA  │◄───────┤   ECC    │  migration path
                    └────┬─────┘        └──────────┘
          ┌──────────────┼──────────────┐
     ┌────▼───┐     ┌────▼───┐     ┌────▼───┐
     │   MM   │─────│  FICO  │─────│   SD   │
     └────────┘  ▲  └────────┘  ▲  └────────┘
                 │              │
    goods receipt + invoice   billing document
    verification post an      posts to accounts
    accounting document       receivable
     ┌──────────────────────────────────────┐
     │  ABAP  — extends all of the above    │
     ├──────────────────────────────────────┤
     │  Basis — transports all of the above │
     └──────────────────────────────────────┘
```

Every edge is factually true and is labelled with *why* it exists:

- **MM → FICO** — a goods receipt posts an accounting document; invoice
  verification creates the vendor liability against GR/IR clearing.
- **SD → FICO** — a billing document posts to accounts receivable.
- **SD → MM** — availability check reads stock; delivery reduces inventory.
- **ABAP → MM, SD, FICO** — the layer every module is extended in.
- **Basis → everything** — moves configuration and code DEV → QAS → PRD.
- **HANA → S/4HANA** — S/4HANA runs only on HANA.
- **ECC → S/4HANA** — the generation being migrated from.

Focusing or hovering a node reveals: what the module does in a business, the
role it maps to on a project, and its **real transaction codes** (`ME21N`,
`MIGO`, `MIRO` / `VA01`, `VF01` / `F-02`, `FS00` / `SE38`, `SE11` / `STMS`,
`SM59`). Activating a node navigates to that course.

**Why this and not something prettier:** it teaches something true in the first
ten seconds. A visitor who has never seen SAP leaves the hero understanding that
SAP is not one thing but a set of integrated modules, and that the integrations
are the substance. That is exactly what a training institute should demonstrate
rather than assert.

**Interaction contract:** mouse hover, touch tap, and keyboard all reach the
same state. Each node is an ordinary `<a>`; hovering or focusing one reveals
its detail, activating it opens the course. The detail panel is an
`aria-live="polite"` region, so tabbing through the map announces to a screen
reader user exactly what a sighted user sees appear.

*Revised during build:* the plan originally specified a single tab stop with a
roving-tabindex radiogroup and arrow-key movement. Building it made the case
against clear — this is eight navigational links, not a composite widget, and
wrapping them in a roving tabindex would take a proper list of eight modules
away from a screen reader user and replace predictable Tab behaviour with
custom key handling, for no gain. Plain links are the more accessible choice
here, so the widget was dropped. Under `prefers-reduced-motion: reduce` the
intro sequence and the node pulse are removed and states change instantly.

---

## 5. Layout system

A **12-column grid with a persistent left gutter rail** running the full page —
a 1px steel-dim vertical rule set in from the edge, with mono section numbers
and section labels hung on it. It is the drawing-sheet margin from a technical
document, and it does real work: it gives every page a spine, makes section
boundaries legible while scrolling, and lets sections be numbered without
resorting to decorative `01 / 02 / 03` markers. (Numbered markers appear in
exactly one place on the site — the enrolment process on `/contact` — because
that content genuinely is a sequence.)

Corners are `2px`, effectively square but not aggressively so. Elevation is
luminance, never shadow. Borders are 1px `--hairline`, and they are used
structurally — a card is a *cell in a schematic*, so it shares edges with its
neighbours rather than floating apart with a gap.

### The inversion

`/courses` renders on `--paper`, and is the one page that drops the gutter rail. The catalogue is a *document* — a specification
sheet you scan and filter — not an interface. Inverting it makes the dark of the
other seven routes read as a deliberate choice rather than a habit, and it gives
the site a second gear. `/courses/[slug]` returns to ink, because a course page
is again a landscape you are being walked through.

### Home wireframe

```
│01│  ┌────────────────────────────────────────────────────────────┐
│  │  │ SAP AND ENTERPRISE TECHNOLOGY          ┌─────────────────┐  │
│H │  │ TRAINING IN PUNE, SINCE 2015           │                 │  │
│E │  │                                        │   MODULE MAP    │  │
│R │  │ Classroom at two centres, or online.   │   (signature)   │  │
│O │  │ Every course ends in a live project.   │                 │  │
│  │  │                                        │  ○───○───○      │  │
│  │  │ [ Send enquiry ]  [ Browse courses ]   │   ╲  │  ╱       │  │
│  │  │                                        │      ○          │  │
│  │  └────────────────────────────────────────┴─────────────────┘  │
│  │  ── SINCE 2015 ─ ISO 9001:2015 ─ 4.5★ (59) ─ 2 CENTRES ─ ONLINE+CLASSROOM ──
│02│  ┌──────────┬──────────┬──────────┬──────────┐
│TR│  │ SAP      │ ENTERPRISE│ DATA     │ ENG & QA │   shared edges,
│AC│  │ 8 courses│ PLATFORMS │ 1 course │ 5 courses│   no gaps
│KS│  └──────────┴──────────┴──────────┴──────────┘
│03│  HOW YOU LEARN HERE   ── three concrete steps, mono-numbered,
│  │  connected by a drawn rule, ending at "live project"
│04│  DELIVERY MODES  ── online │ classroom, compared honestly in a
│  │  two-column table, not sold
│05│  REVIEWS  ── verbatim, attributed "Verified review, JustDial"
│06│  CENTRES  ── two cells: Narhe / Tilak Road, address + phone + map link
│07│  ENQUIRY  ── amber CTA on ink
```

### Course detail wireframe

```
│  │  ┌ FICO ┐ mono module code chip
│01│  SAP FICO
│  │  Financial accounting and controlling
│  │  ── mono spec row ────────────────────────────────────────────
│  │  DURATION {{...}} │ MODE Online + classroom │ LEVEL Beginner
│  │  ────────────────────────────────────────────────────────────
│02│  OVERVIEW / WHO IT IS FOR        ← 8 cols        ┌─ sticky ─┐
│03│  CURRICULUM  ── expandable outline, one row       │ Enquire  │
│  │     per module, mono index, real sub-topics       │ about    │
│04│  LIVE PROJECT (this module specifically)          │ SAP FICO │
│05│  PREREQUISITES ── truthful, not "none!"           │          │
│06│  WHAT YOU RECEIVE                                 │ [form]   │
│07│  CERTIFICATION NOTE ── academy cert ≠ SAP exam    └──────────┘
│08│  RELATED COURSES ── drawn from the real integration edges,
│  │     not a random slice of the catalogue
```

Related courses are chosen from the module map's real adjacency — MM's related
courses are FICO and SD *because those are the modules it integrates with*. The
signature element's data model feeds the page structure. That is what makes it a
concept rather than a graphic.

---

## 6. Motion

Few, orchestrated, and all of it removable.

1. **One page-load sequence**, home hero only: rule draws in, headline rises,
   then the map's edges trace and nodes settle. Once, ~900ms total.
2. **Scroll reveals**: an 8px rise plus fade, `once: true`, on section
   headers only — never on every card, never repeating on a scroll pass.
3. **Signature hover**: node fill and edge highlight, 140ms.
4. **The only looping animation on the site** is a slow 3s amber pulse on the
   map's active node — the "live system" tell. It is one element.

`prefers-reduced-motion: reduce` disables all four, verified by a global CSS
override in addition to per-component guards, so a component added later cannot
reintroduce motion by forgetting to check.

---

## 7. Stage 2 — critique of this plan

*What would a generic AI produce for "premium SAP training website"?* Honestly:
a near-black page, a blue-to-purple gradient hero, a floating 3D cube or
particle-network canvas, glassmorphic cards with `backdrop-blur` and a 16px
radius, Inter throughout, `01 / 02 / 03` numbered feature cards, a logo wall of
invented hiring partners, a stat row reading "5000+ students trained · 95%
placement · 200+ hiring partners", three testimonials with stock-photo faces and
invented names, and everything animating on every scroll.

Auditing this plan against that, five things needed changing before any code was
written:

**1. The accent was originally SAP blue.** My first instinct was a saturated
blue cyan for the "live" colour. Cut for two reasons: it sits in the exact
purple-blue ed-tech band the brief bans, and more seriously, dressing the site
in SAP's own brand colour visually implies an official partnership we are
legally forbidden from claiming. Replaced with amber, which is defensible on
subject grounds *and* is the safer trademark position.

**2. The stat row was going to be a stat row.** Four big numbers is the generic
move, and here it is also the dangerous one — it is precisely the component that
tempts invented figures. Replaced with a single typographic proof strip carrying
only verifiable facts (2015, ISO 9001:2015, 4.5★/59, two centres, both delivery
modes). No number appears anywhere on the site that cannot be sourced; where the
client must supply one it is a visible `{{TOKEN}}`, not a plausible guess.

**3. Cards were floating with gaps and shadows.** Generic. Changed to cells
sharing 1px hairline edges — a schematic table, not a card deck. Elevation is
luminance only; there is no `box-shadow` in the token layer at all, which makes
the generic version unreachable rather than merely discouraged.

**4. `01 / 02 / 03` markers were going to be everywhere.** They are the default
"premium" tell. Restricted to the one place the content is genuinely ordered
(the enrolment steps). The *sequencing* job they were doing is now done by the
left gutter rail, which is both more distinctive and structurally useful.

**5. The module map was decorative.** The first version was a pretty node graph
with arbitrary edges — subject-flavoured decoration. Fixed by making every edge
a real integration with a stated business reason, every node carry real
transaction codes, and the adjacency data actually drive the related-courses
logic on course pages. If the diagram were wrong, a working SAP consultant would
spot it in five seconds; that constraint is what makes it worth building.

**Remaining risk, accepted:** amber on deep blue-black is a strong,
non-neutral choice, and if used at more than roughly 5% coverage it will read as
"warning state" rather than premium. Mitigation is a hard budget — amber appears
on a page in at most three places: the primary CTA, the active map node, and the
gutter rail's current-section marker. It is never a body-text colour, never a
heading colour, and never a background for a large area. This is the discipline
the whole design depends on.

---

## 8. Stage 7 — final critique

Screenshots taken at 320, 375, 768, 1024 and 1440, then looked at cold.

### What the build changed, and why

Six things moved between the plan and the finished site. All six are recorded
above at the point they apply; collected here so the pattern is visible.

1. **The signature element's interaction model.** Planned as a roving-tabindex
   radiogroup, built as eight plain links. Building it made the case against
   clear: this is navigation, not a composite widget, and the widget version
   would have taken a proper list of eight modules away from a screen reader
   user in exchange for custom key handling.
2. **The display face lost its width axis** — 55KB and four mobile Lighthouse
   points for a width change nobody would consciously see.
3. **`steel-dim` stopped being a text colour**, because AA on a dark plane does
   not leave room for three legible tones.
4. **Three paper-plane opacities were too light** (`ink/40`, `/45`, `/55` all
   measured between 3.0 and 4.2:1) and moved to `ink/65`.
5. **The focus ring moved out of `@layer base`** to unlayered CSS, after
   discovering that Tailwind's `transition-colors` animates `outline-color` and
   was making the indicator fade in over 140ms.
6. **The catalogue reads `?track=` from `window.location`, not
   `useSearchParams`** — the hook makes the route dynamic, and a dynamic route
   streams its metadata into the body instead of the head. It cost the page its
   meta description before this was caught.

The common thread: every one of them was found by measuring rather than by
looking. The palette contrast table, the Lighthouse runs, the overflow sweep and
the keyboard walkthrough each caught something that reading the code would not
have.

### Remove one thing

The header carried a mono strapline under the wordmark — *SAP & enterprise
technology*. It is gone.

It repeated what the `h1` of every page already says, it made a sticky header
taller on precisely the screens with least vertical room, and it was the only
part of the chrome doing decoration rather than work. The header now holds one
idea: the mark, the name, the navigation.

### Does it pass its own test?

The test set in §1 was: *does this encode something true about enterprise
systems, or is it decoration?*

The module map earns it — every edge is a real integration with a stated
business reason, every code is a real transaction code, and the same adjacency
data drives the related-courses logic on course pages, so the diagram is load-
bearing rather than illustrative. The mono register earns it, because
monospace is genuinely the native typography of transaction codes and table
names. The gutter rail earns it as a drafting-sheet margin that also does the
sectioning work decorative `01 / 02 / 03` markers would otherwise do.

The amber is the one element that has to keep earning it. It is defensible on
subject grounds (phosphor terminals) and on trademark grounds (it is
conspicuously not SAP blue), but it only reads as premium while it stays rare.
The three-per-page budget is the whole thing holding that in place.

### What would be done next, with more of the client's input

- Real photography of both centres, particularly the street-level entrance shots — the single highest-value images the site could gain.
- Fees and batch dates, which would let the 30 `{{TOKEN}}` placeholders go and remove the only visible "to be confirmed" text on the site.
- A trainer page, if the academy is willing to publish named profiles. It is the strongest available proof and the site currently has to promise it "on request".


---

## 9. Revision — the animated rebuild

The first build was reviewed by the client as *"very very basic"*, against a
brief that asked for premium, extensive and animated. That judgement is
accepted: §3 of this plan read "engineered restraint" as a licence to remove,
and the result was correct, quiet, and underwhelming. Restraint is a means to
emphasis, not a substitute for it. A page with nothing to look at is not
disciplined — it is unfinished.

What changed, and what deliberately did not.

### The concept did not change

Still the system landscape. Still amber on blue-black, still the mono data
register, still the gutter rail, still no drop shadow. The rebuild adds
*depth and light* to that language rather than replacing it, so the site is
richer without becoming any other institute's site.

### What was added

**A visual layer** (`src/components/visual/Ambient.tsx`) — drifting aurora
light with amber against a cool counter-light so dark planes are lit from two
sides; a drafting grid masked to dissolve at its edges; fixed film grain over
the viewport; corner registration marks; hairlines that fade out rather than
stopping dead.

**Glow, not shadow.** The no-shadow rule survives, and the distinction is the
point: elevation is still luminance, but the accent now *emits* light. A card
is lit, never stacked.

**A motion library** (`src/components/motion/`) — reveals, stagger groups,
masked word-rise headlines, counters, terminal-style label decoding,
cursor spotlights, magnetic controls, parallax, a scroll-progress rail and a
marquee.

**The module map became alive.** Edges draw themselves along their own length
and a packet of light runs each integration touching the active module. The
motion is doing the teaching: the eye is pulled along exactly the relationship
being described.

**More content**, because "extensive" was a fair criticism too: an FAQ with
`FAQPage` structured data, a figures band, a course marquee, and a six-point
differentiators grid.

### Three rules the motion had to obey

**1. Nothing above the fold may depend on JavaScript.** The scroll-reveal
components start their subject at `opacity: 0` and wait for hydration plus a
viewport observer. Used in the hero, that measured as a **3.2s
largest-contentful-paint render delay** on a throttled phone — the headline
paragraph sat invisible waiting for a script. The hero now uses CSS-only
equivalents (`motion/Rise.tsx`) that start at first paint and ship no client
JavaScript at all. Mobile home went 87 → 96 on that change alone.

**2. Motion must not animate through a false claim.** A counter run at a 4.5
rating displays "4.4 / 5" for most of a second. An almost-right rating is a
wrong claim, briefly, and briefly is enough. Ratings are now *stated*, and
`RatingBar` carries the motion instead — a partially-drawn bar reads as "still
drawing", where a wrong number just reads as a wrong number. Counters are
pointed only at quantities, and each reserves its final width so "0" growing
to "2015" cannot shove the layout.

**3. Reduced motion must land on the finished state.** Every primitive answers
`useReducedMotion` first and returns the completed element, never the initial
frame. Verified: with the query set, zero elements animate and zero content is
left below full opacity.

### Measured cost

Desktop 99–100 and mobile 95–99 on performance; 100 on accessibility, best
practices and SEO across all nine routes. Home cumulative layout shift went
0.041 → 0.002 after fixing the map's nodes, which were content-sized and so
resized about their own centres whenever a web font swapped in.

### Still absent, still on purpose

None of the claims discipline moved. No invented statistic gained a counter,
no testimonial gained a face, and the FAQ answers the unprofitable questions —
no job guarantee, no SAP partnership, what ISO 9001 does and does not certify —
in the plainest words available.
