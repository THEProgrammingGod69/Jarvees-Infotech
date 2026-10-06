/**
 * next/image loader for the pre-optimised photos in public/images.
 *
 * scripts/optimize-images.mjs writes `<name>.<hash>-<width>.webp` for every
 * width in next.config.ts (imageSizes + deviceSizes), so any width Next asks
 * for exists as a file. `src` is the manifest path without the width.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  return src.replace(/\.webp$/, `-${width}.webp`);
}
