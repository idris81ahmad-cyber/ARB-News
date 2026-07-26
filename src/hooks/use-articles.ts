'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterArticles, getRelatedArticles } from '@/lib/articles';
import type { Article, CategoryFilter } from '@/types/article';

export type ArticlesStatus = 'loading' | 'ready' | 'error';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<ArticlesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to load articles');
      const data = (await res.json()) as { articles: Article[] };
      setArticles(data.articles);
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
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    reload: load,
    getRelated,
  };
}
