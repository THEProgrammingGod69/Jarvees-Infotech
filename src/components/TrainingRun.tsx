import { Fragment } from "react";

/* --------------------------------------------------------------------------
   A real optimisation, computed at build time.

   Loss: an ill-conditioned quadratic bowl, rotated —
     L(θ) = ½ (u²/a² + v²/b²),  [u v]ᵀ = R(φ)(θ − θ*)
   Optimiser: gradient descent with heavy-ball momentum —
     vₜ = β vₜ₋₁ + ∇L(θₜ₋₁),  θₜ = θₜ₋₁ − η vₜ
   The steep axis is ~22× steeper than the flat one, so the iterates
   zig-zag across the valley while momentum carries them down it: the
   classic picture every student meets in the machine-learning course.
   -------------------------------------------------------------------------- */

const PHI = (-28 * Math.PI) / 180;
const A = 1.5;
const B = 0.32;
const STAR = [0.9, -0.35] as const;
const ETA = 0.16;
const BETA = 0.6;
const START = [-2.7, 0.3] as const;

const cos = Math.cos(PHI);
const sin = Math.sin(PHI);

function toUV(x: number, y: number) {
  const dx = x - STAR[0];
  const dy = y - STAR[1];
  return [cos * dx + sin * dy, -sin * dx + cos * dy] as const;
}

function loss(x: number, y: number) {
  const [u, v] = toUV(x, y);
  return 0.5 * ((u * u) / (A * A) + (v * v) / (B * B));
}

function grad(x: number, y: number) {
  const [u, v] = toUV(x, y);
  const gu = u / (A * A);
  const gv = v / (B * B);
  return [cos * gu - sin * gv, sin * gu + cos * gv] as const;
}

function simulate() {
  let t: readonly [number, number] = START;
  let vel: readonly [number, number] = [0, 0];
  const points = [t];
  for (let i = 0; i < 300; i++) {
    const g = grad(t[0], t[1]);
    vel = [BETA * vel[0] + g[0], BETA * vel[1] + g[1]];
    t = [t[0] - ETA * vel[0], t[1] - ETA * vel[1]];
    points.push(t);
    if (loss(t[0], t[1]) < 2e-4 && Math.hypot(vel[0], vel[1]) < 0.02) break;
  }
  return points;
}

// Plot space: θ₁ ∈ [−3.1, 2.5], θ₂ ∈ [−1.6, 2.0] at 125 px per unit.
const W = 700;
const H = 450;
const S = 125;
const X = (x: number) => (x + 3.1) * S;
const Y = (y: number) => (2.0 - y) * S;
const r1 = (n: number) => Math.round(n * 10) / 10;

const run = (() => {
  const pts = simulate();
  // Cumulative arc length: the ball moves along the path at constant speed,
  // so everything keyed to "progress" is keyed to distance travelled.
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1]! + Math.hypot(X(pts[i]![0]) - X(pts[i - 1]![0]), Y(pts[i]![1]) - Y(pts[i - 1]![1])));
  }
  const total = cum.at(-1)!;

  const at = (f: number) => {
    const d = f * total;
    let i = 1;
    while (i < cum.length - 1 && cum[i]! < d) i++;
    const seg = cum[i]! - cum[i - 1]! || 1;
    const k = (d - cum[i - 1]!) / seg;
    const a = pts[i - 1]!;
    const b = pts[i]!;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k] as const;
  };

  // Loss sampled at even fractions of the journey, for the live readout.
  const SAMPLES = 64;
  const losses = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const p = at(i / SAMPLES);
    return loss(p[0], p[1]);
  });

  // Six checkpoints, at the iterates closest to even sixths of the way.
  const checkpoints = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => {
    let best = 0;
    for (let i = 0; i < cum.length; i++) if (Math.abs(cum[i]! / total - f) < Math.abs(cum[best]! / total - f)) best = i;
    return { step: best, at: cum[best]! / total, p: pts[best]!, loss: loss(pts[best]![0], pts[best]![1]) };
  });

  const d = pts.map((p, i) => `${i ? "L" : "M"}${r1(X(p[0]))} ${r1(Y(p[1]))}`).join("");

  // Loss curve for the HUD: log-loss against progress.
  const lo = Math.log10(Math.min(...losses));
  const hi = Math.log10(Math.max(...losses));
  const curve = losses
    .map((l, i) => `${i ? "L" : "M"}${r1((i / SAMPLES) * 200)} ${r1(4 + ((hi - Math.log10(l)) / (hi - lo)) * 52)}`)
    .join("");

  return { pts, d, losses, checkpoints, curve, steps: pts.length - 1, end: pts.at(-1)!, start: pts[0]! };
})();

const LEVELS = [0.03, 0.1, 0.25, 0.55, 1.1, 2, 3.4, 5.4, 8.2, 12];

const fmt = (n: number) => (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(3) : n.toExponential(1));

/**
 * "Training run" — scroll to train. The trajectory, the contours and every
 * number on screen come from the simulation above; GSAP (MotionPathPlugin +
 * DrawSVGPlugin, motion/effects/descent.ts) only replays it, scrubbed by
 * scroll: the ball rolls down the optimiser's real path drawing its trail,
 * checkpoints light as they are passed, and the HUD reads the loss at the
 * ball's position. Scroll up and training runs backwards.
 *
 * Without JavaScript, or with reduced motion, the finished run is shown.
 */
