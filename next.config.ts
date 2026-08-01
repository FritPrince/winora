import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which silently fails the admin cover
      // image/product file uploads (Server Actions carry the file since
      // they're plain <form action> submits, not a direct-to-storage
      // upload). 25MB covers cover images and most digital products;
      // very large files (video) would need a different upload path.
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wkiqewynljyqfsycgnns.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
