import type { MetadataRoute } from "next";
import { dept, institute } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${dept.short} · ${institute.short}`,
    short_name: "CSE·AI",
    description: `Department of ${dept.name}, ${institute.name}, Pune.`,
    start_url: "/",
    display: "browser",
    background_color: "#04050b",
    theme_color: "#04050b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
