import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // A report carries one photo and one KTP file, each capped at 10 MB.
    serverActions: { bodySizeLimit: "22mb" },
    proxyClientMaxBodySize: "22mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
