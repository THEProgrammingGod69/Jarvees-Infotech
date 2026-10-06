import type { MetadataRoute } from "next";
import { nav, SITE_URL } from "@/lib/site";

// Generated once at build time into out/sitemap.xml. URLs carry the trailing
// slash the site is exported with, so they match the canonical tags exactly.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...nav.map((n) => ({ url: `${SITE_URL}${n.href}/`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
