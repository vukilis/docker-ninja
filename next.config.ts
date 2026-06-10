import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for optimized production builds
  // output: 'export',
  // Rewrites for SPA routing
  // async rewrites() {
  //   return [
  //     { source: '/about', destination: '/' },
  //     { source: '/community', destination: '/' },
  //     { source: '/sponsoring', destination: '/' },
  //     { source: '/containers', destination: '/' },
  //     { source: '/categories', destination: '/' },
  //     { source: '/docs', destination: '/' },
  //     { source: '/app/:slug', destination: '/?preview=:slug' },
  //   ];
  // },
  // allowedDevOrigins: ['test.domain.com']
};

export default nextConfig;