import type { NextConfig } from "next";
import CopyWebpackPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  // Disable ESLint during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/pdfjs-dist/build/pdf.worker.min.js",
              to: "static/chunks/pdf.worker.min.js",
            },
          ],
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