export default function TrainingRun() {
  const end = run.end;
  return (
    <div
      data-descent
      data-losses={run.losses.map((l) => l.toPrecision(4)).join(",")}
      className="relative lg:h-[230vh]"
    >
      <div className="grid items-center gap-10 lg:sticky lg:top-[max(5.5rem,calc(50vh-17rem))] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="holo hud-corners p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label text-haze">Loss</p>
              <p className="label text-haze">
                Checkpoint <span data-epoch-now className="text-cyan">{run.checkpoints.length}</span> / {run.checkpoints.length}
              </p>
            </div>
            <p className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none font-semibold text-frost tabular-nums">
              <span data-loss>{fmt(run.losses.at(-1)!)}</span>
            </p>
            <svg viewBox="0 0 200 60" className="mt-5 h-16 w-full overflow-visible" aria-hidden="true">
              <path d="M0 59.5H200" className="stroke-line" strokeWidth="1" />
              <path d={run.curve} data-descent-curve fill="none" className="stroke-violet" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p className="label mt-2 text-haze">log loss · progress →</p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              ["η", String(ETA)],
              ["β", String(BETA)],
              ["Steps", String(run.steps)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-void/50 px-3 py-3">
                <dt className="label text-haze">{k}</dt>
                <dd className="mt-1 font-mono text-small text-frost">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-small text-haze">
            Gradient descent with momentum on an ill-conditioned bowl: the steep wall makes it zig-zag, momentum carries it
            along the valley floor. Computed, not drawn — the same update rule students implement in Module IV.
          </p>
        </div>

        <figure className="order-1 lg:order-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto max-h-[70vh] w-full overflow-visible"
            role="img"
            aria-label={`Gradient descent with momentum: ${run.steps} steps from a loss of ${fmt(run.losses[0]!)} down to ${fmt(run.losses.at(-1)!)}.`}
          >
            <defs>
              <linearGradient id="trail-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" style={{ stopColor: "var(--color-violet)" }} />
                <stop offset="1" style={{ stopColor: "var(--color-cyan)" }} />
              </linearGradient>
              <clipPath id="plot-frame">
                <rect x="0" y="0" width={W} height={H} rx="18" />
              </clipPath>
            </defs>

            {/* Frame and axes */}
            <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="18" fill="none" className="stroke-line" />
            <path d={`M${X(-3.1)} ${Y(0)}H${X(2.5)}M${X(0)} ${Y(-1.6)}V${Y(2)}`} className="stroke-line" strokeDasharray="2 6" />
            <text x={W - 14} y={Y(0) - 8} textAnchor="end" className="fill-haze font-mono text-[11px] tracking-widest">
              θ₁
            </text>
            <text x={X(0) + 10} y={20} className="fill-haze font-mono text-[11px] tracking-widest">
              θ₂
            </text>

            {/* Contours of the loss: nested ellipses, faintly filled so the bowl reads as depth */}
            <g clipPath="url(#plot-frame)">
              <g transform={`rotate(${-(PHI * 180) / Math.PI} ${r1(X(STAR[0]))} ${r1(Y(STAR[1]))})`}>
                {[...LEVELS].reverse().map((c, i) => (
                  <ellipse
                    key={c}
                    cx={r1(X(STAR[0]))}
                    cy={r1(Y(STAR[1]))}
                    rx={r1(A * Math.sqrt(2 * c) * S)}
                    ry={r1(B * Math.sqrt(2 * c) * S)}
                    className="fill-cyan stroke-cyan"
                    fillOpacity={0.028}
                    strokeOpacity={0.12 + (i / LEVELS.length) * 0.3}
                    strokeWidth={1}
                  />
                ))}
              </g>
            </g>
            <g transform={`translate(${r1(X(STAR[0]))} ${r1(Y(STAR[1]))})`}>
              <path d="M-6 0H6M0 -6V6" className="stroke-frost" strokeWidth="1.2" />
              <text x="10" y="18" className="fill-haze font-mono text-[11px] tracking-widest">
                θ*
              </text>
            </g>

            {/* The path: a faint guide, and the trail that draws behind the ball */}
            <path data-descent-path d={run.d} fill="none" className="stroke-line-bright" strokeWidth="1" strokeDasharray="2 5" />
            <path
              data-descent-trail
              d={run.d}
              fill="none"
              stroke="url(#trail-grad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Checkpoints */}
            {run.checkpoints.map((c, i) => (
              <Fragment key={i}>
                <g data-epoch data-at={c.at.toFixed(4)}>
                  <rect
                    x={r1(X(c.p[0])) - 5}
                    y={r1(Y(c.p[1])) - 5}
                    width="10"
                    height="10"
                    transform={`rotate(45 ${r1(X(c.p[0]))} ${r1(Y(c.p[1]))})`}
                    className="fill-void stroke-violet"
                    strokeWidth="1.4"
                  />
                  <text
                    x={r1(X(c.p[0]))}
                    y={r1(Y(c.p[1])) + (i % 2 ? 24 : -14)}
                    textAnchor="middle"
                    className="fill-violet font-mono text-[10px] tracking-widest"
                  >
                    {`C${i + 1} · ${fmt(c.loss)}`}
                  </text>
                </g>
              </Fragment>
            ))}

            {/* The ball, resting at the minimum until GSAP takes it to the start */}
            <g data-descent-ball>
              <circle cx={r1(X(end[0]))} cy={r1(Y(end[1]))} r="15" className="fill-cyan" fillOpacity="0.14" />
              <circle cx={r1(X(end[0]))} cy={r1(Y(end[1]))} r="7" className="fill-cyan" />
              <circle cx={r1(X(end[0]))} cy={r1(Y(end[1]))} r="2.5" className="fill-void" />
            </g>
          </svg>
          <figcaption className="label mt-4 text-haze">Scroll to train · scroll back to rewind</figcaption>
        </figure>
      </div>
    </div>
  );
}
