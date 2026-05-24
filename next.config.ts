import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.imgflip.com" },
      { protocol: "https", hostname: "imgflip.com" },
    ],
  },
};

export default nextConfig;
