"use client";

import { useEffect, useRef } from "react";

/**
 * Every pointer-driven effect on the site, behind one listener:
 *
 * - `.holo` surfaces get --mx/--my so their spotlight border tracks the pointer
 * - `[data-tilt]` surfaces lean towards the pointer in 3D
 * - `[data-magnetic]` controls drift a few pixels towards it
 * - a trailing ring follows the pointer and opens over anything interactive
 *
 * Delegating from the document means none of those elements has to be a
 * client component. The native cursor is never hidden: the ring augments it.
 * Touch devices and reduced-motion visitors get the spotlight only.
 */
export default function PointerFx() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = fine && !reduced;
    const ring = ringRef.current;

    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;
    const pos = { x: -100, y: -100, rx: -100, ry: -100 };
    let hot = false;
    let raf = 0;

    const reset = (el: HTMLElement | null) => {
      if (el) el.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target instanceof Element ? e.target : null;

      const holo = target?.closest<HTMLElement>(".holo");
      if (holo) {
        const r = holo.getBoundingClientRect();
        holo.style.setProperty("--mx", `${e.clientX - r.left}px`);
        holo.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      if (!motion) return;

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilt !== tiltEl) {
        reset(tiltEl);
        tiltEl = tilt;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(1000px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateZ(0)`;
      }

      const mag = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (mag !== magEl) {
        reset(magEl);
        magEl = mag;
      }
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate3d(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px, 0)`;
      }

      hot = !!target?.closest("a, button, [role='button'], input, textarea, select, summary");
    };

    const onLeaveDoc = () => {
      reset(tiltEl);
      reset(magEl);
      tiltEl = magEl = null;
      pos.x = pos.y = -100;
    };

    const loop = () => {
      pos.rx += (pos.x - pos.rx) * 0.2;
      pos.ry += (pos.y - pos.ry) * 0.2;
      if (ring) {
        ring.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%, -50%) scale(${hot ? 1.9 : 1})`;
        ring.style.opacity = pos.x < 0 ? "0" : hot ? "0.9" : "0.55";
      }
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    if (motion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-8 w-8 rounded-full border border-cyan/70 opacity-0 mix-blend-screen transition-[opacity,scale] duration-300 [@media(pointer:fine)]:block motion-reduce:!hidden"
      style={{ boxShadow: "0 0 18px color-mix(in oklab, var(--color-cyan) 45%, transparent)" }}
    />
  );
}
