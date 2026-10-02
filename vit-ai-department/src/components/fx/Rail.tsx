"use client";

import { useRef, type ReactNode } from "react";

/**
 * A horizontal, snap-scrolling rail. Native scrolling does the work (touch,
 * trackpad, shift-wheel, keyboard once focused); the buttons are a
 * convenience for mouse users and step by one card.
 */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-line-bright bg-deep/90 text-frost transition-colors hover:border-cyan hover:text-cyan";

  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" className={btn} onClick={() => step(-1)} aria-label={`Scroll ${label} back`}>
          ←
        </button>
        <button type="button" className={btn} onClick={() => step(1)} aria-label={`Scroll ${label} forward`}>
          →
        </button>
      </div>
      <ul
        ref={ref}
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 sm:-mx-8 sm:px-8"
      >
        {children}
      </ul>
    </div>
  );
}
