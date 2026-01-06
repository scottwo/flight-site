import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Clean profile URLs: /:handle -> /p/:handle, skipping reserved paths
    return [
      {
        source:
          "/:handle((?!api$|_next$|p$|dashboard$|sign-in$|sign-up$|pricing$|privacy$|terms$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$)[^/]+)",
        destination: "/p/:handle",
      },
    ];
  },
};

export default nextConfig;
