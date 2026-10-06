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

Self-hosted through `next/font/local`, each family one variable WOFF2 subset to
the characters the site uses (rupee sign included) — 87 KB for all three. The
display and body faces are preloaded; mono labels are not.

## Motion

Motion is a system, not decoration: the site is about networks learning, so
most effects *are* a small piece of machine learning — a forward pass, an
attention head, a training run.

| Effect | Where | Implementation |
|---|---|---|
| Neural Core | Home | WebGL particle cloud (7–14k points) rendered in a Web Worker on an OffscreenCanvas; morphs between shapes as each section reaches the screen's centre (`data-core-shape`); quality steps down by itself on slow frames |
| Headline into the core | Home hero | Every character of the headline is pulled out of the line and drawn into the core as the hero scrolls away, each on its own course and schedule — CSS scroll-driven animation |
| Attention scrub | Home and About vision | The quote is read word by word with an "attention head" underline sweeping beneath it, scrubbed by scroll — CSS |
| Forward pass | Home | Section pins; the four years slide past horizontally, one network layer each, with a HUD counting layers, parallax numerals and the core re-forming per layer — CSS on wide screens, vertical stack elsewhere |
| Training run | Programme | Real gradient descent with momentum (simulated at build time) replayed by scroll: the ball rolls the optimiser's zig-zag path drawing its trail, checkpoints light, the HUD reads the loss — GSAP MotionPath + DrawSVG + ScrollTrigger |
| Velocity marquees | Recruiters, announcements, patents | Speed follows scroll velocity, direction follows scroll direction, rows lean into the motion and glide to a halt under the mouse — GSAP |
| Throwable rail | Home achievements | Grab and throw with the mouse; it glides on real momentum and settles on the nearest card, cards leaning in the direction of travel — GSAP Inertia |
| Flip filters | Faculty, patents, achievements | Leavers fade out, the grid re-flows with every card flying to its new slot, newcomers fade up — GSAP Flip |
| Split-flap countdown | CODE APEX | Departure-board flaps in CSS 3D; ticks only while on screen |
| Odometers | Stats | Digits roll through a full turn to their value — CSS transforms |
| Pixel dissolve + scan | Photos | Tiles resolve in a fixed scramble, a scan beam passes once |
| Building assembly, seat ripple, timeline spine, circuit traces, stacked testimonials | Labs, events, home | CSS scroll-driven and reveal-driven |
| Word masks, decoding labels, typing terminal | Every section | CSS + a few lines of DOM code, no framework renders |
| Spotlight, tilt, magnetic buttons, cursor ring | Cards, buttons | One delegated pointer listener |
| Page transition | Client navigations | A beam sweeps the viewport while the page fades in |

## Performance

The old site dropped to 5–8 fps when scrolling. The rules that fixed it:

1. **Only `transform` and `opacity` move**, so the compositor animates without
   repainting. Scroll-linked effects use CSS scroll-driven animations, which
   run on the compositor thread and stay smooth even when JavaScript is busy.
2. **No `filter`, `backdrop-filter` or `mix-blend-mode` over moving content.**
   A full-screen blurred aurora alone cost two thirds of the frame budget.
3. **Infinite animations only run on screen** (`[data-live]` → `.is-live`), and
   canvases pause off screen and in hidden tabs.
4. **Heavy work leaves the main thread**: the core and the hero mesh render in
   Web Workers; pointer input is coalesced to one message per frame.
5. **JavaScript arrives on intent.** Pages are server-rendered markup with data
   attributes; one small runtime wires them up. GSAP and each plugin load only
   when needed — marquees on the first scroll, the rail when a mouse approaches,
   the training run a screen before it is reached — never during first paint.
   The command palette loads when ⌘/Ctrl is pressed or its button is hovered.
6. **Off-screen sections are skipped** (`content-visibility: auto`) until they
   come near the viewport, so first paint styles and lays out one screen, not
   the whole page.
7. **Static export behind a CDN**: no server work per visit; hashed assets are
   cached forever; photos are pre-sized WebP with blurred placeholders; fonts
   are subset (87 KB for three families).

## Claims discipline

Every number on the site traces to a published department or institute page.
Totals are only shown when they are computed from the data on the page; a
paginated register is never summarised as a total. Where a fact was not published
(faculty designations, the building's height), the site says so or draws it as
unknown rather than guessing.
