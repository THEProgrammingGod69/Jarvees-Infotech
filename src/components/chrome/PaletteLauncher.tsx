"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { loadPalette, PALETTE_EVENT } from "./palette-events";

type PaletteProps = { open: boolean; onClose: () => void };

/**
 * Listens for ⌘K / Ctrl K and the "open palette" event, and mounts the
 * palette the first time it is wanted. Its code is fetched on intent —
 * pressing ⌘ or Ctrl, or hovering the header's "Jump to…" button — so it
 * never competes with page load and is usually in place before it is asked
 * for.
 */
export default function PaletteLauncher() {
  const [Palette, setPalette] = useState<ComponentType<PaletteProps> | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    const show = () =>
      void loadPalette().then((m) => {
        setPalette(() => m.default);
        setOpen(true);
      });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") void loadPalette();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, show);


    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, show);
    };
  }, []);

  return Palette ? <Palette open={open} onClose={() => setOpen(false)} /> : null;
}
