"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { whenIdle } from "./idle";
import { cloneMarquees } from "./marquee";
import { observeElements, prefersReducedMotion } from "./observe";
import { progressFallback } from "./progress";
import { bindRails } from "./rail";
import { scrambleLabels, typeTerminals } from "./text";

/** Run `cb` once, the first time the reader scrolls (wheel, touch or keys all scroll). */
function onFirstScroll(cb: () => void): () => void {
  const run = () => {
    window.removeEventListener("scroll", run);
    cb();
  };
  window.addEventListener("scroll", run, { passive: true, once: true });
  return () => window.removeEventListener("scroll", run);
}

/** Run `cb` once, when any of `els` comes within `margin` of the viewport. */
function onApproach(els: Element[], cb: () => void, margin = "100% 0px"): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cb();
    },
    { rootMargin: margin },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/**
 * The one client component behind every page's motion. It renders nothing.
 *
 * Pages are server-rendered markup that opt into behaviour with data
 * attributes; this runtime wires them up after each navigation:
 *
 * - immediately: reveals, on-screen tracking, rails, progress fallback;
 * - once the page is idle: decoding labels and typing terminals;
 * - GSAP only when something actually needs it, and only the plugins that
 *   thing needs: velocity marquees on the reader's first scroll (velocity
 *   only exists while scrolling — until then they run as CSS), drag-and-
 *   throw when a mouse approaches a rail, the training run one screen
 *   before it is reached. Nothing GSAP competes with the first paint.
 *
 * Keeping this declarative means no section needs its own client component
 * (and its own hydration cost) just to animate.
 */
export default function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    let cancelled = false;
    const later = (fn: () => void) => () => {
      if (!cancelled) fn();
    };

    cleanups.push(cloneMarquees(), observeElements(), bindRails(), progressFallback());
    if (prefersReducedMotion()) return () => cleanups.forEach((c) => c());

    cleanups.push(whenIdle(later(() => cleanups.push(scrambleLabels(), typeTerminals()))));

    const marquees = Array.from(document.querySelectorAll<HTMLElement>("[data-marquee]"));
    if (marquees.length) {
      cleanups.push(
        onFirstScroll(
          later(() => {
            void Promise.all([import("./gsap"), import("./effects/marquee")]).then(async ([g, m]) => {
              const { gsap, ScrollTrigger } = await g.loadCore();
              if (cancelled) return;
              const undo: (() => void)[] = [];
              const ctx = gsap.context(() => marquees.forEach((el) => undo.push(m.velocityMarquee(el, gsap, ScrollTrigger))));
              cleanups.push(() => {
                ctx.revert();
                undo.forEach((u) => u());
              });
            });
          }),
        ),
      );
    }

    const rails = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
    if (rails.length && window.matchMedia("(pointer: fine)").matches) {
      let armed = false;
      const arm = later(() => {
        if (armed) return;
        armed = true;
        rails.forEach((el) => el.removeEventListener("pointerover", arm));
        void Promise.all([import("./gsap"), import("./effects/rail-inertia")]).then(async ([g, r]) => {
          const { gsap, InertiaPlugin } = await g.loadInertia();
          if (cancelled) return;
          rails.forEach((el) => cleanups.push(r.railInertia(el, gsap, InertiaPlugin)));
        });
      });
      // A mouse entering the rail's neighbourhood is enough warning: the
      // plugin is in place long before a drag can start.
      rails.forEach((el) => el.addEventListener("pointerover", arm, { once: true }));
      cleanups.push(() => rails.forEach((el) => el.removeEventListener("pointerover", arm)));
      cleanups.push(onApproach(rails, () => whenIdle(arm, 2000), "0px"));
    }

    const descents = Array.from(document.querySelectorAll<HTMLElement>("[data-descent]"));
    if (descents.length) {
      cleanups.push(
        onApproach(
          descents,
          later(() => {
            void Promise.all([import("./gsap"), import("./effects/descent")]).then(async ([g, d]) => {
              const libs = await g.loadPath();
              if (cancelled) return;
              descents.forEach((el) => cleanups.push(d.descent(el, libs)));
              // Fonts and images may have moved things since load.
              void document.fonts?.ready.then(() => !cancelled && libs.ScrollTrigger.refresh());
            });
          }),
        ),
      );
    }

    return () => {
      cancelled = true;
      cleanups.forEach((c) => c());
    };
  }, [pathname]);

  return null;
}
