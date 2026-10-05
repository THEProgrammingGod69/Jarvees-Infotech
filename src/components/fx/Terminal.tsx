"use client";

import { useEffect, useRef, useState } from "react";

export type TerminalLine = { kind: "cmd" | "out" | "ok"; text: string };

/**
 * A terminal that types itself when scrolled into view.
 *
 * Every line is in the DOM from the first render (so the content is there
 * for crawlers, screen readers and no-JS visitors); the untyped remainder is
 * merely transparent. The box therefore has its final height from the start
 * and typing can never shift the layout.
 */
export default function Terminal({ title, lines }: { title: string; lines: TerminalLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = lines.reduce((n, l) => n + l.text.length, 0);
  const [typed, setTyped] = useState(total);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTyped(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          // Commands type at a human pace; output arrives in bursts.
          const n = Math.min(total, Math.floor((now - start) / 14));
          setTyped(n);
          if (n < total) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [total]);

  let budget = typed;
  let caretPlaced = false;

  return (
    <div ref={ref} className="holo hud-corners overflow-hidden font-mono text-small">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-magenta/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan/80" />
        <span className="label ml-3 text-haze">{title}</span>
      </div>
      <div className="space-y-1.5 p-5 sm:p-6">
        {lines.map((line, i) => {
          const shown = Math.max(0, Math.min(line.text.length, budget));
          budget -= line.text.length;
          const isCurrent = !caretPlaced && shown < line.text.length;
          if (isCurrent) caretPlaced = true;
          const color = line.kind === "cmd" ? "text-frost" : line.kind === "ok" ? "text-cyan" : "text-haze";
          return (
            <p key={i} className={`${color} break-words`}>
              {line.kind === "cmd" && <span className="mr-2 text-violet select-none">❯</span>}
              <span className={isCurrent ? "caret" : undefined}>{line.text.slice(0, shown)}</span>
              <span className="opacity-0">{line.text.slice(shown)}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
