/**
 * Reading-progress hairline. Browsers with scroll-driven animations draw it
 * entirely in CSS on the compositor (see `.scroll-progress`); this passive,
 * frame-coalesced listener is only attached where they don't.
 */
export function progressFallback(): () => void {
  if (CSS.supports("animation-timeline: scroll()")) return () => {};
  const bar = document.querySelector<HTMLElement>(".scroll-progress");
  if (!bar) return () => {};
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty("--progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
