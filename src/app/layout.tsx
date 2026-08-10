import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import { ScrollProgress } from "@/components/motion";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organisationSchema, centreSchemas } from "@/lib/jsonld";
import { SITE_URL, site } from "@/lib/site";

/**
 * Three families, three jobs. See DESIGN.md §3.
 *
 * next/font downloads these at build time and serves them from our own origin,
 * so there is no render-blocking third-party stylesheet and no font-swap
 * layout shift. `display: swap` plus an adjusted fallback keeps first paint
 * readable without a jump.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  // The width axis was dropped after measurement — see DESIGN.md §3. Loading
  // it took this face from 35KB to 90KB and cost roughly four Lighthouse
  // mobile points, to buy a width change most visitors would never perceive.
  // Not preloaded: the body face owns the hero's largest-contentful text and
  // should not have to share the critical bandwidth with the display face.
  preload: false,
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  // Not preloaded on purpose. Mono is only ever used for small labels, never
  // for the largest-contentful text, so letting it load after the display and
  // body faces removes three files from the critical bandwidth contest. This
  // was measured: preloading all five faces pushed hero render delay to 2.4s.
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#080c14",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jarvees Academy — SAP and enterprise technology training in Pune",
    template: "%s | Jarvees Academy",
  },
  description:
    "SAP, Salesforce, data science and software engineering training in Pune since 2015. Classroom at Narhe and Tilak Road, or online. Live projects and placement assistance.",
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.legalOperator,
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    url: SITE_URL,
    title: "Jarvees Academy — SAP and enterprise technology training in Pune",
    description:
      "SAP, Salesforce, data science and software engineering training in Pune since 2015. Two centres, online and classroom, live projects.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Jarvees Academy — SAP and enterprise technology training in Pune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jarvees Academy — SAP and enterprise technology training in Pune",
    description:
      "SAP, Salesforce, data science and software engineering training in Pune since 2015. Two centres, online and classroom, live projects.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${archivo.variable} ${publicSans.variable} ${plexMono.variable}`}
    >
      {/* `grain` puts a fixed film-grain layer over the whole viewport. It is
          the cheapest thing on the site that stops flat dark planes reading as
          printed rather than lit. */}
      <body className="grain">
        <ScrollProgress />
        {/* Organisation and both centres are described once, at the root, so
            every page carries them. Course schema is added per course page. */}
        <JsonLd id="schema-organisation" data={organisationSchema()} />
        {centreSchemas().map((schema, i) => (
          <JsonLd key={i} id={`schema-centre-${i}`} data={schema} />
        ))}

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-mono-label focus:uppercase focus:text-ink"
        >
          Skip to content
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
