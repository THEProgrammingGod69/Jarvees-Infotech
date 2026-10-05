"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import Mark from "./Mark";
import { openPalette } from "./CommandPalette";

const primary = nav.filter((n) => ["/about", "/programme", "/faculty", "/research", "/placements", "/events"].includes(n.href));

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on navigation, and lock the page behind it while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a
        href="#main"
        className="label fixed top-3 left-3 z-[80] -translate-y-20 rounded-full bg-cyan px-4 py-2 text-void transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? "border-b border-line bg-void/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-[84rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="CSE (AI), VIT Pune — home">
            <Mark />
            <span className="leading-none">
              <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-frost">
                CSE<span className="text-cyan">·</span>AI
              </span>
              <span className="label mt-1 block text-[0.6rem] text-haze">VIT Pune</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative block rounded-full px-4 py-2 text-small font-medium transition-colors ${
                        active ? "text-frost" : "text-haze hover:text-frost"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full border border-line-bright bg-panel/80"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
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
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-deep/60 lg:hidden"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-frost transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-1"}`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-px w-4 bg-frost transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-1"}`}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: "circle(0% at 95% 2.25rem)" }}
            animate={{ clipPath: "circle(150% at 95% 2.25rem)" }}
            exit={{ clipPath: "circle(0% at 95% 2.25rem)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-void/95 px-5 pt-24 pb-10 backdrop-blur-xl sm:px-8 lg:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.045, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="flex items-baseline gap-4 border-b border-line py-4"
                    >
                      <span className="label text-cyan">{item.code}</span>
                      <span
                        className={`font-display text-display-l ${isActive(item.href) ? "text-gradient" : "text-frost"}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openPalette();
              }}
              className="label mt-8 text-haze underline underline-offset-4"
            >
              Search the site
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
