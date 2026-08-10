"use client";

import { LazyMotion, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll reveal — an 8px rise and a fade, once, on section headings only.
 *
 * Deliberately not applied to every card. A page where everything animates on
 * every scroll pass reads as a template; a page where one element per section
 * settles reads as considered.
 *
 * Bundle note: this uses `LazyMotion` with `m` rather than importing `motion`
 * directly, so the animation engine is fetched as a separate async chunk after
 * first paint instead of sitting in the critical bundle. Motion is decoration
 * here — it must not cost the page its largest-contentful-paint.
 *
 * `useReducedMotion` short-circuits to a plain element before any of that
 * loads, so a user who asked for stillness downloads no animation code at all
 * and is left with no transform on the node.
 */

const loadAnimations = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <LazyMotion features={loadAnimations} strict>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-64px" }}
        transition={{ duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
