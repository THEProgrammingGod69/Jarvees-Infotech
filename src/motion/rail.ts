/**
 * `[data-rail]` — a horizontal, snap-scrolling list. Native scrolling does
 * the work (touch, trackpad, keyboard once focused); the ← → buttons
 * (`[data-rail-step]`) step one card. Mouse drag-and-throw is added by the
 * GSAP layer (effects/rail-inertia.ts) once it loads.
 */
export function bindRails(): () => void {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-rail]").forEach((rail) => {
    const track = rail.querySelector<HTMLElement>("[data-rail-track]");
    if (!track) return;
    const onClick = (e: Event) => {
      const btn = (e.target as Element).closest<HTMLElement>("[data-rail-step]");
      if (!btn) return;
      const dir = Number(btn.dataset.railStep) || 1;
      const card = track.querySelector("li");
      const width = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * width, behavior: "smooth" });
    };
    rail.addEventListener("click", onClick);
    cleanups.push(() => rail.removeEventListener("click", onClick));
  });
  return () => cleanups.forEach((c) => c());
}
