"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AchievementCard } from "@/components/cards";
import type { Achievement, Level } from "@/content/events";

const LEVELS: (Level | "All")[] = ["All", "International", "National", "Inter-college"];

/** Achievements filtered by competition level, with counts from the data. */
export default function AchievementWall({ items }: { items: Achievement[] }) {
  const [level, setLevel] = useState<Level | "All">("All");
  const shown = level === "All" ? items : items.filter((a) => a.level === level);

  return (
    <div>
      <div role="group" aria-label="Filter by level" className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-void/50 p-1">
        {LEVELS.map((l) => {
          const on = level === l;
          const n = l === "All" ? items.length : items.filter((a) => a.level === l).length;
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              onClick={() => setLevel(l)}
              className={`relative rounded-full px-4 py-2 text-small font-medium transition-colors ${on ? "text-void" : "text-haze hover:text-frost"}`}
            >
              {on && <motion.span layoutId="level-pill" className="absolute inset-0 rounded-full bg-cyan" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">
                {l} · {n}
              </span>
            </button>
          );
        })}
      </div>
      <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((a) => (
            <motion.li
              key={a.title + a.who}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <AchievementCard a={a} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
