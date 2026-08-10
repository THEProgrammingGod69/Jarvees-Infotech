"use client";

import Link from "next/link";
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
 * Architecture note: edges are SVG (they need to be drawn between arbitrary
 * points), nodes are HTML absolutely positioned in the same percentage
 * coordinate space. That combination is deliberate — HTML nodes give crisp
 * text at every viewport, real `<a>` elements for keyboard and screen reader
 * users, and native focus handling, none of which SVG text would.
 *
 * Interaction: every node is an ordinary link. Hover or focus reveals what the
 * module does; activating it opens the course. There is no custom key
 * handling, because eight real links are more predictable for keyboard and
 * screen reader users than a roving-tabindex widget would be — a screen reader
 * user gets a proper list of eight navigable modules.
 */

const DEFAULT_NODE: NodeId = "fico";

/** Node centres are percentages, so edges and nodes share one coordinate space. */
function edgePath(fromX: number, fromY: number, toX: number, toY: number, bow = 0) {
  if (bow === 0) return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  const cx = (fromX + toX) / 2;
  const cy = (fromY + toY) / 2 - bow;
  return `M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`;
}

export default function ModuleMap() {
  const [active, setActive] = useState<NodeId>(DEFAULT_NODE);
  const [pinned, setPinned] = useState(false);

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
      {/* The hero has no visible h2, so the map's detail panel h3 would follow
          the page h1 directly and break heading order. This names the region
          for screen reader navigation and restores the sequence. */}
      <h2 className="sr-only">The SAP module landscape</h2>

      {/* The layer labels live in a dedicated left gutter rather than floating
          over the diagram, so they cannot collide with the leftmost nodes. */}
      <div className="relative xl:pl-20">
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
        className="relative w-full select-none aspect-[1/1.18] sm:aspect-[1/0.84]"
        onMouseLeave={() => setPinned(false)}
      >
        {/* Edges. preserveAspectRatio is "none" because the coordinate space is
            deliberately percentage-based; non-scaling-stroke keeps every line
            exactly 1px regardless of how that space is stretched. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 h-full w-full"
        >
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

            const on = isEdgeActive(edge.from, edge.to);

            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={edgePath(from.x, from.y, to.x, to.y, bow)}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={on ? 1.25 : 1}
                stroke={on ? "var(--color-signal)" : "var(--color-hairline)"}
                strokeDasharray={edge.kind === "substrate" ? "3 3" : undefined}
                style={{
                  opacity: on ? 1 : 0.85,
                  transition:
                    "stroke var(--duration-fast) linear, opacity var(--duration-fast) linear",
                  animation: `fade-in 500ms var(--ease-out-expo) ${120 + i * 28}ms both`,
                }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <ul className="absolute inset-0 m-0 list-none p-0">
          {nodes.map((node, i) => {
            const on = node.id === active;
            return (
              // The centring transform and the intro animation must live on
              // different elements: `fade-rise` ends at `transform: none`,
              // which would otherwise wipe the translate that puts the node on
              // its grid point.
              <li
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  style={{
                    animation: `fade-rise 460ms var(--ease-out-expo) ${360 + i * 45}ms both`,
                  }}
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
                  className={`relative block border px-2.5 py-2 text-center transition-colors duration-(--duration-fast) sm:px-3.5 sm:py-2.5 ${
                    on
                      ? "border-signal bg-slate"
                      : "border-hairline bg-graphite hover:border-steel-dim hover:bg-slate"
                  }`}
                >
                  {/* The live-system pulse. One element, one loop, on the
                      active node only — the whole site's animation budget. */}
                  {on && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 border border-signal"
                      style={{
                        animation: "signal-pulse 3s var(--ease-out-expo) infinite",
                      }}
                    />
                  )}
                  <span
                    className={`block font-mono text-[0.6875rem] font-medium tracking-[0.1em] sm:text-xs ${
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

      {/* Legend */}
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
        <span className="ml-auto hidden sm:block">
          Hover, tap or tab a module
        </span>
      </div>

      {/* Detail panel. aria-live so that moving focus through the nodes
          announces the same information a sighted user sees appear. */}
      <div
        aria-live="polite"
        className="mt-px border border-hairline bg-graphite p-5 sm:p-6"
      >
        {activeNode && (
          <>
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
              className="mt-5 inline-flex items-center gap-2 font-mono text-mono-label uppercase text-chalk underline decoration-steel-dim underline-offset-4 transition-colors hover:decoration-signal"
            >
              {activeNode.name} course
              <span aria-hidden="true">→</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
