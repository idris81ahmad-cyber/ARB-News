'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { filterArticles, getRelatedArticles } from '@/lib/article-helpers';
import type { Article, CategoryFilter } from '@/types/article';

export type ArticlesStatus = 'loading' | 'ready' | 'error';

export type ArticlesMeta = {
  source: string;
  fallback: boolean;
  stale?: boolean;
  warning: string | null;
  count: number;
  fetchedAt: string;
  requestId?: string;
};

const PAGE_SIZE = 9;

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<ArticlesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ArticlesMeta | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, 320);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/articles', { cache: 'no-store' });
      const data = (await res.json()) as {
        articles: Article[];
        meta?: ArticlesMeta;
      };

      if (!res.ok && (!data.articles || data.articles.length === 0)) {
        throw new Error(data.meta?.warning || 'Failed to load articles');
      }

      setArticles(data.articles ?? []);
      setMeta(data.meta ?? null);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, debouncedSearch]);

  const filteredArticles = useMemo(
    () => filterArticles(articles, category, debouncedSearch),
    [articles, category, debouncedSearch],
  );

  const visibleArticles = useMemo(
    () => filteredArticles.slice(0, visibleCount),
    [filteredArticles, visibleCount],
  );

  const hasMore = visibleCount < filteredArticles.length;

  const loadMore = useCallback(() => {
    setVisibleCount((n) => n + PAGE_SIZE);
  }, []);

  const getRelated = useCallback(
    (article: Article, limit = 4) => getRelatedArticles(articles, article, limit),
    [articles],
  );

  const clearFilters = useCallback(() => {
    setCategory('All');
    setSearchQuery('');
  }, []);

  return {
    articles,
    filteredArticles,
    visibleArticles,
    totalCount: articles.length,
    filteredCount: filteredArticles.length,
    hasMore,
    loadMore,
    pageSize: PAGE_SIZE,
    status,
    error,
    meta,
    category,
    searchQuery,
    debouncedSearch,
    setCategory,
    setSearchQuery,
    clearFilters,
    reload: load,
    getRelated,
  };
}
