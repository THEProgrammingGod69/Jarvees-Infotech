import type { ReactNode } from "react";

/**
 * Above-the-fold entrance animations, in pure CSS.
 *
 * These exist because the JavaScript-driven equivalents must not be used in a
 * hero. `Reveal` and `Headline` start their subject at `opacity: 0` and only
 * animate once React has hydrated and Framer Motion's viewport observer has
 * fired — which measured as a **3.2 second largest-contentful-paint render
 * delay** on a throttled phone. The hero paragraph was invisible, waiting for
 * a script, for the entire time the browser could otherwise have been showing
 * it.
 *
 * A CSS animation starts at first paint. No hydration, no observer, no
 * client component, and nothing shipped to the browser at all — both of these
 * are server components.
 *
 * Reduced motion is handled by the global override in `globals.css`, which
 * collapses every animation to 0.001ms. Because these keyframes end on the
 * visible state with `both` fill mode, that override lands them fully drawn
 * rather than stuck at the initial frame.
 */

export function Rise({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Milliseconds. */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `fade-rise 720ms var(--ease-out-expo) ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * A masked, word-by-word rise — the same effect as `Headline`, without the
 * client component. Each word sits in an `overflow: hidden` box and rises into
 * it, so the line appears to be revealed by a moving edge.
 *
 * Styling constraint, same as `Headline`: do not combine with a
 * `background-clip: text` gradient. A background clipped to text does not
 * paint through the nested inline-blocks that build the mask, and the heading
 * renders invisible.
 */
export function RiseText({
  text,
  className = "",
  delay = 0,
  stagger = 55,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  /** Milliseconds before the first word. */
  delay?: number;
  /** Milliseconds between words. */
  stagger?: number;
  as?: "h1" | "h2" | "p";
}) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {/* The real string stays in the accessibility tree as one sentence; the
          animated copy is split into words and hidden from it, so a screen
          reader never hears the text word by word. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden align-bottom"
            // Vertical room so descenders are not clipped by the mask.
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <span
              className="inline-block"
              style={{
                animation: `word-rise 900ms var(--ease-out-expo) ${delay + i * stagger}ms both`,
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
