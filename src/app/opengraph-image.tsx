import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt =
  "Jarvees Academy — SAP and enterprise technology training in Pune";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph card, generated at build.
 *
 * It is a fragment of the module map on the ink plane — the same idea as the
 * site, so a shared link is recognisably from here. Colours are the token
 * values written literally, because this renders outside the CSS layer.
 */
export default async function Image() {
  const INK = "#080c14";
  const GRAPHITE = "#0f1420";
  const HAIRLINE = "#232c3e";
  const CHALK = "#e4e8f0";
  const STEEL = "#7c8ca8";
  const SIGNAL = "#ffb000";

  const modules = ["MM", "FICO", "SD", "ABAP", "BASIS", "S/4"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              border: `3px solid ${SIGNAL}`,
              display: "flex",
            }}
          />
          <div
            style={{
              color: STEEL,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Jarvees Academy · Pune · Since {site.founded}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: CHALK,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2,
              display: "flex",
              maxWidth: 900,
            }}
          >
            SAP and enterprise technology training in Pune
          </div>
          <div
            style={{
              color: STEEL,
              fontSize: 27,
              display: "flex",
              maxWidth: 820,
            }}
          >
            Classroom at Narhe and Tilak Road, or online. A live project on
            every course.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {modules.map((code) => (
              <div
                key={code}
                style={{
                  display: "flex",
                  border: `1px solid ${code === "FICO" ? SIGNAL : HAIRLINE}`,
                  background: GRAPHITE,
                  color: code === "FICO" ? SIGNAL : STEEL,
                  padding: "10px 16px",
                  fontSize: 22,
                  letterSpacing: 2,
                }}
              >
                {code}
              </div>
            ))}
          </div>
          <div
            style={{
              color: STEEL,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {site.certification} · {site.rating.value}/5 ({site.rating.count})
          </div>
        </div>
      </div>
    ),
    size,
  );
}
