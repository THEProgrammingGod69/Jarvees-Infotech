import Image from "next/image";

import { getImageSlot, type ImageSlotId } from "@/content/images";

/**
 * An image slot.
 *
 * Renders the photograph if the academy has supplied one, and a composed
 * abstract plate at exactly the same dimensions if they have not. Either way
 * the box is the same size, so supplying a photograph later cannot shift the
 * page.
 *
 * The plate is deliberately *finished artwork* rather than a "photo pending"
 * notice. A page carrying six grey boxes labelled "to be supplied" reads as
 * unfinished; the same page carrying abstract compositions in the site's own
 * visual language reads as designed. The outstanding photographs are still
 * tracked — in CONTENT-TODO.md and in a `data-image-slot` attribute on the
 * element — just not announced to visitors.
 */
export default function Figure({
  slot,
  caption,
  tone = "ink",
  className = "",
  variant,
}: {
  slot: ImageSlotId;
  caption?: string;
  tone?: "ink" | "paper";
  className?: string;
  /** Which abstract composition to draw. Defaults to one derived from the id. */
  variant?: 0 | 1 | 2;
}) {
  const image = getImageSlot(slot);
  const onPaper = tone === "paper";
  const border = onPaper ? "border-paper-line" : "border-hairline";
  const captionColour = onPaper ? "text-ink/65" : "text-steel";

  // Stable per-slot so the same panel always draws the same composition.
  const derived = (slot.length % 3) as 0 | 1 | 2;

  return (
    <figure className={className}>
      <div
        className={`relative border ${border} overflow-hidden`}
        data-image-slot={image.src ? undefined : slot}
      >
        {image.src ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={image.sizes}
            priority={image.priority}
            className="block h-auto w-full"
          />
        ) : (
          <AbstractPlate
            width={image.width}
            height={image.height}
            variant={variant ?? derived}
            onPaper={onPaper}
          />
        )}
      </div>
      {caption && (
        <figcaption
          className={`mt-3 font-mono text-mono-label uppercase ${captionColour}`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Three abstract compositions in the site's own language — the system
 * landscape seen as light rather than as a diagram. Each is a layered SVG:
 * a drifting glow, a drafting grid, and a schematic figure drawn over it.
 */
function AbstractPlate({
  width,
  height,
  variant,
  onPaper,
}: {
  width: number;
  height: number;
  variant: 0 | 1 | 2;
  onPaper: boolean;
}) {
  const line = onPaper ? "var(--color-paper-line)" : "var(--color-hairline)";
  const ink = onPaper ? "var(--color-paper)" : "var(--color-ink)";
  const accent = "var(--color-signal)";
  const uid = `plate-${variant}-${width}`;

  return (
    <div
      // The aspect ratio comes from the real image's intrinsic dimensions, so
      // the plate occupies exactly the box the photograph will occupy.
      style={{ aspectRatio: `${width} / ${height}`, background: ink }}
      className="relative w-full"
    >
      {/* Drifting light, behind everything. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: onPaper ? 0.35 : 1 }}
      >
        <div
          className="absolute -right-[10%] -top-[30%] h-[80%] w-[60%] rounded-full blur-[70px] [animation:drift_26s_ease-in-out_infinite]"
          style={{
            opacity: 0.22,
            background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`,
          }}
        />
        <div
          className="absolute -bottom-[30%] left-[5%] h-[75%] w-[55%] rounded-full blur-[80px] [animation:drift_32s_ease-in-out_infinite_reverse]"
          style={{
            opacity: 0.4,
            background: "radial-gradient(circle, #1d3a6b 0%, transparent 65%)",
          }}
        />
      </div>

      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern id={`${uid}-grid`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke={line}
              strokeWidth="0.35"
            />
          </pattern>
          <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="160" height="100" fill={`url(#${uid}-grid)`} opacity="0.7" />

        {variant === 0 && <LandscapePlate accent={accent} line={line} uid={uid} />}
        {variant === 1 && <FlowPlate accent={accent} line={line} />}
        {variant === 2 && <StackPlate accent={accent} line={line} uid={uid} />}
      </svg>

      {/* Fine scan lines, the tell of a lit screen rather than a printed page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)",
        }}
      />
    </div>
  );
}

/** Nodes and integration edges — the landscape, abstracted. */
function LandscapePlate({
  accent,
  line,
  uid,
}: {
  accent: string;
  line: string;
  uid: string;
}) {
  const pts = [
    [40, 30],
    [80, 22],
    [120, 34],
    [30, 66],
    [72, 74],
    [118, 64],
  ] as const;

  return (
    <g>
      {[
        [0, 1],
        [1, 2],
        [0, 3],
        [1, 4],
        [2, 5],
        [3, 4],
        [4, 5],
      ].map(([a, b], i) => (
        <line
          key={`${a}-${b}`}
          x1={pts[a as 0]![0]}
          y1={pts[a as 0]![1]}
          x2={pts[b as 0]![0]}
          y2={pts[b as 0]![1]}
          stroke={i % 3 === 0 ? accent : line}
          strokeOpacity={i % 3 === 0 ? 0.6 : 1}
          strokeWidth="0.5"
        />
      ))}
      {pts.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <rect
            x={x - 7}
            y={y - 4}
            width="14"
            height="8"
            fill={`url(#${uid}-fade)`}
            stroke={i === 1 ? accent : line}
            strokeWidth="0.5"
            opacity={i === 1 ? 1 : 0.85}
          />
        </g>
      ))}
      <circle cx={pts[1]![0]} cy={pts[1]![1]} r="1.6" fill={accent} />
    </g>
  );
}

/** A document flow — the shape of a process moving left to right. */
function FlowPlate({ accent, line }: { accent: string; line: string }) {
  return (
    <g>
      <path
        d="M 10 78 C 45 78, 45 50, 80 50 S 115 22, 150 22"
        fill="none"
        stroke={accent}
        strokeWidth="0.7"
        strokeOpacity="0.75"
      />
      <path
        d="M 10 86 C 50 86, 50 62, 90 62 S 125 40, 150 40"
        fill="none"
        stroke={line}
        strokeWidth="0.5"
      />
      <path
        d="M 10 70 C 40 70, 40 38, 72 38 S 110 12, 150 12"
        fill="none"
        stroke={line}
        strokeWidth="0.5"
      />
      {[
        [10, 78],
        [80, 50],
        [150, 22],
      ].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="1.4" fill={accent} />
      ))}
      {[26, 52, 78, 104, 130].map((x) => (
        <line
          key={x}
          x1={x}
          y1="8"
          x2={x}
          y2="92"
          stroke={line}
          strokeWidth="0.3"
          opacity="0.6"
        />
      ))}
    </g>
  );
}

/** Stacked layers — platform, functional, foundation, seen edge-on. */
function StackPlate({
  accent,
  line,
  uid,
}: {
  accent: string;
  line: string;
  uid: string;
}) {
  return (
    <g>
      {[18, 42, 66].map((y, i) => (
        <g key={y}>
          <rect
            x="22"
            y={y}
            width="116"
            height="18"
            fill={i === 1 ? `url(#${uid}-fade)` : "none"}
            stroke={i === 1 ? accent : line}
            strokeWidth="0.5"
            opacity={i === 1 ? 1 : 0.8}
          />
          {Array.from({ length: 6 }).map((_, c) => (
            <line
              key={c}
              x1={22 + (c + 1) * 16.5}
              y1={y}
              x2={22 + (c + 1) * 16.5}
              y2={y + 18}
              stroke={line}
              strokeWidth="0.3"
              opacity="0.7"
            />
          ))}
        </g>
      ))}
      <line x1="80" y1="36" x2="80" y2="42" stroke={accent} strokeWidth="0.6" />
      <line x1="80" y1="60" x2="80" y2="66" stroke={accent} strokeWidth="0.6" />
      <circle cx="80" cy="51" r="1.6" fill={accent} />
    </g>
  );
}
