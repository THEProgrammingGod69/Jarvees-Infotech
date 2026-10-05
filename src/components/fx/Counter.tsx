"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up to a quantity when it scrolls into view.
 *
 * The server renders the final value, so the number is correct without
 * JavaScript and for crawlers. Only counters that start below the fold are
 * reset to zero before they are seen — a counter already on screen at load
 * animates from where the eye can follow it.
 */
export default function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const render = (n: number) => {
      el.textContent = `${prefix}${fmt.format(n)}${suffix}`;
    };

    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) render(0);

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo: fast start, long settle — reads as a measurement locking in.
          const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          render(value * e);
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, decimals, prefix, suffix, duration]);

  const initial = new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  return (
    <span ref={ref} className="tabular-nums">
      {`${prefix}${initial}${suffix}`}
    </span>
  );
}
