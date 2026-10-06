/**
 * A circuit trace between sections: it draws itself as it scrolls through
 * the viewport and its junctions light as the signal reaches them (CSS
 * scroll-driven). Purely decorative; hidden on small screens.
 */
const VARIANTS = [
  { d: "M0 48H300L332 16H640L672 80H900L932 48H1200", nodes: [[332, 16, 0.3], [672, 80, 0.58], [932, 48, 0.78]] },
  { d: "M0 48H220L252 80H560L592 16H960L992 48H1200", nodes: [[252, 80, 0.21], [592, 16, 0.5], [992, 48, 0.83]] },
] as const;

export default function Trace({ variant = 0 }: { variant?: 0 | 1 }) {
  const v = VARIANTS[variant];
  return (
    <div aria-hidden="true" className="trace-wrap pointer-events-none relative z-10 mx-auto hidden h-24 w-full max-w-[84rem] px-8 md:block">
      <svg viewBox="0 0 1200 96" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path d={v.d} fill="none" className="stroke-line" strokeWidth="1" />
        <path d={v.d} pathLength={1} fill="none" className="trace stroke-cyan" strokeWidth="1.5" />
        {v.nodes.map(([x, y, at]) => (
          <circle
            key={x}
            cx={x}
            cy={y}
            r="3.5"
            className="trace-node fill-cyan"
            style={{ ["--at" as string]: `${(at * 55).toFixed(1)}%` }}
          />
        ))}
      </svg>
    </div>
  );
}
