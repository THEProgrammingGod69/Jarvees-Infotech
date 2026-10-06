import type { Gsap } from "../gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

/**
 * Scroll-velocity marquee (GSAP + ScrollTrigger).
 *
 * The CSS marquee runs until GSAP arrives; then GSAP takes the track over
 * and couples it to the reader: scrolling down drives the row forward and
 * faster the harder you scroll, scrolling up runs it backwards, and the
 * row leans into the motion with a velocity-based skew. It eases back to
 * cruising speed when the scrolling stops, glides to a halt under a
 * hovering mouse (so a name can be read), and pauses entirely off screen.
 */
export function velocityMarquee(el: HTMLElement, gsap: Gsap, ScrollTrigger: typeof ST): () => void {
  const track = el.querySelector<HTMLElement>(".marquee-track");
  if (!track) return () => {};
  const base = el.dataset.reverse === "true" ? -1 : 1;
  const seconds = Number(el.dataset.seconds) || 40;

  el.setAttribute("data-gsap-on", "");
  gsap.set(track, { xPercent: base > 0 ? 0 : -50, force3D: true });
  const loop = gsap.to(track, {
    xPercent: base > 0 ? -50 : 0,
    duration: seconds,
    ease: "none",
    repeat: -1,
    paused: true,
  });
  const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
  let direction = 1;
  let hovered = false;
  let settle: ReturnType<typeof gsap.delayedCall> | null = null;

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hovered = true;
    settle?.kill();
    gsap.to(loop, { timeScale: 0, duration: 0.6, ease: "power2.out", overwrite: true });
    skewTo(0);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hovered = false;
    gsap.to(loop, { timeScale: direction, duration: 0.9, ease: "power2.inOut", overwrite: true });
  };
  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);

  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    onUpdate: (self) => {
      if (hovered) return;
      const v = self.getVelocity();
      direction = self.direction;
      const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 450);
      gsap.to(loop, { timeScale: direction * boost, duration: 0.25, ease: "power2.out", overwrite: true });
      skewTo(gsap.utils.clamp(-9, 9, -v / 260));
      settle?.kill();
      settle = gsap.delayedCall(0.18, () => {
        gsap.to(loop, { timeScale: direction, duration: 1.4, ease: "power3.out", overwrite: true });
        skewTo(0);
      });
    },
  });

  // GSAP's own tweens and triggers are reverted by the caller's context.
  return () => {
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
    el.removeAttribute("data-gsap-on");
  };
}
