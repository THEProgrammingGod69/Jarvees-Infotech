"use client";

import { useEffect, useRef } from "react";

/**
 * A drifting plexus of neurons for inner-page heroes — 2D canvas, no WebGL,
 * so it is cheap enough to sit behind every page title. Signals travel along
 * random synapses; the pointer recruits nearby neurons. Rendering stops
 * whenever the canvas is off-screen or the tab is hidden.
 */
export default function NeuralMesh({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const cyan = css.getPropertyValue("--color-cyan").trim() || "#5ce1ff";
    const violet = css.getPropertyValue("--color-violet").trim() || "#a68bff";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];
    type Pulse = { a: number; b: number; t: number; speed: number };
    const pulses: Pulse[] = [];
    const pointer = { x: -9999, y: -9999 };
    const LINK = 150;

    const seed = () => {
      const count = Math.min(110, Math.floor(((w * h) / 13000) * density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) frame();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180) {
            n.x += dx * 0.004;
            n.y += dy * 0.004;
          }
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.globalAlpha = (1 - d / LINK) * 0.22;
            ctx.strokeStyle = violet;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (!reduced && pulses.length < 14 && Math.random() < 0.0009) {
              pulses.push({ a: i, b: j, t: 0, speed: 0.008 + Math.random() * 0.012 });
            }
          }
        }
        const pd = Math.hypot(pointer.x - a.x, pointer.y - a.y);
        if (pd < 180) {
          ctx.globalAlpha = (1 - pd / 180) * 0.5;
          ctx.strokeStyle = cyan;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = cyan;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k]!;
        const a = nodes[p.a];
        const b = nodes[p.b];
        p.t += p.speed;
        if (!a || !b || p.t >= 1) {
          pulses.splice(k, 1);
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, cyan);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let visible = true;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
