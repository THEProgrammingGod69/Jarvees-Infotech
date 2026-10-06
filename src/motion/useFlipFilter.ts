"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { loadFlip } from "./gsap";
import { prefersReducedMotion } from "./observe";

type FlipLib = Awaited<ReturnType<typeof loadFlip>>;
type Pending = { state: ReturnType<FlipLib["Flip"]["getState"]>; height: number; leaving: HTMLElement[] };

const DURATION = 0.65;
const EASE = "power3.inOut";

/**
 * Animated filtering for a grid of `[data-flip-id]` items (GSAP Flip).
 *
 * Every item is always in the markup — filtering only toggles `hidden` — so
 * the full list is there for crawlers and visitors without JavaScript.
 * `filter(nextVisibleIds, commit)` choreographs a change in three beats:
 * items that are leaving fade out where they stand; the grid re-flows
 * (React commits the new `hidden` flags) while every surviving item flies
 * from its old slot to its new one and the container eases to its new
 * height on the same curve, so nothing overlaps the content below; then
 * the newcomers fade up in place.
 *
 * GSAP Flip is fetched only when the grid comes near the viewport. Until
 * then — and for reduced-motion visitors — filters apply instantly.
 */
export function useFlipFilter(containerRef: RefObject<HTMLElement | null>) {
  const lib = useRef<FlipLib | null>(null);
  const pending = useRef<Pending | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        void loadFlip().then((l) => (lib.current = l));
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [containerRef]);

  // After React commits the new `hidden` flags: fly everything into place.
  useLayoutEffect(() => {
    const job = pending.current;
    const container = containerRef.current;
    if (!job || !lib.current || !container) return;
    pending.current = null;
    const { gsap, Flip } = lib.current;
    // The leavers are display:none now; reset them for their next entrance.
    gsap.set(job.leaving, { clearProps: "opacity,transform" });
    const end = container.offsetHeight;
    gsap.fromTo(container, { height: job.height }, { height: end, duration: DURATION, ease: EASE, clearProps: "height" });
    Flip.from(job.state, {
      duration: DURATION,
      ease: EASE,
      scale: true,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45, delay: 0.18, ease: "power2.out" }),
    });
  });

  return (visible: Set<string>, commit: () => void) => {
    const container = containerRef.current;
    const flip = lib.current;
    if (!container || !flip || prefersReducedMotion()) return commit();

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-flip-id]"));
    const leaving = items.filter((el) => !el.hidden && !visible.has(el.dataset.flipId ?? ""));
    const run = ++seq.current;
    const reflow = () => {
      if (run !== seq.current) return;
      pending.current = { state: flip.Flip.getState(items), height: container.offsetHeight, leaving };
      commit();
    };

    if (!leaving.length) return reflow();
    flip.gsap.to(leaving, { opacity: 0, scale: 0.92, duration: 0.22, ease: "power2.in", overwrite: true, onComplete: reflow });
  };
}
