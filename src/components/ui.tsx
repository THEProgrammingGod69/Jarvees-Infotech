import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Primary call to action. Amber fill with ink text — 10.7:1.
 *
 * The amber budget (DESIGN.md §7) allows at most three amber elements on a
 * page. `variant="primary"` is one of them; use `variant="line"` for every
 * secondary action.
 */
export function Cta({
  href,
  children,
  variant = "primary",
  tone = "ink",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "line";
  /** The plane this sits on, so the outline variant stays legible. */
  tone?: "ink" | "paper";
  className?: string;
}) {
  const base =
    "group/cta relative isolate inline-flex items-center justify-center gap-2 overflow-hidden px-5 py-3 font-mono text-mono-label uppercase transition-all duration-(--duration-base)";

  const styles =
    variant === "primary"
      ? "bg-signal text-ink hover:brightness-110"
      : tone === "paper"
        ? "border border-paper-line text-ink hover:bg-paper-alt"
        : "border border-hairline text-chalk hover:border-signal/50 hover:bg-graphite";

  // Outline buttons on the dark plane pick up a faint amber glow on hover, so
  // the secondary action still feels lit without spending any of the amber
  // budget on a fill.
  const glow =
    variant === "line" && tone === "ink"
      ? "hover:[box-shadow:var(--glow-soft)]"
      : "";

  return (
    <Link href={href} className={`${base} ${styles} ${glow} ${className}`}>
      {/* A band of light sweeps across on hover. Motion-safe only, and it sits
          behind the label so it can never affect legibility. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 motion-safe:group-hover/cta:translate-x-full"
      />
      {children}
    </Link>
  );
}

/** A mono eyebrow. The site's smallest structural label. */
export function MonoLabel({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "paper" | "signal";
  className?: string;
}) {
  const colour =
    tone === "signal"
      ? "text-signal"
      : tone === "paper"
        ? "text-ink/65"
        : "text-steel";
  return (
    <p
      className={`font-mono text-mono-label uppercase ${colour} ${className}`}
    >
      {children}
    </p>
  );
}

/** A data chip — module codes, modes, levels, transaction codes. */
export function Chip({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "paper" | "signal";
}) {
  const styles =
    tone === "signal"
      ? "border-signal/40 bg-signal/10 text-signal"
      : tone === "paper"
        ? "border-paper-line bg-paper-alt text-ink"
        : "border-hairline bg-slate text-steel";
  return (
    <span
      className={`inline-block border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.1em] ${styles}`}
    >
      {children}
    </span>
  );
}

const TOKEN = /^\{\{[A-Z0-9_]+\}\}$/;

/**
 * Renders a content value, or an honest "to be confirmed" marker if the value
 * is still a `{{TOKEN}}` placeholder.
 *
 * This exists so that an unconfirmed duration can never quietly become an
 * invented one. Every token rendered here is listed in CONTENT-TODO.md, and
 * the token name is kept in a data attribute so the client's developer can
 * find it in the page.
 */
export function Value({ children }: { children: string }) {
  if (TOKEN.test(children.trim())) {
    return (
      // Colour is inherited deliberately. This renders on both the ink and the
      // paper plane, so any fixed colour here would fail contrast on one of
      // them — the dotted underline carries the "provisional" meaning instead.
      <span
        data-content-token={children.trim()}
        title={`Awaiting content: ${children.trim()}`}
        className="decoration-dotted underline-offset-4 [text-decoration-line:underline]"
      >
        To be confirmed
      </span>
    );
  }
  return <>{children}</>;
}

export function isToken(value: string): boolean {
  return TOKEN.test(value.trim());
}
