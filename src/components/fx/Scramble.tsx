"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01ΣΔλ";

/**
 * Text that decodes itself, left to right, like a signal resolving.
 *
 * The real text is server-rendered and stays in the accessibility tree
 * untouched; only an aria-hidden twin animates. Characters are written
 * straight to the DOM, so the effect costs no React renders.
 */
export default function Scramble({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timeout = 0;
    const chars = [...text];
    // Each character locks at its own moment, in a quick left-to-right sweep.
    // Time-based rather than frame-based, so a slow device finishes on time
    // instead of stretching the noise out.
    const lockAt = chars.map((_, i) => i * 11 + Math.random() * 110 + 50);
    const total = Math.max(...lockAt);

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = now - start;
        let out = "";
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i]!;
          if (c === " " || t >= lockAt[i]!) out += c;
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out;
        if (t < total) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        io.disconnect();
        timeout = window.setTimeout(run, delay);
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
