"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * A segmented filter control: toggle buttons in a capsule, with one pill
 * that glides to the selected option (a transform, measured from the DOM).
 * Until the pill is measured — and without JavaScript — the selected
 * button paints its own fill.
 */
export function FilterTabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  const place = useCallback((animate: boolean) => {
    const group = groupRef.current;
    const pill = pillRef.current;
    const on = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!group || !pill || !on) return;
    pill.style.transition = animate && pill.style.opacity === "1" ? "" : "none";
    pill.style.width = `${on.offsetWidth}px`;
    pill.style.height = `${on.offsetHeight}px`;
    pill.style.transform = `translate3d(${on.offsetLeft}px, ${on.offsetTop}px, 0)`;
    pill.style.opacity = "1";
    group.dataset.pill = "on";
  }, []);

  useLayoutEffect(() => place(true), [value, place]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(group);
    return () => ro.disconnect();
  }, [place]);

  return (
    <div ref={groupRef} role="group" aria-label={label} className="relative inline-flex flex-wrap gap-1 rounded-[1.5rem] border border-line bg-void/50 p-1">
      <span ref={pillRef} aria-hidden="true" className="tab-pill pointer-events-none absolute top-0 left-0 rounded-full bg-cyan opacity-0" />
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-4 py-2 text-small font-medium transition-colors ${
              on ? "bg-cyan text-void [[data-pill=on]_&]:bg-transparent" : "text-haze hover:text-frost"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
