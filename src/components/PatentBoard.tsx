"use client";

import { useRef, useState } from "react";
import { FilterTabs } from "@/components/FilterTabs";
import type { Patent, PatentStatus } from "@/content/research";
import { useFlipFilter } from "@/motion/useFlipFilter";

const tone: Record<PatentStatus, string> = {
  Granted: "border-cyan/50 text-cyan",
  Published: "border-violet/50 text-violet",
  Filed: "border-line-bright text-haze",
};

const TABS: (PatentStatus | "All")[] = ["All", "Granted", "Published", "Filed"];

/** Patents with a status filter; counts come from the data, never typed in. */
export default function PatentBoard({ patents }: { patents: Patent[] }) {
  const [status, setStatus] = useState<PatentStatus | "All">("All");
  const listRef = useRef<HTMLUListElement>(null);
  const flip = useFlipFilter(listRef);
  const matches = (p: Patent, s: PatentStatus | "All") => s === "All" || p.status === s;

  const choose = (s: PatentStatus | "All") => {
    if (s === status) return;
    flip(new Set(patents.filter((p) => matches(p, s)).map((p) => p.title)), () => setStatus(s));
  };

  return (
    <div>
      <FilterTabs
        label="Filter patents by status"
        options={TABS.map((t) => ({ value: t, label: `${t} · ${patents.filter((p) => matches(p, t)).length}` }))}
        value={status}
        onChange={choose}
      />
      <p className="sr-only" aria-live="polite">
        Showing {patents.filter((p) => matches(p, status)).length} of {patents.length} patents
      </p>

      <ul ref={listRef} className="mt-8 grid gap-4 md:grid-cols-2">
        {patents.map((p) => (
          <li key={p.title} data-flip-id={p.title} hidden={!matches(p, status)}>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
