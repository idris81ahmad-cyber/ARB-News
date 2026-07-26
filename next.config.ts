import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Live news images come from many publishers; ArticleImage uses
    // unoptimized for non-Unsplash hosts. Unsplash stays optimized.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      // Allow remote news image hosts when optimization is enabled later
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
