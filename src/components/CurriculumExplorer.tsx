"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
 * neuron. Selecting a layer lights it and fires a burst of signal along
 * every synapse into and out of it (a few pulses, then it rests — a
 * hundred dashes flowing forever would repaint the diagram every frame);
 * the course list beside it is the readable, accessible version of the
 * same data. Tabs follow the WAI-ARIA tabs pattern (arrow keys move).
 */
export default function CurriculumExplorer({ modules }: { modules: Module[] }) {
  const [active, setActive] = useState(1);
  const current = modules[active]!;
  const tablistRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  // The selected-tab pill: one element, moved with a transform.
  useLayoutEffect(() => {
    const list = tablistRef.current;
    const pill = pillRef.current;
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !pill || !tab) return;
    const first = pill.style.opacity !== "1";
    pill.style.transition = first ? "none" : "";
    pill.style.width = `${tab.offsetWidth}px`;
    pill.style.transform = `translate3d(${tab.offsetLeft}px, 0, 0)`;
    pill.style.opacity = "1";
    list.dataset.pill = "on";
    if (!first) tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active]);

  // Re-measure when fonts load or the layout changes width.
  useEffect(() => {
    const list = tablistRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const ro = new ResizeObserver(() => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      pill.style.transition = "none";
      pill.style.width = `${tab.offsetWidth}px`;
      pill.style.transform = `translate3d(${tab.offsetLeft}px, 0, 0)`;
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  const W = 640;
  const H = 360;
  const layout = useMemo(() => {
    const colX = (i: number) => 50 + (i * (W - 100)) / (modules.length - 1);
    const nodes = modules.map((m, i) =>
      m.courses.map((_, k) => ({ x: colX(i), y: H / 2 + (k - (m.courses.length - 1) / 2) * 34 })),
    );
    return { nodes };
  }, [modules]);

  const synapses = useMemo(() => {
    let rest = "";
    const live = ["", "", "", "", ""];
    layout.nodes.slice(0, -1).forEach((col, i) =>
      col.forEach((a, ai) =>
        layout.nodes[i + 1]!.forEach((b, bi) => {
          const seg = `M${a.x} ${a.y}L${b.x} ${b.y}`;
          if (i + 1 === active || i === active) live[(ai + bi) % 5] += seg;
          else rest += seg;
        }),
      ),
    );
    return { rest, live: live.filter(Boolean) };
  }, [layout, active]);

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
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Modules"
        className="no-scrollbar relative flex gap-1 overflow-x-auto rounded-full border border-line bg-void/50 p-1"
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="tab-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-cyan opacity-0"
        />
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
                // Until the moving pill is measured (and without JavaScript) the tab paints its own fill.
                selected ? "bg-cyan text-void [[data-pill=on]_&]:bg-transparent" : "text-haze hover:text-frost"
              }`}
            >
              <span className="relative">
                {m.year} · {m.module.replace("Module ", "M-")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          data-live
          className="h-auto w-full"
          role="img"
          aria-label={`Curriculum network with ${current.module} highlighted`}
        >
          {/* Synapses, as a handful of paths rather than hundreds of lines:
              everything at rest in one, and the wires into and out of the
              active layer in five groups that fire at slightly different
              speeds. Re-keyed per selection so each choice replays the burst. */}
          <path d={synapses.rest} fill="none" className="stroke-line" strokeOpacity={0.7} strokeWidth={0.6} />
          {synapses.live.map((d, g) => (
            <path
              key={`${active}-${g}`}
              d={d}
              fill="none"
              className="signal signal--burst stroke-cyan"
              strokeOpacity={0.55}
              strokeWidth={0.9}
              style={{ animationDuration: `${1.4 + g * 0.2}s` }}
            />
          ))}
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

        <div key={current.id} id={`panel-${current.id}`} role="tabpanel" aria-labelledby={`tab-${current.id}`} className="swap-in">
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
        </div>
      </div>
    </div>
  );
}
