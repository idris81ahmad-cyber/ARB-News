'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
}

export function InfiniteScrollSentinel({
  hasMore,
  onLoadMore,
  disabled,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || disabled) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, disabled]);

  if (!hasMore) return null;

  return (
    <div
      ref={ref}
      className="flex items-center justify-center py-8 text-sm text-muted-foreground"
      aria-hidden
    >
      Loading more stories…
    </div>
  );
}
