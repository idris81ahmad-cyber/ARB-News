'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#007A33"/>
      <stop offset="55%" stop-color="#006400"/>
      <stop offset="100%" stop-color="#0b3d1f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <circle cx="650" cy="90" r="48" fill="#FFD700" opacity="0.9"/>
  <text x="400" y="250" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700">ARB News</text>
  <text x="400" y="300" text-anchor="middle" fill="#FFD700" font-family="Segoe UI, Arial, sans-serif" font-size="20">The Pulse of Nigeria</text>
</svg>`.trim());

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

function isKnownOptimizerHost(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return host === 'images.unsplash.com' || host.endsWith('.unsplash.com');
  } catch {
    return false;
  }
}

export function ArticleImage({
  src,
  alt,
  className,
  priority,
  sizes = '(max-width: 768px) 100vw, 400px',
  fill,
  width,
  height,
}: ArticleImageProps) {
  const [failed, setFailed] = useState(false);
  const currentSrc = failed ? PLACEHOLDER_IMAGE : src;

  // News APIs serve images from many CDNs; only optimize known hosts.
  const unoptimized =
    failed ||
    currentSrc.startsWith('data:') ||
    !isKnownOptimizerHost(currentSrc);

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={failed ? `${alt} (image unavailable)` : alt}
        fill
        className={cn('object-cover', className)}
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={failed ? `${alt} (image unavailable)` : alt}
      width={width ?? 800}
      height={height ?? 500}
      className={cn('object-cover', className)}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
    />
  );
}
