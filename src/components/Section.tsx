import type { ReactNode } from "react";

import { Reveal, Scramble, Headline } from "@/components/motion";
import { BlueprintGrid } from "@/components/visual/Ambient";

/**
 * The page spine.
 *
 * Every section hangs off a left gutter rail — a 1px rule with a mono index
 * and label set against it, the way a drafting sheet carries margin notes. It
 * replaces the decorative `01 / 02 / 03` markers a marketing page would use:
 * the numbering is structural, so it can exist without being a design flourish.
 *
 * The rail label decodes into place on entry, terminal-style. That flourish is
 * defined once here rather than per page, which is also why every route picked
 * it up without eight separate edits.
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
  grid = true,
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
  /** The drafting grid behind the section. Off for dense content. */
  grid?: boolean;
}) {
  const onPaper = tone === "paper";
  const toneClass = onPaper
    ? "bg-paper text-ink"
    : tone === "graphite"
      ? "bg-graphite text-chalk"
      : "bg-ink text-chalk";

  const ruleClass = onPaper ? "border-paper-line" : "border-hairline";
  const labelClass = onPaper ? "text-ink/65" : "text-steel";

  return (
    <section
      id={id}
      className={`relative overflow-hidden ${toneClass} ${
        bleed ? "" : `border-t ${ruleClass}`
      } ${className}`}
    >
      {grid && !onPaper && <BlueprintGrid fade="center" className="opacity-25" />}

      <Shell>
        <div className="rail-grid">
          <div className={`hidden border-r ${ruleClass} py-section pr-6 lg:block`}>
            <div className="sticky top-24">
              <Reveal y={10} blur={false}>
                <p
                  className={`font-mono text-mono-label uppercase ${labelClass} tnum`}
                >
                  {index}
                </p>
                <p
                  className={`mt-2 font-mono text-mono-label uppercase ${labelClass}`}
                >
                  <Scramble text={label} />
                </p>
                <span
                  aria-hidden="true"
                  className={`mt-4 block h-8 w-px ${
                    onPaper ? "bg-paper-line" : "bg-signal/40"
                  }`}
                />
              </Reveal>
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
 * type pairing — display heading over a body-l standfirst at one measure —
 * cannot drift between pages, and so the entrance animation is identical
 * everywhere without each page arranging it.
 */
export function SectionHeading({
  title,
  standfirst,
  tone = "ink",
  as = "h2",
}: {
  title: string;
  standfirst?: ReactNode;
  tone?: "ink" | "paper";
  as?: "h1" | "h2";
}) {
  const onPaper = tone === "paper";

  return (
    <div className="max-w-3xl">
      <Headline
        as={as}
        text={title}
        className={`text-display-l ${onPaper ? "text-ink" : "text-chalk"}`}
      />
      {standfirst && (
        <Reveal delay={0.15}>
          <p
            className={`mt-5 text-body-l ${onPaper ? "text-ink/70" : "text-steel"}`}
          >
            {standfirst}
          </p>
        </Reveal>
      )}
    </div>
  );
}
