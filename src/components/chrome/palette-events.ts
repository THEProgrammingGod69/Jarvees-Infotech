/**
 * The command palette is not part of any page's initial JavaScript. These
 * helpers are all the rest of the site imports: an event to open it, and a
 * loader that fetches its code on intent (hovering the button, idle time,
 * or the first ⌘K) so it opens instantly when asked.
 */
export const PALETTE_EVENT = "cse-ai:palette";

export function openPalette() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

let palette: Promise<typeof import("./CommandPalette")> | null = null;

export function loadPalette() {
  palette ??= import("./CommandPalette");
  return palette;
}
