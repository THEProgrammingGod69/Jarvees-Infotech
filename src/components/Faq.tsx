"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import type { FaqItem } from "@/lib/faq";

/**
 * FAQ accordion.
 *
 * Built as buttons with `aria-expanded` and `aria-controls` rather than native
 * `<details>`, because the answer height is animated and `<details>` cannot be
 * transitioned reliably across browsers. The accessibility contract is written
 * out by hand instead: each control names its region, focus stays on the
 * control, and the panel is a labelled region.
 *
 * Under reduced motion the panel opens and closes instantly with no height
 * animation at all — a spring on a growing box is exactly the kind of movement
 * that provokes discomfort.
 */
export default function Faq({
  items,
  className = "",
}: {
  items: FaqItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <div className={`border-t border-hairline ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-hairline">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-control-${i}`}
                className="group flex w-full items-start gap-5 py-6 text-left transition-colors duration-(--duration-fast) hover:text-signal"
              >
                <span className="mt-1 font-mono text-mono-label text-steel tnum">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-heading text-chalk transition-colors group-hover:text-signal">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-1 shrink-0 font-mono text-heading leading-none text-steel transition-transform duration-(--duration-base) ${
                    isOpen ? "rotate-45 text-signal" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-control-${i}`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 pl-11 text-body-l text-steel">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
