import type { loadPath } from "../gsap";

type PathLibs = Awaited<ReturnType<typeof loadPath>>;

/**
 * Gradient descent on a loss landscape, scrubbed by scroll (GSAP
 * MotionPathPlugin + DrawSVGPlugin + ScrollTrigger).
 *
 * A ball rolls down the optimiser's real trajectory (simulated at build
 * time — see TrainingRun.tsx) drawing its trail behind it; each checkpoint
 * lights as it is passed, the loss curve draws in step, and the HUD reads
 * the loss at the ball's position. Scroll back up and training runs in
 * reverse. On wide screens the figure is sticky and the run spans the
 * whole section; on narrow ones it plays while the figure crosses the
 * screen.
 *
 * Without JavaScript the finished run is shown: full trail, ball at the
 * minimum, every checkpoint lit. Returns a cleanup that restores exactly that.
 */
export function descent(el: HTMLElement, { gsap }: PathLibs): () => void {
  const path = el.querySelector<SVGPathElement>("[data-descent-path]");
  const trail = el.querySelector<SVGPathElement>("[data-descent-trail]");
  const curve = el.querySelector<SVGPathElement>("[data-descent-curve]");
  const ball = el.querySelector<SVGGElement>("[data-descent-ball]");
  const lossEl = el.querySelector<HTMLElement>("[data-loss]");
  const epochEl = el.querySelector<HTMLElement>("[data-epoch-now]");
  const markers = Array.from(el.querySelectorAll<SVGGElement>("[data-epoch]"));
  if (!path || !trail || !ball) return () => {};

  const losses = (el.dataset.losses ?? "").split(",").map(Number).filter((n) => !Number.isNaN(n));
  const stops = markers.map((m) => Number(m.dataset.at));
  const finalLoss = lossEl?.textContent ?? "";
  const finalEpoch = epochEl?.textContent ?? "";
  const fmt = (n: number) => (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(3) : n.toExponential(1));

  const mm = gsap.matchMedia();
  mm.add({ pinned: "(min-width: 1024px)", inline: "(max-width: 1023.98px)" }, (ctx) => {
    const pinned = !!ctx.conditions?.pinned;
    gsap.set([trail, curve].filter(Boolean), { drawSVG: "0%" });
    gsap.set(markers, { opacity: 0.25, scale: 0.55, transformOrigin: "50% 50%" });

    // The HUD reads the run at the timeline's progress (= distance travelled).
    const readout = () => {
      const p = tl.progress();
      if (lossEl && losses.length) {
        const f = p * (losses.length - 1);
        const i = Math.floor(f);
        const a = losses[i]!;
        const b = losses[Math.min(losses.length - 1, i + 1)]!;
        lossEl.textContent = fmt(a + (b - a) * (f - i));
      }
      if (epochEl) epochEl.textContent = String(Math.max(1, stops.filter((s) => p >= s - 0.002).length));
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el,
        start: pinned ? "top top" : "top 75%",
        end: pinned ? "bottom bottom" : "bottom 35%",
        scrub: 0.6,
      },
      onUpdate: readout,
    });

    tl.to(trail, { drawSVG: "100%", duration: 1 }, 0).to(
      ball,
      { duration: 1, motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } },
      0,
    );
    if (curve) tl.to(curve, { drawSVG: "100%", duration: 1 }, 0);
    markers.forEach((m, i) => {
      const at = stops[i] ?? (i + 1) / markers.length;
      tl.to(m, { opacity: 1, scale: 1, duration: 0.03, ease: "back.out(3)" }, Math.max(0, Math.min(0.97, at - 0.015)));
    });

    // Initialise every tween now, so the ball waits at the start of the run
    // (not at the minimum, where the static markup leaves it) before the
    // reader scrolls into the section.
    tl.progress(1e-5).progress(0);
    readout();

    return () => {
      if (lossEl) lossEl.textContent = finalLoss;
      if (epochEl) epochEl.textContent = finalEpoch;
    };
  });

  return () => mm.revert();
}
