"use client";

import { useRef, useState } from "react";
import { AchievementCard } from "@/components/cards";
import { FilterTabs } from "@/components/FilterTabs";
import type { Achievement, Level } from "@/content/events";
import { useFlipFilter } from "@/motion/useFlipFilter";

const LEVELS: (Level | "All")[] = ["All", "International", "National", "Inter-college"];
const key = (a: Achievement) => `${a.title} · ${a.who}`;

/** Achievements filtered by competition level, with counts from the data. */
export default function AchievementWall({ items }: { items: Achievement[] }) {
  const [level, setLevel] = useState<Level | "All">("All");
  const listRef = useRef<HTMLUListElement>(null);
  const flip = useFlipFilter(listRef);
  const matches = (a: Achievement, l: Level | "All") => l === "All" || a.level === l;

  const choose = (l: Level | "All") => {
    if (l === level) return;
    flip(new Set(items.filter((a) => matches(a, l)).map(key)), () => setLevel(l));
  };

  return (
    <div>
      <FilterTabs
        label="Filter by level"
        options={LEVELS.map((l) => ({ value: l, label: `${l} · ${items.filter((a) => matches(a, l)).length}` }))}
        value={level}
        onChange={choose}
      />
      <p className="sr-only" aria-live="polite">
        Showing {items.filter((a) => matches(a, level)).length} of {items.length} achievements
      </p>
      <ul ref={listRef} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <li key={key(a)} data-flip-id={key(a)} hidden={!matches(a, level)}>
            <AchievementCard a={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}
