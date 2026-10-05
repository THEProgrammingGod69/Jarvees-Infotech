"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Patent, PatentStatus } from "@/content/research";

const tone: Record<PatentStatus, string> = {
  Granted: "border-cyan/50 text-cyan",
  Published: "border-violet/50 text-violet",
  Filed: "border-line-bright text-haze",
};

/** Patents with a status filter; counts come from the data, never typed in. */
export default function PatentBoard({ patents }: { patents: Patent[] }) {
  const [status, setStatus] = useState<PatentStatus | "All">("All");
  const shown = status === "All" ? patents : patents.filter((p) => p.status === status);
  const count = (s: PatentStatus) => patents.filter((p) => p.status === s).length;
  const tabs: (PatentStatus | "All")[] = ["All", "Granted", "Published", "Filed"];

  return (
    <div>
      <div role="group" aria-label="Filter patents by status" className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-void/50 p-1">
        {tabs.map((t) => {
          const on = status === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => setStatus(t)}
              className={`relative rounded-full px-4 py-2 text-small font-medium transition-colors ${on ? "text-void" : "text-haze hover:text-frost"}`}
            >
              {on && <motion.span layoutId="patent-pill" className="absolute inset-0 rounded-full bg-cyan" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">
                {t} · {t === "All" ? patents.length : count(t)}
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul layout className="mt-8 grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.li
              key={p.title}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <article className="holo flex h-full flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`label rounded-full border px-2.5 py-1 text-[0.625rem] ${tone[p.status]}`}>{p.status}</span>
                  <span className="label text-[0.625rem] text-haze">
                    {p.jurisdiction} · {p.year}
                  </span>
                  <span className="label ml-auto text-[0.625rem] text-violet">{p.domain}</span>
                </div>
                <h3 className="mt-4 text-body font-semibold text-frost">{p.title}</h3>
                <p className="mt-auto pt-4 text-small text-haze">{p.inventor}</p>
              </article>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
