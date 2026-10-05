import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import Scramble from "@/components/fx/Scramble";

/* ------------------------------------------------------------------------ */
/* Layout                                                                    */
/* ------------------------------------------------------------------------ */

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[84rem] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Vertical rhythm for a page section. */
export const sectionY = "py-[clamp(4.5rem,9vw,8.5rem)]";

/** Stagger helper for `[data-reveal]` children. */
export function delay(ms: number): CSSProperties {
  return { ["--d" as string]: `${ms}ms` };
}

/* ------------------------------------------------------------------------ */
/* Type                                                                      */
/* ------------------------------------------------------------------------ */

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`label text-haze ${className}`}>{children}</p>;
}

/**
 * Section heading: an index code and label in mono, a decoded display title,
 * and an optional standfirst. Every section on the site opens with one.
 */
export function SectionHead({
  index,
  label,
  title,
  intro,
  id,
  align = "left",
  className = "",
}: {
  index: string;
  label: string;
  title: string;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center";
  return (
    <header className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`} data-reveal>
      <p className={`label flex items-center gap-3 text-cyan ${center ? "justify-center" : ""}`}>
        <span className="text-haze">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-cyan to-transparent" />
        {label}
      </p>
      <h2 id={id} className="mt-5 text-display-xl text-frost">
        <Scramble text={title} />
      </h2>
      {intro && <div className="mt-5 text-body-l text-haze">{intro}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------------ */
/* Controls                                                                  */
/* ------------------------------------------------------------------------ */

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href">;

const buttonBase =
  "group/btn relative inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-small font-semibold tracking-wide transition-[transform,background-color,color,box-shadow] duration-500 ease-[var(--ease-out-expo)]";

const buttonVariants = {
  primary:
    "bg-cyan text-void shadow-[0_0_0_0_transparent] hover:shadow-[0_0_40px_-4px_color-mix(in_oklab,var(--color-cyan)_70%,transparent)]",
  ghost: "border-orbit border border-line-bright bg-void/70 text-frost hover:bg-panel",
};

export function Button({ href, children, variant = "primary", className = "", external, ...rest }: ButtonProps) {
  const cls = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  const arrow = (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1"
    >
      →
    </span>
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" data-magnetic {...rest}>
        {children}
        {arrow}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-magnetic {...rest}>
      {children}
      {arrow}
    </Link>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "cyan" | "violet" | "magenta" }) {
  const tones = {
    default: "border-line text-haze",
    cyan: "border-cyan/40 text-cyan",
    violet: "border-violet/40 text-violet",
    magenta: "border-magenta/40 text-magenta",
  };
  return <span className={`label inline-flex items-center rounded-full border px-3 py-1.5 ${tones[tone]}`}>{children}</span>;
}

export function LiveDot({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 animate-pulse-dot rounded-full bg-magenta text-magenta ${className}`} />;
}

/** External text link with the new-tab disclosure built in. */
export function ExtLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-cyan/40 underline-offset-4 transition-colors hover:text-cyan hover:decoration-cyan ${className}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
