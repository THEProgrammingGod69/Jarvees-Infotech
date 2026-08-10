import Image from "next/image";

import { getImageSlot, type ImageSlotId } from "@/content/images";

/**
 * An image slot.
 *
 * Renders the photograph if the academy has supplied one, and an on-brand
 * schematic plate at exactly the same dimensions if they have not. Either way
 * the box is the same size, so supplying a photograph later cannot shift the
 * page, and the site is complete and launchable today.
 *
 * The placeholder is drawn as a drafting plate — corner registration marks, a
 * faint construction grid, and the brief for the photograph set in the mono
 * register. It is deliberately not a grey box with a broken-image icon: on a
 * site whose whole concept is technical drawing, an unfilled plate reads as
 * part of the document rather than as something missing.
 */
export default function Figure({
  slot,
  caption,
  tone = "ink",
  className = "",
}: {
  slot: ImageSlotId;
  caption?: string;
  tone?: "ink" | "paper";
  className?: string;
}) {
  const image = getImageSlot(slot);
  const onPaper = tone === "paper";
  const border = onPaper ? "border-paper-line" : "border-hairline";
  const captionColour = onPaper ? "text-ink/65" : "text-steel";

  return (
    <figure className={className}>
      <div className={`relative border ${border} overflow-hidden`}>
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
          <SchematicPlate
            width={image.width}
            height={image.height}
            brief={image.brief}
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

function SchematicPlate({
  width,
  height,
  brief,
  onPaper,
}: {
  width: number;
  height: number;
  brief: string;
  onPaper: boolean;
}) {
  const line = onPaper ? "var(--color-paper-line)" : "var(--color-hairline)";
  const mark = onPaper ? "var(--color-ink)" : "var(--color-steel-dim)";
  const surface = onPaper ? "var(--color-paper-alt)" : "var(--color-graphite)";
  const gridId = `plate-grid-${width}x${height}`;

  return (
    <div
      // The aspect ratio comes from the real image's intrinsic dimensions, so
      // the plate occupies exactly the box the photograph will occupy.
      style={{ aspectRatio: `${width} / ${height}`, background: surface }}
      className="relative w-full"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern
            id={gridId}
            width="6.25"
            height="6.25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6.25 0 L 0 0 0 6.25"
              fill="none"
              stroke={line}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#${gridId})`} opacity="0.6" />
        {/* Registration marks, one per corner. */}
        {[
          [0, 0, 1, 1],
          [100, 0, -1, 1],
          [0, 100, 1, -1],
          [100, 100, -1, -1],
        ].map(([x, y, dx, dy]) => (
          <g key={`${x}-${y}`} stroke={mark} strokeWidth="1" vectorEffect="non-scaling-stroke">
            <line x1={x} y1={y} x2={x! + dx! * 7} y2={y} />
            <line x1={x} y1={y} x2={x} y2={y! + dy! * 7} />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <p
          className={`font-mono text-mono-label uppercase ${
            onPaper ? "text-ink/65" : "text-steel"
          }`}
        >
          Photograph to be supplied
        </p>
        <p
          className={`max-w-sm text-body-s ${
            onPaper ? "text-ink/70" : "text-steel"
          }`}
        >
          {brief}
        </p>
      </div>
    </div>
  );
}
