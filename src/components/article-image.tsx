'use client';

import { useEffect, useMemo, useState } from 'react';
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

const FALLBACK_STOCK =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop&auto=format';

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

function buildCandidates(src: string): string[] {
  const list: string[] = [];
  const trimmed = (src || '').trim();

  if (trimmed && !trimmed.startsWith('data:')) {
    list.push(trimmed);
    // Drop query string — some CDNs choke on resized params from aggregators
    try {
      const u = new URL(trimmed);
      if (u.search) {
        u.search = '';
        list.push(u.toString());
      }
      // Prefer https
      if (u.protocol === 'http:') {
        u.protocol = 'https:';
        list.push(u.toString());
      }
    } catch {
      /* ignore bad urls */
    }
  }

  list.push(FALLBACK_STOCK);
  list.push(PLACEHOLDER_IMAGE);

  // unique preserve order
  return [...new Set(list)];
}

/**
 * Aggressive image loading for flaky news CDNs:
 * try original → stripped query → https upgrade → stock → local SVG.
 * Uses native <img> (more reliable than next/image for arbitrary hosts).
 */
export function ArticleImage({
  src,
  alt,
  className,
  priority,
  fill,
  width,
  height,
}: ArticleImageProps) {
  const candidates = useMemo(() => buildCandidates(src), [src]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const currentSrc = candidates[Math.min(index, candidates.length - 1)];
  const failedAll = index >= candidates.length - 1 && currentSrc === PLACEHOLDER_IMAGE;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={failedAll || currentSrc === PLACEHOLDER_IMAGE ? `${alt || 'Article'} (image unavailable)` : alt}
      className={cn(
        fill ? 'absolute inset-0 h-full w-full object-cover' : 'object-cover',
        'bg-emerald-50 dark:bg-emerald-950',
        className,
      )}
      width={fill ? undefined : width ?? 800}
      height={fill ? undefined : height ?? 500}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((i) => Math.min(i + 1, candidates.length - 1));
      }}
    />
  );
}
