import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    // A stray lockfile in the user's home folder must not be mistaken for the workspace root.
    root: process.cwd(),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Published content is read from content/live/ at runtime too (cache refreshes), so ship it with every function.
  outputFileTracingIncludes: { '/**': ['./content/live/**/*'] },
  experimental: {
    // Photos are shrunk in the browser first; Vercel accepts request bodies up to 4.5 MB.
    serverActions: { bodySizeLimit: '4mb' },
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  async redirects() {
    // Keep links to the previous static site working.
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/diensten.html', destination: '/diensten', permanent: true },
      { source: '/over-ons.html', destination: '/over-ons', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/offerte.html', destination: '/offerte', permanent: true },
    ];
  },
};

export default nextConfig;
