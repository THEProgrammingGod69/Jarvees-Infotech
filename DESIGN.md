# CSE (AI) · VIT Pune — Design notes

**Concept: The Forward Pass.**

A degree in this department is built like the networks it teaches: an input
layer (the common first year), two hidden layers of increasing depth (second and
third year), and an output (final year). The site is drawn the same way. Its
signature — the **Neural Core** — is a cloud of particles that re-forms as the
reader scrolls: a brain in the hero, a sphere behind the numbers, a galaxy behind
the vision, then a data field, a literal feed-forward network, a torus knot and
finally the letters "AI" as the four years go by.

The test for every flourish: *does it say something about how intelligence is
built?* Decode-on-reveal headings (a signal resolving), a terminal that types the
mission, signal pulses travelling along curriculum synapses, a constellation of
research domains — each one maps to the subject. Decoration that could sit on any
site was cut.

---

## Palette

A blue-violet black with two signals. Elevation is luminance plus a hairline —
there is no shadow token.

| Token | Hex | Role |
|---|---|---|
| `void` | `#04050B` | Base plane |
| `deep` | `#080B16` | Header, wells |
| `panel` | `#0E1325` | Cards |
| `raise` | `#141A30` | Hover / active |
| `line` / `line-bright` | `#1B2340` / `#2B3760` | Structure |
| `frost` | `#E8EDFF` | Primary text |
| `haze` | `#93A0C4` | Secondary text |
| `dim` | `#5F6A8A` | **Non-text only** |
| `cyan` | `#5CE1FF` | Primary signal; the only button fill |
| `violet` | `#A68BFF` | Depth in gradients |
| `magenta` | `#FF5CAD` | Reserved for *live* states |

Measured contrast (WCAG 2.1) on `void` / `panel`:

| Pair | Ratio |
|---|---|
| frost | 17.4 / 15.8 |
| haze | 7.8 / 7.1 |
| cyan | 13.3 / 12.0 |
| violet | 7.5 / 6.8 |
| magenta | 7.2 / 6.5 |
| void on cyan (button) | 13.3 |
| dim | 3.79 — rules and borders only |

## Type

- **Unbounded** (display) — wide, geometric, engineered; reads as instrument
  signage at large sizes without tipping into sci-fi cliché.
- **Manrope** (body) — open and legible at 15–18px; quiet next to Unbounded.
- **JetBrains Mono** (labels) — codes, indices and HUD readouts: course codes like
  `CI3009`, section indices, coordinates. Uppercase, `0.16em` tracking.

Self-hosted through `next/font`; only the body face is preloaded.

## Motion

| Effect | Where | Implementation |
|---|---|---|
| Neural Core | Home | Raw WebGL 1, two shaders, ~20k points; shapes swapped by `<CoreStage>` at the viewport's centre line; mid-flight morphs snapshot so fast scrolling never jumps |
| Neural mesh | Inner heroes, 404 | 2D canvas plexus; paused off-screen and in hidden tabs |
| Decode headings | Every section | Time-based, ~0.5s, aria-hidden twin of the real text |
| Reveals | Below the fold | One IntersectionObserver for all `[data-reveal]` |
| Spotlight, tilt, magnetic, cursor ring | Cards, buttons | One delegated pointer listener — no card is a client component |
| Counters, bars, seat maps | Stats, charts | Count/grow on reveal; server renders final values |
| Boot sequence | First page of a visit | Pure CSS, self-dismissing |
| Command palette, menus, tabs | Global | Framer Motion |

Performance rules: compositor-only properties for anything continuous (the grid
drifts by `transform`, never `background-position`); no backdrop blur over animated
layers; device pixel ratio capped at 1.75 for WebGL; fewer particles on small or
low-core devices; every loop stops when its canvas leaves the screen or the tab hides.

## Claims discipline

Every number on the site traces to a published department or institute page.
Totals are only shown when they are computed from the data on the page; a
paginated register is never summarised as a total. Where a fact was not published
(faculty designations, the building's height), the site says so or draws it as
unknown rather than guessing.
