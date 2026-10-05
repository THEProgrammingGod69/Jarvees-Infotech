import type { MetadataRoute } from "next";
import { nav, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...nav.map((n) => ({ url: `${SITE_URL}${n.href}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
