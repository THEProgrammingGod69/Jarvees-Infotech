"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Course, Module } from "@/content/curriculum";

const kindLabel: Record<Course["kind"], string> = {
  core: "Core",
  skill: "Skills",
  project: "Studio",
  elective: "Elective",
  internship: "Internship",
};

const kindTone: Record<Course["kind"], string> = {
  core: "text-cyan border-cyan/40",
  skill: "text-haze border-line-bright",
  project: "text-violet border-violet/40",
  elective: "text-magenta border-magenta/40",
  internship: "text-cyan border-cyan/40",
};

/**
 * The curriculum drawn as a network: each module is a layer, each course a
 * neuron. Selecting a layer lights it and sends signal along every synapse
 * feeding it; the course list beside it is the readable, accessible version
 * of the same data. Tabs follow the WAI-ARIA tabs pattern (arrow keys move).
 */
export default function CurriculumExplorer({ modules }: { modules: Module[] }) {
  const [active, setActive] = useState(1);
  const current = modules[active]!;

  const W = 640;
  const H = 360;
  const layout = useMemo(() => {
    const colX = (i: number) => 50 + (i * (W - 100)) / (modules.length - 1);
    const nodes = modules.map((m, i) =>
      m.courses.map((_, k) => ({ x: colX(i), y: H / 2 + (k - (m.courses.length - 1) / 2) * 34 })),
    );
    return { nodes };
  }, [modules]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % modules.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + modules.length) % modules.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = modules.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`tab-${modules[next]!.id}`)?.focus();
  };

  return (
    <div className="holo overflow-hidden p-4 sm:p-6">
      <div role="tablist" aria-label="Modules" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-void/50 p-1">
        {modules.map((m, i) => {
          const selected = i === active;
          return (
            <button
              key={m.id}
              id={`tab-${m.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${m.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-small font-medium whitespace-nowrap transition-colors ${
                selected ? "text-void" : "text-haze hover:text-frost"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="module-pill"
                  className="absolute inset-0 -z-0 rounded-full bg-cyan"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">
                {m.year} · {m.module.replace("Module ", "M-")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Curriculum network with ${current.module} highlighted`}>
          {/* Synapses into and out of the active layer carry signal. */}
          {layout.nodes.slice(0, -1).map((col, i) =>
            col.flatMap((a, ai) =>
              layout.nodes[i + 1]!.map((b, bi) => {
                const live = i + 1 === active || i === active;
                return (
                  <line
                    key={`${i}-${ai}-${bi}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={live ? "stroke-cyan" : "stroke-line"}
                    strokeOpacity={live ? 0.5 : 0.7}
                    strokeWidth={live ? 0.9 : 0.6}
                    strokeDasharray={live ? "6 114" : undefined}
                    style={live ? { animation: `signal ${1.6 + ((ai + bi) % 5) * 0.25}s linear infinite` } : undefined}
                  />
                );
              }),
            ),
          )}
          {layout.nodes.map((col, i) =>
            col.map((n, k) => {
              const on = i === active;
              return (
                <g key={`${i}-${k}`}>
                  {on && <circle cx={n.x} cy={n.y} r={11} className="fill-cyan" fillOpacity={0.12} />}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={on ? 6 : 4}
                    className={on ? "fill-cyan" : i < active ? "fill-violet" : "fill-line-bright"}
                    style={{ transition: "r .4s" }}
                  />
                </g>
              );
            }),
          )}
          {modules.map((m, i) => (
            <text
              key={m.id}
              x={layout.nodes[i]![0]!.x}
              y={H - 8}
              textAnchor="middle"
              className={`font-mono text-[11px] tracking-widest ${i === active ? "fill-cyan" : "fill-haze"}`}
            >
              {m.module.replace("Module ", "")}
            </text>
          ))}
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            id={`panel-${current.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${current.id}`}
            initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label text-violet">
              {current.year} · {current.module}
              {current.credits ? ` · ${current.credits} credits` : ""}
            </p>
            <h3 className="mt-3 font-display text-display-l text-frost">{current.theme}</h3>
            <p className="mt-3 text-body text-haze">{current.summary}</p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {current.courses.map((c) => (
                <li key={`${c.code}-${c.name}`} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-baseline gap-3">
                    <span className="label w-16 shrink-0 text-haze">{c.code}</span>
                    <span className="text-small text-frost">{c.name}</span>
                  </span>
                  <span className={`label shrink-0 rounded-full border px-2.5 py-1 text-[0.625rem] ${kindTone[c.kind]}`}>{kindLabel[c.kind]}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
