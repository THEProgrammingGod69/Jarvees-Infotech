"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { nav } from "@/lib/site";
import Mark from "./Mark";
import { loadPalette, openPalette } from "./palette-events";

const primary = nav.filter((n) => ["/about", "/programme", "/faculty", "/research", "/placements", "/events"].includes(n.href));

/** "/about/" and "/about" are the same page (the site exports with trailing slashes). */
const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

function Brand({ gradientId }: { gradientId: string }) {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <Mark gradientId={gradientId} />
      <span className="leading-none">
        <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-frost">
          CSE<span className="text-cyan">·</span>AI
        </span>
        <span className="label mt-1 block text-[0.6rem] text-haze">
          VIT Pune<span className="sr-only">, home page</span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Site header. Cheap by construction: the scrolled state is a data
 * attribute written outside React (no re-render per scroll event), there
 * is no backdrop blur (blurring a moving page every frame is expensive),
 * and the nav indicator is one element moved with a transform.
 *
 * The mobile menu is a native modal <dialog>: focus trap, inert page and
 * Escape come from the browser. It opens with a circular reveal from the
 * button that summoned it.
 */
export default function Header() {
  const pathname = normalize(usePathname() ?? "/");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scrolled state, without React.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let scrolled: boolean | null = null;
    const onScroll = () => {
      const next = window.scrollY > 12;
      if (next === scrolled) return;
      scrolled = next;
      header.dataset.scrolled = String(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The indicator pill: sits under the current page, follows the pointer.
  const movePill = useCallback((target: HTMLElement | null, animate = true) => {
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill || !list) return;
    if (!target) {
      pill.style.opacity = "0";
      return;
    }
    const l = list.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const appearing = pill.style.opacity !== "1";
    pill.style.transition = animate && !appearing ? "" : "none";
    pill.style.width = `${r.width}px`;
    pill.style.transform = `translate3d(${r.left - l.left}px, 0, 0)`;
    pill.style.opacity = "1";
  }, []);

  const current = useCallback(() => listRef.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null, []);

  useLayoutEffect(() => {
    movePill(current());
  }, [pathname, movePill, current]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Web fonts arriving or the window resizing change the link widths.
    const ro = new ResizeObserver(() => movePill(current(), false));
    ro.observe(list);
    return () => ro.disconnect();
  }, [movePill, current]);

  // Mobile menu.
  const openMenu = () => {
    const menu = menuRef.current;
    if (!menu || menu.open) return;
    menu.removeAttribute("data-closing");
    menu.showModal();
    setMenuOpen(true);
  };
  const closeMenu = useCallback(() => {
    const menu = menuRef.current;
    if (!menu?.open || menu.hasAttribute("data-closing")) return;
    const done = () => {
      menu.removeAttribute("data-closing");
      menu.close();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    menu.setAttribute("data-closing", "");
    window.setTimeout(done, 420);
  }, []);

  useEffect(() => closeMenu(), [pathname, closeMenu]);

  return (
    <>
      <a
        href="#main"
        className="label fixed top-3 left-3 z-[80] -translate-y-20 rounded-full bg-cyan px-4 py-2 text-void transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header ref={headerRef} data-scrolled="false" className="site-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-18 max-w-[84rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Brand gradientId="mark-header" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul ref={listRef} className="relative flex items-center gap-1" onPointerLeave={() => movePill(current())}>
              <span
                ref={pillRef}
                aria-hidden="true"
                className="nav-pill pointer-events-none absolute top-0 left-0 h-full rounded-full border border-line-bright bg-panel/80 opacity-0"
              />
              {primary.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={(e) => movePill(e.currentTarget)}
                      onFocus={(e) => movePill(e.currentTarget)}
                      onBlur={() => movePill(current())}
                      className={`relative block rounded-full px-4 py-2 text-small font-medium transition-colors ${
                        active ? "text-frost" : "text-haze hover:text-frost"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPalette}
              onPointerEnter={() => void loadPalette()}
              onFocus={() => void loadPalette()}
              className="hidden h-10 items-center gap-3 rounded-full border border-line bg-deep/60 pr-2 pl-4 text-small text-haze transition-colors hover:border-line-bright hover:text-frost sm:flex"
            >
              Jump to…
              <kbd className="label rounded-md border border-line bg-panel px-2 py-1 text-[0.625rem] text-haze">⌘K</kbd>
            </button>
            <Link
              href="/contact"
              data-magnetic
              className="hidden h-10 items-center rounded-full bg-cyan px-5 text-small font-semibold text-void transition-[transform,box-shadow] duration-500 hover:shadow-[0_0_32px_-6px_var(--color-cyan)] md:inline-flex"
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={openMenu}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-deep/60 lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <span aria-hidden="true" className="absolute h-px w-4 -translate-y-1 bg-frost" />
              <span aria-hidden="true" className="absolute h-px w-4 translate-y-1 bg-frost" />
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={menuRef}
        id="site-menu"
        aria-label="Site menu"
        className="site-menu lg:hidden"
        onClose={() => setMenuOpen(false)}
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
      >
        <div className="mx-auto flex h-18 max-w-[84rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Brand gradientId="mark-menu" />
          <button
            type="button"
            onClick={closeMenu}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-deep/60"
          >
            <span className="sr-only">Close menu</span>
            <span aria-hidden="true" className="absolute h-px w-4 rotate-45 bg-frost" />
            <span aria-hidden="true" className="absolute h-px w-4 -rotate-45 bg-frost" />
          </button>
        </div>
        <nav aria-label="Mobile" className="px-5 pt-6 pb-10 sm:px-8">
          <ul className="space-y-1">
            {nav.map((item, i) => (
              <li key={item.href} style={{ ["--i" as string]: i }}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-baseline gap-4 border-b border-line py-4"
                >
                  <span className="label text-cyan">{item.code}</span>
                  <span className={`font-display text-display-l ${isActive(item.href) ? "text-gradient" : "text-frost"}`}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              window.setTimeout(openPalette, 440);
            }}
            className="label mt-8 inline-flex min-h-6 items-center text-haze underline underline-offset-4"
          >
            Search the site
          </button>
        </nav>
      </dialog>
    </>
  );
}
