import { ImageResponse } from "next/og";

import { courses, getCourse } from "@/content/courses";
import { nodeForSlug, edgesFor, getNode } from "@/content/landscape";
import { trackById, levelLabel } from "@/content/types";
import { site } from "@/lib/site";

export const alt = "Course at Jarvees Academy, Pune";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

/**
 * Per-course Open Graph card.
 *
 * A shared course link carries the course name, its module code, and — for the
 * SAP modules — the modules it actually integrates with, pulled from the same
 * landscape data that draws the map on the home page. So the card teaches the
 * same true thing the site does, rather than being a title on a gradient.
 *
 * Colours are the token values written literally, because this renders outside
 * the CSS layer.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);

  const INK = "#080c14";
  const GRAPHITE = "#0f1420";
  const HAIRLINE = "#232c3e";
  const CHALK = "#e4e8f0";
  const STEEL = "#7c8ca8";
  const SIGNAL = "#ffb000";

  if (!course) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: INK,
            color: CHALK,
            fontSize: 56,
            fontFamily: "sans-serif",
          }}
        >
          {site.name}
        </div>
      ),
      size,
    );
  }

  const node = nodeForSlug(course.slug);

  // The modules this one genuinely integrates with, read from the same
  // landscape data that draws the map on the home page.
  const neighbourCodes: string[] = node
    ? Array.from(
        new Set(
          edgesFor(node.id).map((edge) =>
            edge.from === node.id ? edge.to : edge.from,
          ),
        ),
      )
        .map((id) => getNode(id)?.code)
        .filter((code): code is string => Boolean(code))
        .slice(0, 4)
    : [];

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
        <div
          style={{ display: "flex", alignItems: "center", gap: 16 }}
        >
          <div
            style={{ width: 18, height: 18, border: `3px solid ${SIGNAL}`, display: "flex" }}
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
            {site.name} · Pune · {trackById(course.track).name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {course.moduleCode && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                border: `2px solid ${SIGNAL}`,
                color: SIGNAL,
                padding: "8px 16px",
                fontSize: 24,
                letterSpacing: 3,
              }}
            >
              {course.moduleCode}
            </div>
          )}
          <div
            style={{
              color: CHALK,
              fontSize: course.name.length > 20 ? 78 : 96,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {course.name}
          </div>
          <div
            style={{ color: STEEL, fontSize: 27, display: "flex", maxWidth: 900 }}
          >
            {course.summary}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {neighbourCodes.length > 0 ? (
              <>
                <div
                  style={{
                    color: STEEL,
                    fontSize: 20,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    display: "flex",
                    // Satori sizes this box to its glyphs, and the tracking on
                    // the last letter leaves no optical gap before the chip.
                    paddingRight: 10,
                  }}
                >
                  Integrates with
                </div>
                {neighbourCodes.map((code) => (
                  <div
                    key={code}
                    style={{
                      display: "flex",
                      border: `1px solid ${HAIRLINE}`,
                      background: GRAPHITE,
                      color: STEEL,
                      padding: "8px 14px",
                      fontSize: 20,
                      letterSpacing: 2,
                    }}
                  >
                    {code}
                  </div>
                ))}
              </>
            ) : (
              <div
                style={{
                  color: STEEL,
                  fontSize: 22,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Live project · Placement assistance
              </div>
            )}
          </div>
          <div
            style={{
              color: STEEL,
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {levelLabel[course.level]} · Online &amp; classroom
          </div>
        </div>
      </div>
    ),
    size,
  );
}
