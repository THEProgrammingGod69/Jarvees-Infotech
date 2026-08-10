import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { courses } from "@/content/courses";

/**
 * Generated at build. Adding a course file automatically adds its URL here —
 * there is no separate list to keep in step.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; frequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, frequency: "weekly" },
    { path: "/courses", priority: 0.9, frequency: "weekly" },
    { path: "/live-projects", priority: 0.8, frequency: "monthly" },
    { path: "/corporate-training", priority: 0.8, frequency: "monthly" },
    { path: "/centres", priority: 0.8, frequency: "monthly" },
    { path: "/contact", priority: 0.7, frequency: "monthly" },
    { path: "/about", priority: 0.6, frequency: "monthly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.frequency,
      priority: route.priority,
    })),
    ...courses.map((course) => ({
      url: `${SITE_URL}/courses/${course.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
