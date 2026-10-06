"use client";

import { useMemo, useRef, useState } from "react";
import type { FacultyMember } from "@/content/people";
import { useFlipFilter } from "@/motion/useFlipFilter";

/** First and last initials, skipping honorifics and middle initials ("Prof.", "Dr.", "P."). */
function initials(name: string) {
  const words = name.split(" ").filter((w) => w && !w.endsWith("."));
  return `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}`.toUpperCase();
}

/**
 * Filterable faculty directory. Themes are counted, most common first.
 * Changing the filter re-flows the grid with GSAP Flip (useFlipFilter).
 */
export default function FacultyGrid({ faculty }: { faculty: FacultyMember[] }) {
  const themes = useMemo(() => {
    const counts = new Map<string, number>();
    faculty.forEach((f) => f.themes.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [faculty]);
  const [theme, setTheme] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const flip = useFlipFilter(listRef);

  const matches = (f: FacultyMember, t: string | null) => t === null || f.themes.includes(t);
  const choose = (t: string | null) => {
    if (t === theme) return;
    flip(new Set(faculty.filter((f) => matches(f, t)).map((f) => f.name)), () => setTheme(t));
  };
  const shown = faculty.filter((f) => matches(f, theme)).length;

  const pill = (active: boolean) =>
    `label rounded-full border px-3.5 py-2 transition-colors ${
      active ? "border-cyan bg-cyan text-void" : "border-line text-haze hover:border-line-bright hover:text-frost"
    }`;

  return (
    <div>
      <div role="group" aria-label="Filter by research theme" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={theme === null} className={pill(theme === null)} onClick={() => choose(null)}>
          All · {faculty.length}
        </button>
        {themes.map((t) => (
          <button key={t} type="button" aria-pressed={theme === t} className={pill(theme === t)} onClick={() => choose(t)}>
            {t}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown} of {faculty.length} faculty members
      </p>

      <ul ref={listRef} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {faculty.map((f) => (
          <li key={f.name} data-flip-id={f.name} hidden={!matches(f, theme)}>
            <article className="holo group flex h-full flex-col p-6">
              <div className="flex items-center gap-4">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-dashed border-cyan/40 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:rotate-180 group-hover:border-cyan"
                  />
                  <span className="font-display text-heading text-gradient">{initials(f.name)}</span>
                </span>
                <div>
                  <h3 className="text-heading text-frost">{f.name}</h3>
                  <p className="label mt-1 text-haze">CSE (AI) Faculty</p>
                </div>
              </div>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Themes">
                {f.themes.map((t) => (
                  <li key={t} className="label rounded-full border border-violet/35 px-2.5 py-1 text-[0.625rem] text-violet">
                    {t}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-small text-haze" aria-label="Recent work">
                {f.work.map((w) => (
                  <li key={w} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                    {w}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
