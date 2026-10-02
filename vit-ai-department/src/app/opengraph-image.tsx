import { ImageResponse } from "next/og";
import { dept, institute } from "@/lib/site";

export const alt = `${dept.short} — Department of ${dept.name}, ${institute.name}, Pune`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social card, generated at build: the department mark as a lattice of
 * neurons, the name, and the institute. Colours are the token values.
 */
export default function OpengraphImage() {
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [200 + Math.cos(a) * 130, 200 + Math.sin(a) * 130] as const;
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(circle at 78% 40%, #1d1640 0%, #04050b 55%)",
          color: "#e8edff",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#93a0c4" }}>
            {`${institute.name.toUpperCase()} · PUNE`}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 128, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
              CSE<span style={{ color: "#5ce1ff" }}>·</span>AI
            </div>
            <div style={{ display: "flex", fontSize: 34, color: "#93a0c4", marginTop: 24, maxWidth: 640 }}>
              Department of Computer Science &amp; Engineering (Artificial Intelligence)
            </div>
          </div>
          <div style={{ display: "flex", gap: 36, fontSize: 24, color: "#5ce1ff" }}>
            <span>{`Intake ${dept.intake}`}</span>
            <span>NAAC A++</span>
            <span>NIRF Top 150</span>
          </div>
        </div>
        <svg width="400" height="400" viewBox="0 0 400 400" style={{ marginTop: 60 }}>
          <circle cx="200" cy="200" r="130" fill="none" stroke="#a68bff" strokeOpacity="0.45" strokeWidth="2" />
          {nodes.map(([x, y], i) => (
            <line key={`l${i}`} x1="200" y1="200" x2={x} y2={y} stroke="#5ce1ff" strokeOpacity="0.7" strokeWidth="3" />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={`c${i}`} cx={x} cy={y} r="16" fill={i % 2 ? "#a68bff" : "#5ce1ff"} />
          ))}
          <circle cx="200" cy="200" r="34" fill="#5ce1ff" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="#5ce1ff" strokeOpacity="0.35" strokeWidth="2" />
        </svg>
      </div>
    ),
    size,
  );
}
