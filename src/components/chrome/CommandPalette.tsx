"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { syllabi } from "@/content/curriculum";
import { codeApex3 } from "@/content/events";
import { dept, institute, nav } from "@/lib/site";

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

/**
 * Site-wide command palette (⌘K / Ctrl K), loaded on demand.
 *
 * Built on the native modal <dialog>: the browser provides the focus trap,
 * the inert page behind it, Escape to close and the top layer, so there is
 * no focus-management code to get wrong. The input is a combobox driving a
 * listbox with arrow keys (WAI-ARIA combobox pattern).
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(
    () =>
      ITEMS.map((item) => ({ item, s: Math.max(score(query, item.label), score(query, item.hint) * 0.6) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((r) => r.item),
    [query],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const onDialogClose = () => {
    onClose();
    returnFocus.current?.focus?.();
  };

  const go = (item: Item | undefined) => {
    if (!item) return;
    dialogRef.current?.close();
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
    } else if (e.key === "Tab") {
      // The input is the only tab stop; the list is driven by the arrows.
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.getElementById(`palette-${results[active]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  let lastGroup = "";

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search the site"
      className="palette"
      onClose={onDialogClose}
      // A click whose target is the dialog itself landed on the backdrop.
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
    >
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
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
            aria-label="Search pages, documents and actions"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `palette-${results[active]!.id}` : undefined}
            aria-autocomplete="list"
            className="h-14 w-full bg-transparent font-mono text-body text-frost placeholder:text-haze focus:outline-none"
          />
          <kbd className="label rounded-md border border-line px-2 py-1 text-[0.625rem] text-haze">Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[min(50vh,26rem)] overflow-y-auto overscroll-contain p-2">
          {results.length === 0 && (
            <li role="presentation" className="px-4 py-6 text-center text-small text-haze">
              No signal for “{query}”.
            </li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && (
                  <p aria-hidden="true" className="label px-3 pt-3 pb-1.5 text-violet">
                    {header}
                  </p>
                )}
                <div
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerMove={() => i !== active && setActive(i)}
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
      </div>
    </dialog>
  );
}
