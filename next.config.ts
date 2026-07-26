import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Unsplash is optimized; other news CDN hosts use unoptimized in ArticleImage.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'punchng.com',
      },
      {
        protocol: 'https',
        hostname: '**.punchng.com',
      },
    ],
  },
};

export default nextConfig;
