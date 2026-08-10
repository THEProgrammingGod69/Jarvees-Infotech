/**
 * The ambient layer.
 *
 * Everything here is decorative, `aria-hidden`, `pointer-events: none`, and
 * sits behind content. It is what gives the dark planes depth without reaching
 * for glassmorphism or a drop shadow: slow-drifting light, a drafting grid that
 * fades toward the horizon, and a sweep of accent along a section edge.
 *
 * All motion is CSS keyframes rather than JS, so the ambient layer costs no
 * main-thread time, and the global `prefers-reduced-motion` override in
 * globals.css stills every one of them without any component needing to check.
 */

export function AuroraBackdrop({
  className = "",
  intensity = 1,
}: {
  className?: string;
  /** 0–1.5. Above ~1 the amber starts reading as a warning state. */
  intensity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Amber, upper right — the light source. Kept low and wide so it reads
          as illumination rather than as a coloured blob. */}
      <div
        className="absolute -right-[15%] -top-[35%] h-[46vh] w-[80vw] rounded-full blur-[60px] [animation:drift_28s_ease-in-out_infinite] sm:h-[70vh] sm:w-[70vw] sm:blur-[90px]"
        style={{
          opacity: 0.16 * intensity,
          background:
            "radial-gradient(circle, var(--color-signal) 0%, transparent 65%)",
        }}
      />
      {/* A cool counter-light, lower left, so the page is lit from two sides
          and the base plane does not go flat. */}
      <div
        className="absolute -bottom-[30%] -left-[15%] h-[42vh] w-[75vw] rounded-full blur-[60px] [animation:drift_34s_ease-in-out_infinite_reverse] sm:h-[60vh] sm:w-[60vw] sm:blur-[95px]"
        style={{
          opacity: 0.3 * intensity,
          background:
            "radial-gradient(circle, #1d3a6b 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

/**
 * The drafting grid. Masked so it dissolves toward the edges rather than
 * stopping at a hard line — a grid with a visible boundary reads as a texture
 * swatch; one that fades reads as a plane extending past the viewport.
 */
export function BlueprintGrid({
  className = "",
  fade = "bottom",
}: {
  className?: string;
  fade?: "bottom" | "top" | "center";
}) {
  const mask =
    fade === "center"
      ? "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 100%)"
      : fade === "top"
        ? "linear-gradient(to top, transparent, #000 45%)"
        : "linear-gradient(to bottom, #000 0%, transparent 85%)";

  return (
    <div
      aria-hidden="true"
      className={`blueprint pointer-events-none absolute inset-0 -z-10 opacity-[0.55] ${className}`}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

/** A single amber hairline that sweeps across a section edge, once, slowly. */
export function EdgeSweep({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-px overflow-hidden ${className}`}
    >
      <div
        className="h-px w-[35%] [animation:sweep_7s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-signal), transparent)",
        }}
      />
    </div>
  );
}

/** Corner registration marks, as on a drawing sheet. Pure structure. */
export function CornerMarks({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "left-0 bottom-0 border-l border-b",
        "right-0 bottom-0 border-r border-b",
      ].map((pos) => (
        <span
          key={pos}
          className={`absolute h-3 w-3 border-signal/50 ${pos}`}
        />
      ))}
    </div>
  );
}
