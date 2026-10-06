import Image from "next/image";
import { photos, type PhotoId } from "@/content/photos.generated";
import { vars } from "@/components/ui";

// Tile order for the dissolve: a fixed scramble, so the server markup is
// identical on every build and nothing depends on Math.random().
const TILES = Array.from({ length: 24 }, (_, i) => ((i * 7 + 3) % 24) * 22);

/**
 * A department photograph with a holographic treatment. It resolves out of
 * a grid of tiles the first time it scrolls into view, a scan beam passes
 * over it once, and it eases forward on hover.
 *
 * Photos are self-hosted, pre-sized WebP (scripts/optimize-images.mjs):
 * the browser picks the smallest file that fills the slot, a blurred
 * placeholder shows while it loads, and the box has its final size before
 * a byte arrives, so nothing shifts.
 */
export default function HoloImage({
  photo,
  alt,
  className = "aspect-[3/2]",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
}: {
  photo: PhotoId;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const p = photos[photo];
  return (
    <div data-reveal="keep" className={`group/img relative overflow-hidden rounded-xl bg-deep ${className}`}>
      <Image
        src={p.src}
        alt={alt}
        width={p.width}
        height={p.height}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={p.blurDataURL}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/img:scale-[1.04]"
      />
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-50" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-void/5 to-transparent" />
      <div aria-hidden="true" className="dissolve">
        {TILES.map((d, i) => (
          <span key={i} style={vars({ "--d": `${d}ms` })} />
        ))}
      </div>
      <div aria-hidden="true" className="scan-once" />
    </div>
  );
}
