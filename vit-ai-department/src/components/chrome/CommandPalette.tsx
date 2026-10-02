"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { codeApex3 } from "@/content/events";
import { syllabi } from "@/content/curriculum";
import { dept, institute, nav } from "@/lib/site";

const OPEN_EVENT = "cse-ai:palette";

/** Open the palette from anywhere (header button, mobile menu). */
export function openPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Item = {
  id: string;
  group: "Pages" | "Actions" | "Documents";
  label: string;
  hint: string;
  href: string;
  external?: boolean;
};

const ITEMS: Item[] = [
  { id: "home", group: "Pages", label: "Home", hint: "/", href: "/" },
  ...nav.map((n) => ({ id: n.href, group: "Pages" as const, label: n.label, hint: n.href, href: n.href })),
  { id: "apex", group: "Actions", label: `Register for ${codeApex3.name}`, hint: "unstop.com", href: codeApex3.registerUrl, external: true },
  { id: "mail", group: "Actions", label: "Email the Head of Department", hint: dept.email, href: `mailto:${dept.email}` },
  { id: "call", group: "Actions", label: "Call admissions", hint: institute.admissions.phones[0].display, href: institute.admissions.phones[0].href },
  { id: "apply", group: "Actions", label: "Undergraduate admissions at VIT", hint: "vit.edu", href: institute.admissionsUrl, external: true },
  { id: "official", group: "Actions", label: "Official department page", hint: "vit.edu/CSE-AI", href: dept.officialUrl, external: true },
  ...syllabi.slice(0, 4).map((s, i) => ({ id: `syl-${i}`, group: "Documents" as const, label: s.label, hint: "PDF", href: s.href, external: true })),
];

/** Subsequence match with a bonus for contiguous runs and word starts. */
function score(query: string, text: string) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  let s = 0;
  let run = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      run++;
      s += 1 + run + (i === 0 || t[i - 1] === " " ? 3 : 0);
      qi++;
    } else run = 0;
  }
  return qi === q.length ? s : 0;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(
    () =>
      ITEMS.map((item) => ({ item, s: Math.max(score(query, item.label), score(query, item.hint) * 0.6) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((r) => r.item),
    [query],
  );

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else if (item.href.startsWith("/")) router.push(item.href);
    else window.location.href = item.href;
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // The input is the only tab stop; the list is driven by arrows.
      e.preventDefault();
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button type="button" aria-label="Close search" className="absolute inset-0 cursor-default bg-void/70 backdrop-blur-sm" onClick={close} tabIndex={-1} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            initial={{ opacity: 0, y: -16, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-orbit relative w-full max-w-xl overflow-hidden rounded-2xl border border-line-bright bg-deep/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <span aria-hidden="true" className="font-mono text-cyan">
                ❯
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search pages, documents, actions…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[active] ? `palette-${results[active]!.id}` : undefined}
                aria-autocomplete="list"
                className="h-14 w-full bg-transparent font-mono text-body text-frost placeholder:text-haze focus:outline-none"
              />
              <kbd className="label rounded-md border border-line px-2 py-1 text-[0.625rem] text-haze">Esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-4 py-6 text-center text-small text-haze">No signal for “{query}”.</li>}
              {results.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <li key={item.id} role="presentation">
                    {header && <p className="label px-3 pt-3 pb-1.5 text-violet">{header}</p>}
                    <div
                      id={`palette-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors ${
                        i === active ? "bg-panel text-frost" : "text-haze"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-cyan" : "bg-line-bright"}`} />
                        {item.label}
                        {item.external && <span className="sr-only">(opens in a new tab)</span>}
                      </span>
                      <span className="label truncate text-[0.625rem] text-haze">{item.hint}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="label flex items-center gap-4 border-t border-line px-5 py-3 text-[0.625rem] text-haze">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span className="ml-auto">⌘K / Ctrl K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
