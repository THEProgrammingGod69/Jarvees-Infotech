"use client";

import { useEffect, useState } from "react";

type Parts = { d: number; h: number; m: number; s: number };

function diff(target: number): Parts | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/**
 * Live countdown. The server cannot know the visitor's "now", so it renders
 * dashes and the client fills in real values after mount — no hydration
 * mismatch, no wrong number flashed at load. Each digit is keyed by its
 * value, so a change re-mounts it and replays the flip.
 */
export default function Countdown({ to, endedLabel = "Live now" }: { to: string; endedLabel?: string }) {
  const target = new Date(to).getTime();
  const [parts, setParts] = useState<Parts | null | undefined>(undefined);

  useEffect(() => {
    setParts(diff(target));
    const id = window.setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (parts === null) {
    return (
      <p className="label inline-flex items-center gap-2 text-magenta">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-magenta text-magenta" />
        {endedLabel}
      </p>
    );
  }

  const cells: [string, number | undefined][] = [
    ["Days", parts?.d],
    ["Hours", parts?.h],
    ["Minutes", parts?.m],
    ["Seconds", parts?.s],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off">
      {cells.map(([label, v]) => {
        const text = v === undefined ? "--" : String(v).padStart(2, "0");
        return (
          <div key={label} className="hud-corners rounded-lg bg-void/60 px-2 py-3 text-center sm:px-4">
            <span
              key={text}
              className="block font-display text-[clamp(1.6rem,4vw,2.6rem)] leading-none font-semibold tabular-nums text-frost [animation:rise_.5s_var(--ease-out-expo)_both]"
            >
              {text}
            </span>
            <span className="label mt-2 block text-haze">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
