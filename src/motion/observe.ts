/**
 * Element-level observers shared by the whole site — two IntersectionObservers
 * total, however many elements opt in:
 *
 * - `[data-reveal]` gains `.is-in` once, when it scrolls into view. CSS does
 *   the rest (entrances, word masks, odometers, dissolves, bars).
 * - `[data-live]` gains `.is-live` while it is on screen, which is what lets
 *   CSS run infinite animations (marquees, glitch, signals) only when they
 *   can be seen.
 *
 * A MutationObserver picks up elements that client components mount later.
 */
export function observeElements(): () => void {
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        reveal.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );

  const live = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle("is-live", entry.isIntersecting);
    },
    { rootMargin: "120px 0px" },
  );

  const scan = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => reveal.observe(el));
    root.querySelectorAll<HTMLElement>("[data-live]").forEach((el) => live.observe(el));
  };
  scan(document);

  const mo = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches("[data-reveal]:not(.is-in)")) reveal.observe(node);
        if (node.matches("[data-live]")) live.observe(node);
        scan(node);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    reveal.disconnect();
    live.disconnect();
    mo.disconnect();
  };
}

/** Run `cb` once, the first time `el` enters the viewport. */
export function onceVisible(el: Element, cb: () => void, threshold = 0.3): () => void {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      cb();
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
