"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A department photograph with a holographic treatment: scanlines, a slow
 * scan beam and a cyan grade on hover. If the photo cannot load, the box
 * keeps its exact size and shows a drawn plate with the caption instead, so
 * a missing file never collapses or breaks a card.
 */
export default function HoloImage({
  src,
  alt,
  caption,
  className = "aspect-[3/2]",
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`scan-beam group/img relative overflow-hidden rounded-xl bg-deep ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center">
          <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full text-line" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="plate" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M12 0H0V12" fill="none" stroke="currentColor" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="200" height="120" fill="url(#plate)" />
          </svg>
          <p className="label relative px-6 text-center text-haze">{caption ?? alt}</p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 100vw"
          onError={() => setFailed(true)}
          className="object-cover saturate-[0.85] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover/img:scale-[1.04] group-hover/img:saturate-100"
        />
      )}
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent"
      />
    </div>
  );
}
