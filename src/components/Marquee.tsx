import type { ReactNode } from "react";
import { vars } from "@/components/ui";

/**
 * Infinite marquee. The server renders the row once; the browser clones it
 * (motion/marquee.ts — aria-hidden, so a screen reader hears each item
 * once) and the track moves by -50%, so the loop is seamless at any
 * content width. Without JavaScript it is a still row.
 *
 * It starts as a CSS animation that only runs while on screen. Once the
 * page is idle, GSAP takes the track over (motion/effects/marquee.ts) and
 * ties it to the reader's scrolling: faster with scroll speed, backwards
 * when scrolling up, leaning into the motion. Reduced motion stops it, and
 * the first copy reads as a static row.
 */
export default function Marquee({
  children,
  reverse = false,
  seconds = 40,
  className = "",
  label,
}: {
  children: ReactNode;
  reverse?: boolean;
  seconds?: number;
  className?: string;
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      data-marquee
      data-live
      data-reverse={reverse ? "true" : undefined}
      data-seconds={seconds}
      className={`marquee-mask group overflow-hidden ${className}`}
    >
      <div
        className={`marquee-track flex w-max group-hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={vars({ "--marquee-duration": `${seconds}s` })}
      >
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}
