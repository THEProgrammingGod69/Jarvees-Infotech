import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Footer from "@/components/chrome/Footer";
import Header from "@/components/chrome/Header";
import PaletteLauncher from "@/components/chrome/PaletteLauncher";
import { departmentSchema } from "@/lib/jsonld";
import { dept, institute, SITE_URL } from "@/lib/site";
import MotionRuntime from "@/motion/MotionRuntime";
import PointerFx from "@/motion/PointerFx";

/**
 * Three families, three jobs (see DESIGN.md §3). Self-hosted, each as one
 * small variable WOFF2 subset to exactly the characters the site uses —
 * rupee sign included (scripts/subset-fonts.py). next/font generates
 * size-matched fallbacks, so the swap does not shift the layout. Display
 * and body faces are preloaded (they set the hero); mono labels are not.
 */
const unbounded = localFont({
  src: "../fonts/unbounded.woff2",
  weight: "500 600",
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = localFont({
  src: "../fonts/manrope.woff2",
  weight: "400 700",
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = localFont({
  src: "../fonts/jetbrains-mono.woff2",
  weight: "400 500",
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

export const viewport: Viewport = {
  themeColor: "#04050b",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

const title = `${dept.short} — Artificial Intelligence at ${institute.short}`;
const description = `The Department of ${dept.name} at ${institute.name}, Pune. A four-year B.Tech with an intake of ${dept.intake}, an autonomous AI-first curriculum, hackathon-winning students and placements up to ₹32.75 LPA.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s · ${dept.short}, ${institute.short}` },
  description,
  applicationName: `${dept.short} · ${institute.short}`,
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: `${dept.short} · ${institute.short}`,
    url: SITE_URL,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * Runs before first paint. `js` lets below-the-fold reveals start hidden
 * only when a script exists to reveal them again, so a visitor without
 * JavaScript simply sees everything.
 */
const headScript = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${unbounded.variable} ${manrope.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(departmentSchema()).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <div aria-hidden="true" className="atmosphere">
          <div className="atmosphere__glow" />
          <div className="atmosphere__grid" />
        </div>
        <div aria-hidden="true" className="scroll-progress fixed inset-x-0 top-0 z-[60] h-px bg-gradient-to-r from-cyan via-violet to-magenta" />
        <Header />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
        <PaletteLauncher />
        <PointerFx />
        <MotionRuntime />
      </body>
    </html>
  );
}
