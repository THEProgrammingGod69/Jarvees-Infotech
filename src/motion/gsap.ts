/**
 * Lazy GSAP loaders. Nothing here is in the initial bundle: GSAP and each
 * plugin are fetched on demand — after the page is idle, and only on pages
 * whose markup asks for them — then cached for the rest of the visit.
 */
import type { gsap as GSAP } from "gsap";

export type Gsap = typeof GSAP;

let core: Promise<{ gsap: Gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }> | null = null;

export function loadCore() {
  core ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    // Keep ScrollTrigger from recalculating on every mobile URL-bar resize.
    st.ScrollTrigger.config({ ignoreMobileResize: true });
    // Sections render lazily (content-visibility) and images and fonts
    // arrive late, so the page grows after triggers are measured. Re-measure,
    // debounced, whenever the document's height actually changes.
    let height = document.documentElement.scrollHeight;
    let timer = 0;
    new ResizeObserver(() => {
      const next = document.documentElement.scrollHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => st.ScrollTrigger.refresh(), 200);
    }).observe(document.body);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return core;
}

let flip: Promise<{ gsap: Gsap; Flip: typeof import("gsap/Flip").Flip }> | null = null;

export function loadFlip() {
  flip ??= Promise.all([import("gsap"), import("gsap/Flip")]).then(([g, f]) => {
    g.gsap.registerPlugin(f.Flip);
    return { gsap: g.gsap, Flip: f.Flip };
  });
  return flip;
}

let path: Promise<{
  gsap: Gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  MotionPathPlugin: typeof import("gsap/MotionPathPlugin").MotionPathPlugin;
  DrawSVGPlugin: typeof import("gsap/DrawSVGPlugin").DrawSVGPlugin;
}> | null = null;

export function loadPath() {
  path ??= Promise.all([loadCore(), import("gsap/MotionPathPlugin"), import("gsap/DrawSVGPlugin")]).then(([c, mp, ds]) => {
    c.gsap.registerPlugin(mp.MotionPathPlugin, ds.DrawSVGPlugin);
    return { ...c, MotionPathPlugin: mp.MotionPathPlugin, DrawSVGPlugin: ds.DrawSVGPlugin };
  });
  return path;
}

let inertia: Promise<{ gsap: Gsap; InertiaPlugin: typeof import("gsap/InertiaPlugin").InertiaPlugin }> | null = null;

export function loadInertia() {
  inertia ??= Promise.all([import("gsap"), import("gsap/InertiaPlugin")]).then(([g, ip]) => {
    g.gsap.registerPlugin(ip.InertiaPlugin);
    return { gsap: g.gsap, InertiaPlugin: ip.InertiaPlugin };
  });
  return inertia;
}
