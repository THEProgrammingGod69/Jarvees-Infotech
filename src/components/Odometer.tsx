import { vars } from "@/components/ui";

// Each digit column is a strip of 0–9 twice, one digit per line, as a single
// text node; CSS rolls it from 0 through one full turn to its digit when the
// number scrolls into view.
const STRIP = [..."01234567890123456789"].join("\n");

/**
 * A number that rolls into place like a mechanical counter (CSS only,
 * transform only). The server renders the final value, so it is correct
 * without JavaScript, for crawlers and for screen readers, which read the
 * plain text beside it.
 */
export default function Odometer({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const text = new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  let column = 0;
  return (
    <span data-reveal="keep" className="tabular-nums">
      <span className="sr-only">{`${prefix}${text}${suffix}`}</span>
      <span aria-hidden="true" className="odo">
        {prefix && <span>{prefix}</span>}
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="odo-col">
              <span className="odo-strip" style={vars({ "--n": ch, "--i": column++ })}>
                {STRIP}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
        {suffix && <span>{suffix}</span>}
      </span>
    </span>
  );
}
