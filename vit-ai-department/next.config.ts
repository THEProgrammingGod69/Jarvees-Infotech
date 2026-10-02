import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This app lives in a subfolder of a repository with its own lockfile;
  // pin tracing to this folder so the parent is never pulled in.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Department photographs are served from the institute's own CDN paths.
    // `unoptimized` is set per image, so this list only documents the origin.
    remotePatterns: [{ protocol: "https", hostname: "www.vit.edu", pathname: "/CSE-AI/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
