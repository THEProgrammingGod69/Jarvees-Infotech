import { Fragment } from "react";
import { vars } from "@/components/ui";

/**
 * A quote that is read the way a transformer reads: as it crosses the
 * screen, attention moves through it word by word — each word lights up
 * in turn with a brief underline sweeping beneath it, scrubbed by scroll
 * (CSS scroll-driven, `.attn`). Without scroll timelines it is simply
 * shown in full.
 */
export default function AttentionQuote({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  const n = words.length;
  return (
    <blockquote className={`attn-quote ${className}`}>
      <p>
        <span className="sr-only">“{text}”</span>
        <span aria-hidden="true">
          {words.map((word, i) => {
            const r0 = 16 + (i / n) * 46;
            return (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="attn" style={vars({ "--r0": `${r0.toFixed(1)}%`, "--r1": `${(r0 + 6).toFixed(1)}%` })}>
                  {i === 0 ? "“" : ""}
                  {word}
                  {i === n - 1 ? "”" : ""}
                </span>
              </Fragment>
            );
          })}
        </span>
      </p>
    </blockquote>
  );
}
