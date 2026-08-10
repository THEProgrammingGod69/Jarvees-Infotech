"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Wordmark from "./Wordmark";
import { navigation, primaryCentre } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Prevent the page scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-graphite/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        {/* No aria-label here: the wordmark's own text is the accessible
            name, and an aria-label that omitted part of the visible text
            would break the "accessible name contains visible label" rule. */}
        <Link href="/" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block px-3 py-2 text-body-s transition-colors duration-(--duration-fast) ${
                      active
                        ? "text-chalk"
                        : "text-steel hover:text-chalk"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-px h-px bg-signal"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${primaryCentre.phoneHref}`}
            className="hidden font-mono text-mono-label uppercase text-steel transition-colors hover:text-chalk md:block"
          >
            {primaryCentre.phoneDisplay}
          </a>
          <Link
            href="/contact"
            className="hidden bg-signal px-4 py-2.5 font-mono text-mono-label uppercase text-ink transition-opacity duration-(--duration-fast) hover:opacity-85 sm:block"
          >
            Send enquiry
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 items-center justify-center border border-hairline text-chalk lg:hidden"
          >
            <span className="sr-only">
              {open ? "Close menu" : "Open menu"}
            </span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" />
              ) : (
                <path d="M2 5h16M2 10h16M2 15h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-hairline bg-ink lg:hidden"
        >
          <nav aria-label="Primary, mobile" className="px-5 py-6 sm:px-8">
            <ul className="flex flex-col">
              {navigation.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex items-baseline gap-4 border-b border-hairline py-4 text-display-m text-chalk"
                  >
                    <span className="font-mono text-mono-label text-steel">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={isActive(item.href) ? "text-signal" : ""}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                href="/contact"
                className="bg-signal px-5 py-3.5 text-center font-mono text-mono-label uppercase text-ink"
              >
                Send enquiry
              </Link>
              <a
                href={`tel:${primaryCentre.phoneHref}`}
                className="border border-hairline px-5 py-3.5 text-center font-mono text-mono-label uppercase text-chalk"
              >
                Call {primaryCentre.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
