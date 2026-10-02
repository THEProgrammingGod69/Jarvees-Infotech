/**
 * Building 3 as an isometric stack, ground floor to the department's top
 * floor. The department's two floors (second and third) glow. The building's
 * full height was not published, so whatever is above is drawn as a dashed
 * ghost rather than asserted. Ground floor is index 0.
 */
export default function BuildingDiagram({ floors = 4, lit = [2, 3] }: { floors?: number; lit?: number[] }) {
  const W = 420;
  const slab = 46;
  const top = 40 + slab;
  // Isometric rhombus for one floor plate, origin at its top vertex.
  const plate = (y: number) => `M210 ${y} L390 ${y + 60} L210 ${y + 120} L30 ${y + 60} Z`;
  const H = top + floors * slab + 140;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Building 3: the department occupies the second and third floors">
      <defs>
        <linearGradient id="bd-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-cyan)", stopOpacity: 0.32 }} />
          <stop offset="1" style={{ stopColor: "var(--color-violet)", stopOpacity: 0.18 }} />
        </linearGradient>
      </defs>
      {/* Painted ground-up, so each floor's walls sit in front of the plate below. */}
      {Array.from({ length: floors }, (_, f) => f).map((f) => {
        const y = top + (floors - 1 - f) * slab;
        const on = lit.includes(f);
        return (
          <g key={f} style={{ animation: `rise .9s var(--ease-out-expo) ${(f + 1) * 120}ms both` }}>
            {/* side walls */}
            <path d={`M30 ${y + 60} L210 ${y + 120} L210 ${y + 120 + slab - 6} L30 ${y + 60 + slab - 6} Z`} className={on ? "fill-cyan/15 stroke-cyan/70" : "fill-deep stroke-line-bright"} strokeWidth={1} />
            <path d={`M390 ${y + 60} L210 ${y + 120} L210 ${y + 120 + slab - 6} L390 ${y + 60 + slab - 6} Z`} className={on ? "fill-violet/15 stroke-violet/70" : "fill-void stroke-line-bright"} strokeWidth={1} />
            <path d={plate(y)} fill={on ? "url(#bd-lit)" : undefined} className={on ? "stroke-cyan" : "fill-panel stroke-line-bright"} strokeWidth={1} />
            {on &&
              Array.from({ length: 6 }, (_, k) => (
                <line key={k} x1={48 + k * 27} y1={y + 66 + k * 9} x2={48 + k * 27} y2={y + 66 + k * 9 + slab - 18} className="stroke-cyan/60" strokeWidth={6} />
              ))}
            <text x={W - 8} y={y + 64} textAnchor="end" className={`font-mono text-[11px] tracking-widest ${on ? "fill-cyan" : "fill-haze"}`}>
              {f === 0 ? "GF" : `F${f}`}
            </text>
          </g>
        );
      })}
      <path d={plate(top - slab)} fill="none" className="stroke-line-bright" strokeDasharray="3 5" strokeWidth={1} />
    </svg>
  );
}
