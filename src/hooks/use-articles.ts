'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterArticles, getRelatedArticles } from '@/lib/article-helpers';
import type { Article, CategoryFilter } from '@/types/article';

export type ArticlesStatus = 'loading' | 'ready' | 'error';

export type ArticlesMeta = {
  source: string;
  fallback: boolean;
  warning: string | null;
  count: number;
  fetchedAt: string;
};

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<ArticlesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ArticlesMeta | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredArticles = useMemo(
    () => filterArticles(articles, category, searchQuery),
    [articles, category, searchQuery],
  );

  const getRelated = useCallback(
    (article: Article, limit = 3) => getRelatedArticles(articles, article, limit),
    [articles],
  );

  return {
    articles,
    filteredArticles,
    status,
    error,
    meta,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    reload: load,
    getRelated,
  };
}
