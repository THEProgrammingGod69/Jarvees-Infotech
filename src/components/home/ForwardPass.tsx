import type { ShapeName } from "@/components/core/shapes";
import { Chip, Container, vars } from "@/components/ui";

export type Layer = {
  shape: ShapeName;
  code: string;
  year: string;
  title: string;
  body: string;
  chips: string[];
};

/**
 * The four-year forward pass. On wide screens with scroll-driven animation
 * support the section pins and the four years slide past horizontally —
 * one layer of the network per year — while a HUD counts the layers, a
 * giant numeral drifts at its own speed behind each card, and the Neural
 * Core re-forms for every layer (each panel declares its shape). It is all
 * CSS on the compositor (`.hpass*` in globals.css); the only JavaScript is
 * the core's own observer.
 *
 * Everywhere else the same markup is a plain vertical sequence of panels.
 */
export default function ForwardPass({ layers }: { layers: Layer[] }) {
  const n = layers.length;
  return (
    <div className="hpass">
      <div className="hpass__sticky">
        <div aria-hidden="true" className="hpass__hud pointer-events-none absolute inset-x-0 top-24 z-10">
          <Container className="flex items-center gap-6">
            <p className="label text-haze">Forward pass</p>
            <div className="h-px flex-1 overflow-hidden bg-line">
              <div className="hpass__bar h-full bg-gradient-to-r from-cyan via-violet to-magenta" />
            </div>
            <p className="label flex items-center gap-1 text-haze">
              Layer
              <span className="inline-block h-[1.4em] overflow-hidden align-bottom text-cyan">
                <span className="hpass__index flex flex-col">
                  {layers.map((_, i) => (
                    <span key={i} className="block h-[1.4em] leading-[1.4em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ))}
                </span>
              </span>
              / {String(n).padStart(2, "0")}
            </p>
          </Container>
        </div>

        <ol className="hpass__track">
          {layers.map((l, i) => {
            // Each card settles as its panel reaches the centre and recedes as it leaves.
            const centre = i / (n - 1);
            const step = 1 / (n - 1);
            return (
              <li
                key={l.code}
                aria-labelledby={`layer-${i}`}
                data-core-shape={l.shape}
                data-core-intensity="0.95"
                data-core-align="right"
                className="hpass__panel relative flex min-h-[88vh] items-center py-16"
              >
                <span
                  aria-hidden="true"
                  className="hpass__numeral pointer-events-none absolute top-1/2 right-[6%] -translate-y-1/2 font-display text-[clamp(10rem,28vw,26rem)] leading-none font-semibold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_color-mix(in_oklab,var(--color-line-bright)_70%,transparent)] select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Container>
                  <div
                    data-reveal
                    className={`holo relative max-w-xl p-7 sm:p-10 ${i > 0 ? "hpass__card" : ""} ${i < n - 1 ? "hpass__card--out" : ""}`}
                    style={vars({
                      "--r0": `${((centre - step + step * 0.18) * 100).toFixed(1)}%`,
                      "--r1": `${((centre - step * 0.06) * 100).toFixed(1)}%`,
                      "--r2": `${((centre + step * 0.06) * 100).toFixed(1)}%`,
                      "--r3": `${((centre + step - step * 0.18) * 100).toFixed(1)}%`,
                    })}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="label text-cyan">{l.code}</p>
                      <p className="label text-haze">
                        {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                      </p>
                    </div>
                    <p className="label mt-6 text-violet">{l.year}</p>
                    <h3 id={`layer-${i}`} className="mt-3 text-display-xl text-frost">
                      {l.title}
                    </h3>
                    <p className="mt-5 text-body text-haze">{l.body}</p>
                    <ul className="mt-7 flex flex-wrap gap-2" aria-label="Courses">
                      {l.chips.map((c) => (
                        <li key={c}>
                          <Chip>{c}</Chip>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="bar-grow h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                        style={{ width: `${((i + 1) / n) * 100}%` }}
                      />
                    </div>
                  </div>
                </Container>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
