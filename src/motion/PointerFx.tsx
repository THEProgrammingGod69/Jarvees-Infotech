"use client";

import { useEffect, useRef } from "react";

/**
 * Every pointer-driven effect on the site, behind one delegated listener:
 *
 * - `.holo` surfaces get --mx/--my so their spotlight border tracks the pointer
 * - `[data-tilt]` surfaces lean towards the pointer in 3D
 * - `[data-magnetic]` controls drift a few pixels towards it
 * - a trailing ring follows the pointer and opens over anything interactive
 *
 * Speed: element rectangles are cached and only re-measured after a scroll
 * or resize, so moving the mouse never forces a layout; all writes happen
 * once per frame; and the ring's animation loop runs only while it is
 * catching up with the pointer — a still mouse costs nothing.
 *
 * Touch devices and reduced-motion visitors get the spotlight only.
 */
export default function PointerFx() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = fine && !reduced;
    const ring = ringRef.current;

    let rects = new WeakMap<Element, DOMRect>();
    const rectOf = (el: Element) => {
      let r = rects.get(el);
      if (!r) {
        r = el.getBoundingClientRect();
        rects.set(el, r);
      }
      return r;
    };
    const invalidate = () => {
      rects = new WeakMap();
    };

    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;
    let holoEl: HTMLElement | null = null;
    const pos = { x: -100, y: -100, rx: -100, ry: -100 };
    let hot = false;
    let target: Element | null = null;
    let frameQueued = false;
    let ringRunning = false;
    let ringRaf = 0;

    const reset = (el: HTMLElement | null) => {
      if (el) el.style.transform = "";
    };

    const apply = () => {
      frameQueued = false;
      const holo = target?.closest<HTMLElement>(".holo") ?? null;
      holoEl = holo;
      if (holo) {
        const r = rectOf(holo);
        holo.style.setProperty("--mx", `${pos.x - r.left}px`);
        holo.style.setProperty("--my", `${pos.y - r.top}px`);
      }
      if (!motion) return;

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilt !== tiltEl) {
        reset(tiltEl);
        tiltEl = tilt;
      }
      if (tilt) {
        const r = rectOf(tilt);
        const px = (pos.x - r.left) / r.width - 0.5;
        const py = (pos.y - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(1000px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
      }

      const mag = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (mag !== magEl) {
        reset(magEl);
        magEl = mag;
      }
      if (mag) {
        const r = rectOf(mag);
        const dx = pos.x - (r.left + r.width / 2);
        const dy = pos.y - (r.top + r.height / 2);
        mag.style.transform = `translate3d(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px, 0)`;
      }

      hot = !!target?.closest("a, button, [role='button'], input, textarea, select, summary, label");
      startRing();
    };

    const ringLoop = () => {
      pos.rx += (pos.x - pos.rx) * 0.22;
      pos.ry += (pos.y - pos.ry) * 0.22;
      if (ring) {
        ring.style.transform = `translate3d(${pos.rx.toFixed(1)}px, ${pos.ry.toFixed(1)}px, 0) translate(-50%, -50%) scale(${hot ? 1.9 : 1})`;
        ring.style.opacity = pos.x < 0 ? "0" : hot ? "0.9" : "0.55";
      }
      if (Math.abs(pos.x - pos.rx) + Math.abs(pos.y - pos.ry) > 0.3) {
        ringRaf = requestAnimationFrame(ringLoop);
      } else {
        ringRunning = false;
      }
    };
    const startRing = () => {
      if (!motion || ringRunning) return;
      ringRunning = true;
      ringRaf = requestAnimationFrame(ringLoop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      target = e.target instanceof Element ? e.target : null;
      if (frameQueued) return;
      frameQueued = true;
      requestAnimationFrame(apply);
    };

    const onLeaveDoc = () => {
      reset(tiltEl);
      reset(magEl);
      tiltEl = magEl = holoEl = null;
      pos.x = pos.y = -100;
      startRing();
    };

    const onScroll = () => {
      invalidate();
      // The element under a still pointer changes as the page scrolls.
      if (tiltEl) {
        reset(tiltEl);
        tiltEl = null;
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", invalidate, { passive: true });

    return () => {
      cancelAnimationFrame(ringRaf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", invalidate);
      void holoEl;
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-8 w-8 rounded-full border border-cyan/70 opacity-0 transition-[opacity] duration-300 motion-reduce:!hidden [@media(pointer:fine)]:block"
      style={{ boxShadow: "0 0 18px color-mix(in oklab, var(--color-cyan) 45%, transparent)" }}
    />
  );
}
