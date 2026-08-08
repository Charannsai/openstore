import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output static HTML for Electron production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Allow loading images from external sources (app icons)
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

