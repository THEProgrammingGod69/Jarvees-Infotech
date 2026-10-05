import type { ReactNode } from "react";

/**
 * Infinite CSS marquee. The track is rendered twice and translated by -50%,
 * so the loop is seamless at any content width; the copy is aria-hidden so a
 * screen reader hears each item once. Pauses on hover; stops entirely under
 * reduced motion (the first copy then reads as a static, wrapping row).
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
    <div className={`marquee-mask group overflow-hidden ${className}`} role="region" aria-label={label}>
      <div
        className={`marquee-track flex w-max group-hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ ["--marquee-duration" as string]: `${seconds}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
