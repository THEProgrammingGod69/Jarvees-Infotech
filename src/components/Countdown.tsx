"use client";

import { useEffect, useRef, useState } from "react";
import { vars } from "@/components/ui";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;
const BLANK = ["--", "--", "--", "--"];

/** Remaining time as zero-padded strings, or null once the moment has passed. */
function remaining(target: number): string[] | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) =>
    String(n).padStart(2, "0"),
  );
}

/**
 * One split-flap character. When it changes, the old upper leaf falls away
 * and the new lower leaf lands over the old one (CSS 3D transforms). The
 * leaves are keyed by the transition, so each change re-mounts them and
 * replays the flip; an unchanged digit renders as two still halves.
 */
function Flap({ ch, prev, stagger }: { ch: string; prev: string; stagger: number }) {
  const changed = ch !== prev;
  return (
    <span className="flap" style={vars({ "--fd": `${stagger}ms` })}>
      <span className="flap__top">
        <span>{ch}</span>
      </span>
      <span className="flap__bottom">
        <span>{changed ? prev : ch}</span>
      </span>
      {changed && (
        <>
          <span key={`fall-${prev}-${ch}`} className="flap__fall">
            <span>{prev}</span>
          </span>
          <span key={`land-${prev}-${ch}`} className="flap__land">
            <span>{ch}</span>
          </span>
        </>
      )}
    </span>
  );
}

/**
 * A split-flap departure board counting down to an event.
 *
 * The server cannot know the visitor's "now", so it renders dashes; the
 * board fills — every flap cascading over at once — the first time it
 * scrolls into view, then ticks once a second while it is on screen and the
 * tab is visible. Off screen it does no work at all.
 */
export default function Countdown({ to, endedLabel = "Live now", label }: { to: string; endedLabel?: string; label: string }) {
  const target = new Date(to).getTime();
  const ref = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<{ now: string[] | null; prev: string[]; first: boolean }>({
    now: BLANK,
    prev: BLANK,
    first: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    let onScreen = false;
    let started = false;

    const tick = () => {
      const now = remaining(target);
      const first = !started;
      started = true;
      setBoard((b) => ({ now, prev: b.now ?? BLANK, first }));
    };
    const run = () => {
      window.clearInterval(timer);
      if (!onScreen || document.hidden) return;
      tick();
      // Align ticks to the wall-clock second so every flap changes together.
      timer = window.setTimeout(() => {
        tick();
        timer = window.setInterval(tick, 1000);
      }, 1000 - (Date.now() % 1000));
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      run();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.clearInterval(timer);
      window.clearTimeout(timer);
    };
  }, [target]);

  if (board.now === null) {
    return (
      <p className="label inline-flex items-center gap-3 text-magenta">
        <span aria-hidden="true" data-live className="live-dot" />
        {endedLabel}
      </p>
    );
  }

  const now = board.now;
  const spoken = now[0] === "--" ? "" : `${Number(now[0])} days, ${Number(now[1])} hours, ${Number(now[2])} minutes`;

  return (
    <div ref={ref} role="timer" aria-label={label} className="grid grid-cols-4 gap-2 sm:gap-3">
      {spoken && <span className="sr-only">{spoken}</span>}
      {UNITS.map((unit, c) => (
        <div key={unit} className="hud-corners rounded-lg bg-void/60 px-1.5 py-3 text-center sm:px-3">
          <span
            aria-hidden="true"
            className="flex justify-center gap-[0.08em] font-display text-[clamp(1.45rem,3.4vw,2.35rem)] leading-none font-semibold tabular-nums text-frost"
          >
            {[...now[c]!].map((ch, i) => (
              <Flap key={i} ch={ch} prev={board.prev[c]?.[i] ?? ch} stagger={board.first ? (c * 2 + i) * 70 : 0} />
            ))}
          </span>
          <span className="label mt-2.5 block text-haze">{unit}</span>
        </div>
      ))}
    </div>
  );
}
