import { onceVisible } from "./observe";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01ΣΔλ";

/**
 * `[data-scramble]` — short mono labels that decode, left to right, the
 * first time they are seen. Server-rendered text stays in the DOM (the
 * animated element is an aria-hidden twin), and the sweep is time-based,
 * so a slow device finishes on time instead of stretching the noise.
 */
export function scrambleLabels(): () => void {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const text = el.textContent ?? "";
    const chars = [...text];
    const lockAt = chars.map((_, i) => i * 18 + Math.random() * 140 + 60);
    const total = Math.max(...lockAt);
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = now - start;
        let out = "";
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i]!;
          out += c === " " || c === "/" || t >= lockAt[i]! ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out;
        if (t < total) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = onceVisible(el, run, 0.5);
    cleanups.push(() => {
      stop();
      cancelAnimationFrame(raf);
      el.textContent = text;
    });
  });
  return () => cleanups.forEach((c) => c());
}

/**
 * `[data-terminal]` — a terminal that types itself when it scrolls into
 * view. Every line is server-rendered in full; typing only moves characters
 * from a transparent "rest" span into the visible "typed" span, so the box
 * has its final size from the first paint and can never shift the layout.
 * Two text nodes change per frame — no framework renders involved.
 */
export function typeTerminals(): () => void {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-terminal]").forEach((term) => {
    const lines = Array.from(term.querySelectorAll<HTMLElement>("[data-line]")).map((line) => {
      const typed = line.querySelector<HTMLElement>("[data-typed]")!;
      const rest = line.querySelector<HTMLElement>("[data-rest]")!;
      return { typed, rest, text: typed.textContent ?? "" };
    });
    if (!lines.length) return;
    let raf = 0;
    const setAll = (n: number) => {
      let budget = n;
      let caretPlaced = false;
      for (const l of lines) {
        const shown = Math.max(0, Math.min(l.text.length, budget));
        budget -= l.text.length;
        l.typed.textContent = l.text.slice(0, shown);
        l.rest.textContent = l.text.slice(shown);
        const current = !caretPlaced && shown < l.text.length;
        if (current) caretPlaced = true;
        l.typed.classList.toggle("caret", current);
      }
    };
    const total = lines.reduce((n, l) => n + l.text.length, 0);
    setAll(0);
    const stop = onceVisible(term, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const n = Math.min(total, Math.floor((now - start) / 13));
        setAll(n);
        if (n < total) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    cleanups.push(() => {
      stop();
      cancelAnimationFrame(raf);
      setAll(total);
    });
  });
  return () => cleanups.forEach((c) => c());
}
