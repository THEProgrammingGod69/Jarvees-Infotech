import type { Gsap } from "../gsap";
import type { InertiaPlugin as IP } from "gsap/InertiaPlugin";

/**
 * Drag-and-throw for a rail on mouse devices (GSAP InertiaPlugin).
 *
 * The rail stays a native scroller — touch, trackpads and keyboards keep
 * their built-in behaviour and the list keeps its semantics. With a mouse
 * you can grab it, throw it, and it glides to rest on the nearest card
 * with real momentum; cards lean in the direction of travel while it moves.
 */
export function railInertia(rail: HTMLElement, gsap: Gsap, InertiaPlugin: typeof IP): () => void {
  const track = rail.querySelector<HTMLElement>("[data-rail-track]");
  if (!track || !window.matchMedia("(pointer: fine)").matches) return () => {};

  InertiaPlugin.track(track, "scrollLeft");
  const lean = { deg: 0 };
  const leanTo = gsap.quickTo(lean, "deg", {
    duration: 0.45,
    ease: "power3.out",
    onUpdate: () => track.style.setProperty("--lean", `${lean.deg.toFixed(2)}deg`),
  });

  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let travelled = 0;
  let lastX = 0;
  let lastT = 0;

  // Where each card snaps: its left edge at the track's scroll-padding. The
  // track is positioned, so offsetLeft is measured within its (unscrolled)
  // content.
  const snapPoints = () => {
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const max = track.scrollWidth - track.clientWidth;
    return Array.from(track.children).map((c) => Math.min(max, Math.max(0, (c as HTMLElement).offsetLeft - pad)));
  };
  const nearest = (value: number) => {
    const points = snapPoints();
    return points.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), points[0] ?? 0);
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = true;
    travelled = 0;
    startX = lastX = e.clientX;
    lastT = performance.now();
    startScroll = track.scrollLeft;
    gsap.killTweensOf(track);
    // Snapping and smooth scrolling would fight a hand-driven scrollLeft.
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";
    track.style.cursor = "grabbing";
    track.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    travelled = Math.max(travelled, Math.abs(dx));
    track.scrollLeft = startScroll - dx;
    const now = performance.now();
    const v = (e.clientX - lastX) / Math.max(1, now - lastT); // px per ms
    lastX = e.clientX;
    lastT = now;
    leanTo(gsap.utils.clamp(-6, 6, v * 4));
  };

  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    track.style.cursor = "";
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    leanTo(0);
    gsap.to(track, {
      inertia: {
        scrollLeft: {
          velocity: "auto",
          min: 0,
          max: track.scrollWidth - track.clientWidth,
          end: (natural: number) => nearest(natural),
        },
        duration: { min: 0.35, max: 1.6 },
      },
      onComplete: () => {
        track.style.scrollSnapType = "";
        track.style.scrollBehavior = "";
      },
    });
  };

  // A drag must never also count as a click on a card inside it.
  const onClick = (e: MouseEvent) => {
    if (travelled > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  track.style.cursor = "grab";
  track.addEventListener("pointerdown", onDown);
  track.addEventListener("pointermove", onMove);
  track.addEventListener("pointerup", onUp);
  track.addEventListener("pointercancel", onUp);
  track.addEventListener("click", onClick, true);

  return () => {
    InertiaPlugin.untrack(track);
    gsap.killTweensOf(track);
    track.style.cursor = "";
    track.style.scrollSnapType = "";
    track.style.scrollBehavior = "";
    track.removeEventListener("pointerdown", onDown);
    track.removeEventListener("pointermove", onMove);
    track.removeEventListener("pointerup", onUp);
    track.removeEventListener("pointercancel", onUp);
    track.removeEventListener("click", onClick, true);
  };
}
