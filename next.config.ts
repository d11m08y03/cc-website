import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
