"use client";

import { useEffect, useState, type ReactNode } from "react";

// Module scope survives client-side navigations. It is only ever set in an
// effect — effects never run during static generation, so every page is
// pre-rendered (and hydrated) without the transition.
let hasMounted = false;

/**
 * Page transition for client-side navigations only: a beam of light sweeps
 * down the viewport while the new page fades in. The first page of a visit
 * renders without it, so the initial paint is never delayed or repeated.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasMounted);
  useEffect(() => {
    hasMounted = true;
  }, []);
  return (
    <div className={animate ? "page-enter" : undefined}>
      {animate && <div aria-hidden="true" className="route-wipe" />}
      {children}
    </div>
  );
}
