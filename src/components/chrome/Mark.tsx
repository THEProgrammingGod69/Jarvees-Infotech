/**
 * The department mark: six neurons on a ring, each wired to a central node —
 * a single hidden layer, drawn. The ring turns slowly on hover.
 */
export default function Mark({ className = "h-9 w-9", gradientId = "mark-g" }: { className?: string; gradientId?: string }) {
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [20 + Math.cos(a) * 13, 20 + Math.sin(a) * 13] as const;
  });
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-cyan)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-violet)" }} />
        </linearGradient>
      </defs>
      <g className="origin-center [transform-box:fill-box] transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:rotate-[120deg]">
        <circle cx="20" cy="20" r="13" fill="none" stroke={`url(#${gradientId})`} strokeOpacity="0.35" strokeWidth="1" />
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <line x1="20" y1="20" x2={x} y2={y} stroke={`url(#${gradientId})`} strokeWidth="1" strokeOpacity="0.8" />
            <circle cx={x} cy={y} r="2.2" fill={`url(#${gradientId})`} />
          </g>
        ))}
      </g>
      <circle cx="20" cy="20" r="3.6" className="fill-cyan" />
      <circle cx="20" cy="20" r="6.5" fill="none" className="stroke-cyan" strokeOpacity="0.35" />
    </svg>
  );
}
