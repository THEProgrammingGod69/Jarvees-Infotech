import type { ReactNode } from "react";

/**
 * The page spine.
 *
 * Every section hangs off a left gutter rail — a 1px rule with a mono index
 * and label set against it, the way a drafting sheet carries margin notes. It
 * replaces the decorative `01 / 02 / 03` markers a marketing page would use:
 * the numbering is structural, so it can exist without being a design flourish.
 *
 * Below 1024px the rail collapses and the label sits above the content, which
 * keeps the same information without stealing horizontal space.
 */

export function Shell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function Section({
  index,
  label,
  children,
  id,
  tone = "ink",
  className = "",
  bleed = false,
}: {
  /** Section number on the rail, e.g. "02". */
  index: string;
  label: string;
  children: ReactNode;
  id?: string;
  tone?: "ink" | "graphite" | "paper";
  className?: string;
  /** Remove the top rule — for a section that follows one visually joined to it. */
  bleed?: boolean;
}) {
  const toneClass =
    tone === "paper"
      ? "bg-paper text-ink"
      : tone === "graphite"
        ? "bg-graphite text-chalk"
        : "bg-ink text-chalk";

  const ruleClass = tone === "paper" ? "border-paper-line" : "border-hairline";
  const labelClass = tone === "paper" ? "text-ink/65" : "text-steel";

  return (
    <section
      id={id}
      className={`${toneClass} ${bleed ? "" : `border-t ${ruleClass}`} ${className}`}
    >
      <Shell>
        <div className="rail-grid">
          <div
            className={`hidden border-r ${ruleClass} py-section pr-6 lg:block`}
          >
            <div className="sticky top-24">
              <p
                className={`font-mono text-mono-label uppercase ${labelClass} tnum`}
              >
                {index}
              </p>
              <p
                className={`mt-2 font-mono text-mono-label uppercase ${labelClass}`}
              >
                {label}
              </p>
            </div>
          </div>

          <div className="py-section lg:pl-10">
            <p
              className={`mb-8 font-mono text-mono-label uppercase ${labelClass} lg:hidden`}
            >
              <span className="tnum">{index}</span>
              <span className="mx-2">/</span>
              {label}
            </p>
            {children}
          </div>
        </div>
      </Shell>
    </section>
  );
}

/**
 * Section heading with an optional standfirst. Kept as one component so the
 * type pairing (display heading over body-l standfirst, at one measure) cannot
 * drift between pages.
 */
export function SectionHeading({
  title,
  standfirst,
  tone = "ink",
  as: As = "h2",
}: {
  title: ReactNode;
  standfirst?: ReactNode;
  tone?: "ink" | "paper";
  as?: "h1" | "h2";
}) {
  return (
    <div className="max-w-3xl">
      <As
        className={`text-display-l ${tone === "paper" ? "text-ink" : "text-chalk"}`}
      >
        {title}
      </As>
      {standfirst && (
        <p
          className={`mt-5 text-body-l ${tone === "paper" ? "text-ink/70" : "text-steel"}`}
        >
          {standfirst}
        </p>
      )}
    </div>
  );
}
