/**
 * The mark is a three-node schematic fragment — two connected modules and the
 * layer beneath them. It is the module map compressed to 20px, so the brand
 * mark and the signature element are the same idea at two scales.
 */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
    >
      <rect x="1.5" y="2.5" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.5" y="2.5" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="15.5" width="8" height="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 5.5h5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 8.5v4h13v-4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12.5v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Stage 7, "remove one thing": the header lockup used to carry a mono strapline
 * — "SAP & enterprise technology" — under the wordmark. It was cut.
 *
 * It repeated what the h1 of every page already says, it made a sticky header
 * taller on exactly the screens with least vertical room, and it was the one
 * piece of the chrome doing decoration rather than work. The wordmark is
 * stronger alone, and the header now holds a single idea.
 */
export default function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <Mark className="h-5 w-5 shrink-0 text-signal" />
      <span className="font-display text-[1.0625rem] font-bold tracking-[-0.02em] text-chalk">
        Jarvees Academy
      </span>
    </span>
  );
}
