/**
 * Image registry.
 *
 * The academy has not supplied photographs yet, and inventing them — stock
 * pictures of unrelated people in an unrelated office — would be worse than
 * having none. So every image on the site is declared here as a *slot* with
 * its dimensions fixed up front.
 *
 * While `src` is undefined the slot renders an on-brand schematic plate at
 * exactly the right size. When the academy drops a file into `public/` and
 * fills in `src`, the photograph appears in the same box — no layout shift,
 * no code change anywhere else.
 *
 * The pre-launch list in CONTENT-TODO.md is generated from this file, so a
 * slot cannot be forgotten: adding one here adds it to the checklist.
 *
 * To supply an image:
 *   1. Put the file in `public/` (e.g. `public/centres/narhe-entrance.jpg`).
 *   2. Set `src: "/centres/narhe-entrance.jpg"` on the matching slot below.
 *   3. Check the real file's aspect ratio matches `width`/`height` here.
 */

export type ImageSlot = {
  id: string;
  /** Set this when the file exists in `public/`. Leave undefined until then. */
  src?: string;
  /**
   * Alt text, written now so it is never left as a filename. Describe what is
   * in the picture and why it is on the page — not "image of building".
   */
  alt: string;
  /** Intrinsic dimensions. Fixed here so the box never shifts. */
  width: number;
  height: number;
  /** What the academy needs to photograph. Shown on the placeholder plate. */
  brief: string;
  /** Responsive `sizes` hint for next/image. */
  sizes: string;
  /** Priority images are above the fold and preloaded. Use sparingly. */
  priority?: boolean;
};

export const imageSlots = {
  "narhe-entrance": {
    id: "narhe-entrance",
    alt: "The street entrance to Jarvees Academy's Narhe centre at Kanta Heights on the Dhayari–Katraj road, as it appears when arriving on foot.",
    width: 1600,
    height: 1000,
    brief: "Street entrance, Narhe — what a first-time visitor sees from the road",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  "tilak-road-entrance": {
    id: "tilak-road-entrance",
    alt: "The entrance to Jarvees Academy's Tilak Road centre at Mangal Murti Complex, Hirabaug Chowk.",
    width: 1600,
    height: 1000,
    brief: "Street entrance, Tilak Road — the frontage at Hirabaug Chowk",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
  "session-in-progress": {
    id: "session-in-progress",
    alt: "A trainer working through a configuration with learners at their own machines during a session.",
    width: 1600,
    height: 900,
    brief:
      "A session in progress — learners at their own machines. Written consent needed from anyone identifiable",
    sizes: "(min-width: 1024px) 66vw, 100vw",
  },
  "corporate-session": {
    id: "corporate-session",
    alt: "An on-site corporate training session delivered to a team at their own office.",
    width: 1600,
    height: 900,
    brief:
      "On-site corporate session — clear it with the client before publishing anything showing their premises or staff",
    sizes: "(min-width: 1024px) 50vw, 100vw",
  },
} as const satisfies Record<string, ImageSlot>;

export type ImageSlotId = keyof typeof imageSlots;

export function getImageSlot(id: ImageSlotId): ImageSlot {
  return imageSlots[id];
}

/** Slots still awaiting a photograph — drives the CONTENT-TODO checklist. */
export const outstandingImages: ImageSlot[] = Object.values(imageSlots).filter(
  (slot) => !("src" in slot) || !slot.src,
);
