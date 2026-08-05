import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // simple solution for local uploads
  },
};

export default nextConfig;