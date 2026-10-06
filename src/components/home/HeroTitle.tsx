import { vars } from "@/components/ui";

/** Deterministic pseudo-random sequence: identical markup on every build. */
function sequence(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type Line = { text: string; gradient?: boolean };

/**
 * The home headline. Its characters rise in on load (CSS), and as the hero
 * scrolls away each one is pulled out of the line and drawn into the
 * Neural Core — tumbling, shrinking and fading on its own course and
 * schedule (a CSS scroll-driven animation on the compositor: `.hero .dz`).
 *
 * Each character is two nested spans so the two animations never compete
 * for the same transform: the outer one disperses, the inner one rises.
 * Gradient lines paint each character with its own slice of one gradient,
 * so the colour stays continuous while the letters move independently.
 */
export default function HeroTitle({ id, lines }: { id: string; lines: Line[] }) {
  const random = sequence(0x5eed);
  let order = 0;
  return (
    <h1 id={id} className="mt-6 text-hero text-frost">
      <span className="sr-only">{lines.map((l) => l.text).join(" ")}</span>
      {lines.map((line, li) => {
        const chars = [...line.text];
        const n = chars.length;
        let k = -1;
        return (
          <span key={li} aria-hidden="true" className={`block ${line.gradient ? "pb-2" : ""}`}>
            {line.text.split(" ").map((word, wi) => (
              <span key={wi}>
                {wi > 0 && " "}
                <span className="inline-block whitespace-nowrap">
                  {[...word].map((ch) => {
                    k += 1;
                    const i = order++;
                    // Slide right into the core (it sits right of centre while
                    // the hero is on screen). The downward drift roughly cancels
                    // the page scrolling up, so each letter holds its height on
                    // screen while it travels — then shrinks and fades into the
                    // particles, on its own course and schedule.
                    const x0 = 6 + (k / Math.max(1, n - 1)) * 40;
                    const dx = 64 - x0 + (random() - 0.5) * 16;
                    const dy = 40 + li * 8 + random() * 26;
                    const dr = (random() - 0.5) * 200;
                    const r0 = 4 + random() * 20;
                    const r1 = r0 + 30 + random() * 16;
                    return (
                      <span
                        key={k}
                        className="dz"
                        style={vars({
                          "--dx": `${dx.toFixed(1)}vw`,
                          "--dy": `${dy.toFixed(1)}vh`,
                          "--dr": `${dr.toFixed(0)}deg`,
                          "--r0": `${r0.toFixed(1)}%`,
                          "--r1": `${r1.toFixed(1)}%`,
                        })}
                      >
                        <span className={line.gradient ? "ch ch-grad" : "ch"} style={vars({ "--i": i, "--k": k, "--n": n })}>
                          {ch}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
