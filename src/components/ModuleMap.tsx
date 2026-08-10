"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import {
  nodes,
  edges,
  edgesFor,
  getNode,
  type NodeId,
} from "@/content/landscape";

/**
 * The module map — the site's signature element.
 *
 * Architecture: edges are SVG (they are drawn between arbitrary points), nodes
 * are HTML absolutely positioned in the same percentage coordinate space. That
 * combination gives crisp text at every viewport, real `<a>` elements for
 * keyboard and screen reader users, and native focus handling — none of which
 * SVG text would.
 *
 * Interaction: eight ordinary links. Hover or focus reveals what the module
 * does; activating it opens the course. No roving tabindex, because this is
 * navigation rather than a composite widget, and a screen reader user is
 * better served by a plain list of eight modules.
 *
 * Motion: the diagram assembles on load — edges draw themselves along their
 * own length, then nodes settle — and a packet of light travels each active
 * integration edge, in the direction the document actually flows. All of it is
 * SVG/CSS, so it costs no main-thread time, and the global reduced-motion
 * override stills every part of it.
 */

const DEFAULT_NODE: NodeId = "fico";

function edgePath(fromX: number, fromY: number, toX: number, toY: number, bow = 0) {
  if (bow === 0) return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  const cx = (fromX + toX) / 2;
  const cy = (fromY + toY) / 2 - bow;
  return `M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`;
}

