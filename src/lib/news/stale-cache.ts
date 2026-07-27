import type { Article } from '@/types/article';

export type LiveNewsSource = 'newsapi' | 'gnews';

export interface StaleCacheEntry {
  articles: Article[];
  source: LiveNewsSource;
  fetchedAt: string;
}

// Module-level cache survives warm serverless invocations.
let memoryCache: StaleCacheEntry | null = null;

const MAX_STALE_MS = 1000 * 60 * 60 * 6; // 6 hours

export function getStaleNews(): StaleCacheEntry | null {
  if (!memoryCache) return null;
  const age = Date.now() - Date.parse(memoryCache.fetchedAt);
  if (Number.isNaN(age) || age > MAX_STALE_MS) return null;
  return memoryCache;
}

export function setStaleNews(articles: Article[], source: LiveNewsSource): void {
  memoryCache = {
    articles,
    source,
    fetchedAt: new Date().toISOString(),
  };
}
