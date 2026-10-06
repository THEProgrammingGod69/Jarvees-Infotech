import type { ReactNode } from "react";

const button =
  "grid h-11 w-11 place-items-center rounded-full border border-line-bright bg-deep/90 text-frost transition-colors hover:border-cyan hover:text-cyan";

/**
 * A horizontal, snap-scrolling list. Native scrolling does the work (touch,
 * trackpad, shift-wheel, keyboard once focused). With JavaScript, ← → step
 * one card (motion/rail.ts) and, with a mouse, the rail can be grabbed and
 * thrown — it glides to rest on the nearest card (GSAP InertiaPlugin,
 * motion/effects/rail-inertia.ts).
 */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div data-rail>
      <div className="rail-controls mb-6 justify-end gap-2">
        <button type="button" className={button} data-rail-step="-1" aria-label={`Scroll ${label} back`}>
          ←
        </button>
        <button type="button" className={button} data-rail-step="1" aria-label={`Scroll ${label} forward`}>
          →
        </button>
      </div>
      <ul
        data-rail-track
        aria-label={label}
        tabIndex={0}
        className="rail-track no-scrollbar relative -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {children}
      </ul>
    </div>
  );
}