export default function ModuleMap() {
  const [active, setActive] = useState<NodeId>(DEFAULT_NODE);
  const [pinned, setPinned] = useState(false);
  const reduced = useReducedMotion();

  const activeNode = getNode(active);
  const activeEdges = useMemo(() => edgesFor(active), [active]);

  const isEdgeActive = useCallback(
    (from: NodeId, to: NodeId) => from === active || to === active,
    [active],
  );

  const hover = (id: NodeId) => {
    if (!pinned) setActive(id);
  };

  return (
    <div className="w-full">
      {/* The hero has no visible h2, so the detail panel's h3 would follow the
          page h1 directly and break heading order. This names the region for
          screen reader navigation and restores the sequence. */}
      <h2 className="sr-only">The SAP module landscape</h2>

      <div className="relative xl:pl-20">
        {/* Layer labels live in a dedicated left gutter rather than floating
            over the diagram, so they cannot collide with the leftmost nodes. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 xl:block"
        >
          {[
            { y: 19, label: "Platform" },
            { y: 57, label: "Functional" },
            { y: 84, label: "Foundation" },
          ].map((layer) => (
            <span
              key={layer.label}
              className="absolute left-0 -translate-y-1/2 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel"
              style={{ top: `${layer.y}%` }}
            >
              {layer.label}
            </span>
          ))}
        </div>

        <div
          className="relative aspect-[1/1.18] w-full select-none sm:aspect-[1/0.84]"
          onMouseLeave={() => setPinned(false)}
        >
          {/* A faint grid behind the diagram, so the schematic sits on a sheet
              rather than floating in the dark. */}
          <div
            aria-hidden="true"
            className="blueprint absolute inset-0 -z-10 opacity-40"
            style={{
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 100%)",
            }}
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {edges.map((edge, i) => {
              const from = getNode(edge.from);
              const to = getNode(edge.to);
              if (!from || !to) return null;

              // Materials Management to Sales & Distribution is the only edge
              // whose straight line would pass through another node (FICO), so
              // it is bowed above the functional row.
              const bow =
                (edge.from === "sd" && edge.to === "mm") ||
                (edge.from === "mm" && edge.to === "sd")
                  ? 15
                  : 0;

              const d = edgePath(from.x, from.y, to.x, to.y, bow);
              const on = isEdgeActive(edge.from, edge.to);

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  {/* The edge itself. `pathLength="100"` normalises every path
                      to 100 units, so one dash pattern draws any length of
                      line correctly regardless of its real geometry. */}
                  <path
                    d={d}
                    fill="none"
                    pathLength={100}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={on ? 1.3 : 1}
                    stroke={on ? "var(--color-signal)" : "var(--color-hairline)"}
                    strokeDasharray={edge.kind === "substrate" ? "2.5 2.5" : undefined}
                    style={{
                      opacity: on ? 1 : 0.8,
                      transition:
                        "stroke var(--duration-base) ease, stroke-width var(--duration-base) ease, opacity var(--duration-base) ease",
                      ...(reduced
                        ? {}
                        : {
                            animation: `edge-draw 900ms var(--ease-out-expo) ${150 + i * 45}ms both`,
                          }),
                    }}
                  />

                  {/* A packet of light travelling the edge — only on the
                      integrations touching the active module, so the eye is
                      pulled along exactly the relationships being described. */}
                  {on && !reduced && (
                    <path
                      d={d}
                      fill="none"
                      pathLength={100}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth={2}
                      stroke="var(--color-signal)"
                      strokeLinecap="round"
                      strokeDasharray="7 93"
                      filter="url(#edge-glow)"
                      style={{
                        animation: `packet-run 2.6s linear infinite ${i * 0.18}s`,
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          <ul className="absolute inset-0 m-0 list-none p-0">
            {nodes.map((node, i) => {
              const on = node.id === active;
              return (
                // The centring transform and the intro animation must live on
                // different elements: the keyframe ends at `transform: none`,
                // which would otherwise wipe the translate that puts the node
                // on its grid point.
                <li
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    style={
                      reduced
                        ? undefined
                        : {
                            animation: `fade-rise 620ms var(--ease-out-expo) ${520 + i * 60}ms both`,
                          }
                    }
                  >
                    <Link
                      href={`/courses/${node.slug}`}
                      onMouseEnter={() => hover(node.id)}
                      onFocus={() => setActive(node.id)}
                      onClick={() => setActive(node.id)}
                      onTouchStart={() => {
                        setActive(node.id);
                        setPinned(true);
                      }}
                      aria-current={on ? "true" : undefined}
                      // Fixed box, not content-sized. These chips are centred
                      // on their grid point, so when a web font swapped in and
                      // changed the text metrics every node resized about its
                      // own centre — measured as the page's entire cumulative
                      // layout shift.
                      className={`relative flex w-[74px] flex-col items-center justify-center border px-2 py-2 text-center transition-all duration-(--duration-base) md:h-[54px] md:w-[136px] ${
                        on
                          ? "-translate-y-0.5 border-signal bg-slate"
                          : "border-hairline bg-graphite/90 hover:-translate-y-0.5 hover:border-steel-dim hover:bg-slate"
                      }`}
                      style={on ? { boxShadow: "var(--glow-signal)" } : undefined}
                    >
                      <span
                        className={`block font-mono text-[0.6875rem] font-medium tracking-[0.1em] transition-colors sm:text-xs ${
                          on ? "text-signal" : "text-chalk"
                        }`}
                      >
                        {node.code}
                      </span>
                      <span className="mt-1 hidden text-[0.625rem] leading-tight text-steel md:block">
                        {node.name.length > 22
                          ? node.name.split(" ").slice(0, 2).join(" ")
                          : node.name}
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
        <span className="flex items-center gap-2">
          <svg width="18" height="2" aria-hidden="true">
            <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1" />
          </svg>
          Document flow
        </span>
        <span className="flex items-center gap-2">
          <svg width="18" height="2" aria-hidden="true">
            <line
              x1="0"
              y1="1"
              x2="18"
              y2="1"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>
          Underpins
        </span>
        <span className="ml-auto hidden sm:block">Hover, tap or tab a module</span>
      </div>

      {/* Detail panel. `aria-live` so that moving focus through the nodes
          announces the same information a sighted user sees appear. */}
      <div
        aria-live="polite"
        className="relative mt-px overflow-hidden border border-hairline bg-graphite p-5 sm:p-6"
      >
        {/* Keyed, with no exit transition and no `mode="wait"`. An exit
            animation looks better in isolation but leaves the panel empty for
            ~300ms, and a keyboard user tabbing quickly through the eight nodes
            hits that gap every time — including the `aria-live` region, which
            then announces nothing. The new content simply replaces the old and
            fades up. */}
        <div>
          {activeNode && (
            <motion.div
              key={activeNode.id}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-heading text-chalk">{activeNode.name}</h3>
                <p className="font-mono text-mono-label uppercase text-signal">
                  {activeNode.code}
                </p>
              </div>

              <p className="mt-3 max-w-2xl text-body-s text-steel">
                {activeNode.does}
              </p>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                    Maps to the role
                  </dt>
                  <dd className="mt-1.5 text-body-s text-chalk">
                    {activeNode.role}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                    You will work in
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {activeNode.codes.map((code) => (
                      <span
                        key={code}
                        className="border border-hairline bg-slate px-1.5 py-0.5 font-mono text-[0.625rem] text-steel"
                      >
                        {code}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              {activeEdges.length > 0 && (
                <div className="mt-5 border-t border-hairline pt-4">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel">
                    Connects to
                  </p>
                  <ul className="mt-2 space-y-2">
                    {activeEdges.slice(0, 3).map((edge) => {
                      const otherId = edge.from === active ? edge.to : edge.from;
                      const other = getNode(otherId);
                      if (!other) return null;
                      return (
                        <li
                          key={`${edge.from}-${edge.to}`}
                          className="text-body-s text-steel"
                        >
                          <span className="font-mono text-[0.6875rem] text-chalk">
                            {other.code}
                          </span>
                          <span className="mx-2 text-steel">—</span>
                          {edge.reason}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <Link
                href={`/courses/${activeNode.slug}`}
                className="group mt-5 inline-flex items-center gap-2 font-mono text-mono-label uppercase text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
              >
                {activeNode.name} course
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-(--duration-fast) group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
