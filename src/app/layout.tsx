import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import "./globals.css";

import BootSequence from "@/components/chrome/BootSequence";
import CommandPalette from "@/components/chrome/CommandPalette";
import Footer from "@/components/chrome/Footer";
import Header from "@/components/chrome/Header";
import PointerFx from "@/components/fx/PointerFx";
import RevealObserver from "@/components/fx/RevealObserver";
import ScrollProgress from "@/components/fx/ScrollProgress";
import { departmentSchema } from "@/lib/jsonld";
import { dept, institute, SITE_URL } from "@/lib/site";

/**
 * Three families, three jobs (see DESIGN.md §3). next/font self-hosts them
 * at build time: no third-party stylesheet on the critical path, no swap
 * shift. Only the body face is preloaded — it carries the hero standfirst.
 */
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
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
 * Runs before first paint:
 * - `js` lets below-the-fold reveals start hidden only when a script exists
 *   to reveal them again;
 * - `booted` suppresses the boot sequence after the first page of a visit.
 */
const headScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('cseai-booted'))d.classList.add('booted');else sessionStorage.setItem('cseai-booted','1')}catch(e){}})();`;

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
        <BootSequence />
        <div aria-hidden="true" className="atmosphere">
          <div className="atmosphere__aurora atmosphere__aurora--a" />
          <div className="atmosphere__aurora atmosphere__aurora--b" />
          <div className="atmosphere__grid" />
          <div className="atmosphere__noise" />
        </div>
        <ScrollProgress />
        <Header />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
        <CommandPalette />
        <PointerFx />
        <RevealObserver />
      </body>
    </html>
  );
}
