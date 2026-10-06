"use client";

/**
 * Last line of defence: replaces the whole document if the root layout
 * itself fails. Deliberately dependency-free — plain markup, inline styles —
 * so it can render even when everything else has gone wrong.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#04050b", color: "#e8edff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, padding: 24 }}>
          <p style={{ color: "#ff5cad", letterSpacing: "0.16em", fontSize: 12, textTransform: "uppercase" }}>Error · signal lost</p>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, margin: "16px 0" }}>The site failed to start.</h1>
          <p style={{ color: "#93a0c4", lineHeight: 1.6 }}>Please reload the page. If it keeps happening, try again in a few minutes.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, minHeight: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#5ce1ff", color: "#04050b", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
