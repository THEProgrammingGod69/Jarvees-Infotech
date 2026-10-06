"use client";

import { useState } from "react";

type Domain = { id: string; label: string; items: readonly string[] };

/**
 * Research domains as a constellation around the department. Each domain is
 * a focusable node; selecting one fans its evidence out as satellites and
 * sends a signal down its wire, and the panel beside it — the accessible
 * reading of the same data — swaps in. The signal only flows while the
 * diagram is on screen.
 */
export default function Constellation({ domains }: { domains: readonly Domain[] }) {
  const [active, setActive] = useState(0);
  const W = 800;
  const H = 560;
  const cx = W / 2;
  const cy = H / 2;
  const pos = domains.map((_, i) => {
    const a = (i / domains.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * 290, y: cy + Math.sin(a) * 200, a };
  });
  const current = domains[active]!;
  const p = pos[active]!;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
      <svg viewBox={`0 0 ${W} ${H}`} data-live className="h-auto w-full overflow-visible" role="group" aria-label="Research domains">
        <ellipse cx={cx} cy={cy} rx={290} ry={200} fill="none" className="stroke-line" strokeDasharray="2 6" />
        <ellipse cx={cx} cy={cy} rx={150} ry={100} fill="none" className="stroke-line" strokeDasharray="2 6" />
        {pos.map((q, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={q.x}
            y2={q.y}
            className={i === active ? "signal stroke-cyan" : "stroke-line-bright"}
            strokeWidth={i === active ? 1.4 : 0.8}
          />
        ))}

        {/* Satellites for the active domain */}
        {current.items.map((_, k) => {
          const spread = (k - (current.items.length - 1) / 2) * 0.42;
          const sx = p.x + Math.cos(p.a + spread) * 70;
          const sy = p.y + Math.sin(p.a + spread) * 70;
          return (
            <g key={`${current.id}-${k}`} className="sat-in" style={{ animationDelay: `${k * 80}ms` }}>
              <line x1={p.x} y1={p.y} x2={sx} y2={sy} className="stroke-violet" strokeOpacity={0.6} />
              <circle cx={sx} cy={sy} r={5} className="fill-violet" />
            </g>
          );
        })}

        <g>
          <circle cx={cx} cy={cy} r={46} className="fill-cyan" fillOpacity={0.08} />
          <circle cx={cx} cy={cy} r={30} className="fill-deep stroke-cyan" strokeWidth={1.2} />
          <text x={cx} y={cy + 4} textAnchor="middle" className="fill-frost font-display text-[13px] font-semibold">
            CSE·AI
          </text>
        </g>

        {domains.map((d, i) => {
          const q = pos[i]!;
          const on = i === active;
          return (
            <g
              key={d.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={d.label}
              onClick={() => setActive(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(i);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible_circle.halo]:stroke-cyan"
            >
              <circle cx={q.x} cy={q.y} r={22} className="halo fill-transparent stroke-transparent" strokeWidth={2} />
              <circle cx={q.x} cy={q.y} r={on ? 12 : 8} className={on ? "fill-cyan" : "fill-panel stroke-line-bright"} style={{ transition: "r .4s" }} />
              {on && <circle cx={q.x} cy={q.y} r={20} className="fill-cyan" fillOpacity={0.15} />}
              <text
                x={q.x}
                y={q.y < cy - 1 ? q.y - 22 : q.y + 34}
                textAnchor="middle"
                className={`font-mono text-[12px] tracking-wider uppercase ${on ? "fill-cyan" : "fill-haze"}`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="holo hud-corners min-h-[18rem] p-7" aria-live="polite">
        <div key={current.id} className="swap-in">
          <p className="label text-cyan">
            Domain {String(active + 1).padStart(2, "0")} / {String(domains.length).padStart(2, "0")}
          </p>
          <h3 className="mt-4 font-display text-display-m text-frost">{current.label}</h3>
          <ul className="mt-6 space-y-3">
            {current.items.map((item) => (
              <li key={item} className="flex gap-3 text-body text-haze">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
