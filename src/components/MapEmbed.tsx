"use client";

import { useState } from "react";

/**
 * Google Maps loads a megabyte or more of third-party script. Nothing of it
 * is fetched until the visitor asks: until then this is a drawn plate with
 * the coordinates, a button that swaps in the live map, and a plain link.
 */
export default function MapEmbed({ title, src, href, coords }: { title: string; src: string; href: string; coords: string }) {
  const [live, setLive] = useState(false);

  if (live) {
    return (
      <iframe
        title={title}
        src={src}
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-80 w-full rounded-xl border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_brightness(0.95)]"
      />
    );
  }

  return (
    <div className="relative grid h-full min-h-80 place-items-center overflow-hidden rounded-xl bg-deep">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-line" preserveAspectRatio="none">
        <defs>
          <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" width="100%" height="100%">
          <path d="M0 214Q120 160 200 188T400 116" fill="none" className="stroke-line-bright" strokeWidth="7" vectorEffect="non-scaling-stroke" />
          <path d="M150 0Q170 120 236 300" fill="none" className="stroke-line" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        </svg>
      </svg>
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        <span className="live-dot block h-3 w-3" data-live />
      </div>
      <div className="relative mt-24 flex flex-col items-center gap-3 px-6 text-center">
        <p className="label text-haze">{coords}</p>
        <button
          type="button"
          onClick={() => setLive(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-bright bg-void/80 px-5 text-small font-semibold text-frost transition-colors hover:border-cyan hover:text-cyan"
        >
          Load interactive map
        </button>
        <a href={href} target="_blank" rel="noopener noreferrer" className="label inline-flex min-h-6 items-center text-haze underline underline-offset-4 hover:text-cyan">
          Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
