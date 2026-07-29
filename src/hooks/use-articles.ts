'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { filterArticles, getRelatedArticles } from '@/lib/article-helpers';
import { selectTopStories } from '@/lib/news/relevance';
import type { Article, CategoryFilter } from '@/types/article';

export type ArticlesStatus = 'loading' | 'ready' | 'error' | 'refreshing';

export type ArticlesMeta = {
  source: string;
  fallback: boolean;
  stale?: boolean;
  warning: string | null;
  count: number;
  fetchedAt: string;
  requestId?: string;
  droppedByControl?: number;
};

const PAGE_SIZE = 9;

function sortNewestFirst(list: Article[]): Article[] {
  return [...list].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.id - a.id;
  });
}

export function useArticles(options?: {
  initialArticles?: Article[];
  initialMeta?: ArticlesMeta | null;
}) {
  const hasInitial = Boolean(options?.initialArticles?.length);
  const articlesRef = useRef<Article[]>(options?.initialArticles ?? []);

  const [articles, setArticles] = useState<Article[]>(() =>
    sortNewestFirst(options?.initialArticles ?? []),
  );
  const [status, setStatus] = useState<ArticlesStatus>(
    hasInitial ? 'ready' : 'loading',
  );
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ArticlesMeta | null>(
    options?.initialMeta ?? null,
  );
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(searchQuery, 320);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const hasData = articlesRef.current.length > 0;
    if (opts?.silent && hasData) {
      setStatus('refreshing');
    } else if (hasData) {
      setStatus('refreshing');
      setError(null);
    } else {
      setStatus('loading');
      setError(null);
    }

    try {
      const res = await fetch('/api/articles', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as {
        articles: Article[];
        meta?: ArticlesMeta;
      };

      if (!res.ok && (!data.articles || data.articles.length === 0)) {
        throw new Error(data.meta?.warning || 'Failed to load articles');
      }

      const next = sortNewestFirst(data.articles ?? []);
      setArticles(next);
      setMeta(data.meta ?? null);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      if (articlesRef.current.length === 0) {
        setError(message);
        setStatus('error');
      } else {
        setStatus('ready');
        setMeta((m) =>
          m
            ? { ...m, warning: `Could not refresh live feed: ${message}` }
            : {
                source: 'error',
                fallback: true,
                warning: message,
                count: articlesRef.current.length,
                fetchedAt: new Date().toISOString(),
              },
        );
      }
    }
  }, []);

  useEffect(() => {
    void load({ silent: hasInitial });
  }, [load, hasInitial]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, debouncedSearch]);

  const filteredArticles = useMemo(
    () => sortNewestFirst(filterArticles(articles, category, debouncedSearch)),
    [articles, category, debouncedSearch],
  );

  const visibleArticles = useMemo(
    () => filteredArticles.slice(0, visibleCount),
    [filteredArticles, visibleCount],
  );

  const topStories = useMemo(
    () => selectTopStories(articles, 5),
    [articles],
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
    topStories,
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
    reload: () => load({ silent: false }),
    getRelated,
  };
}
