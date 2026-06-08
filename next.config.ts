import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for optimized production builds
  // output: 'standalone',
  // Rewrites for SPA routing
  async rewrites() {
    return [
      { source: '/about', destination: '/' },
      { source: '/community', destination: '/' },
      { source: '/sponsoring', destination: '/' },
      { source: '/containers', destination: '/' },
      { source: '/categories', destination: '/' },
      { source: '/app/:slug', destination: '/?preview=:slug' },
    ];
  },
};

export default nextConfig;