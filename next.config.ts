import type { NextConfig } from "next";

/**
 * The site is exported as plain static files (out/). There is no server and
 * no function to cold-start, so it serves from a CDN edge cache to any number
 * of simultaneous visitors and can be hosted anywhere static files are:
 * Vercel, Netlify, Cloudflare Pages, or the institute's own web server.
 *
 * Response headers (security, caching) therefore live with the host, not
 * here: see vercel.json and public/_headers.
 */
// Canonical URLs, the sitemap and social cards need the public address.
const siteUrlKnown = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "URL", "CF_PAGES_URL"].some((k) => process.env[k]);
if (process.env.NODE_ENV === "production" && !siteUrlKnown && process.argv.includes("build")) {
  console.warn(
    "\n⚠  NEXT_PUBLIC_SITE_URL is not set: canonical URLs and the sitemap will point to http://localhost:3000.\n" +
      "   Set it to the site's public address, e.g. NEXT_PUBLIC_SITE_URL=https://cseai.vit.edu npm run build\n",
  );
}

const nextConfig: NextConfig = {
  output: "export",
  // /about/ → about/index.html: resolves on every static host without
  // rewrite rules.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Photos are pre-optimised by scripts/optimize-images.mjs into one WebP
    // per width below; the loader just picks the matching file.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    imageSizes: [256],
    deviceSizes: [480, 828, 1080, 1440, 1920],
  },
};

export default nextConfig;
