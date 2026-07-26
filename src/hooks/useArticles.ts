import { useCallback, useEffect, useMemo, useState } from 'react';
import { sampleArticles } from '../data/sampleArticles';
import type { Article, CategoryFilter } from '../types/article';

export type ArticlesStatus = 'loading' | 'ready' | 'error';

export interface UseArticlesResult {
  articles: Article[];
  filteredArticles: Article[];
  status: ArticlesStatus;
  error: string | null;
  category: CategoryFilter;
  searchQuery: string;
  setCategory: (category: CategoryFilter) => void;
  setSearchQuery: (query: string) => void;
  reload: () => void;
  getRelated: (article: Article, limit?: number) => Article[];
}

/**
 * Data layer for articles. Today it loads sample data after a short delay
 * (so skeletons can render). Swap the fetch body later for a real API.
 */
export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<ArticlesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      // Simulate network latency so loading UI is visible during development.
      await new Promise((resolve) => setTimeout(resolve, 450));
      // Future: const res = await fetch('/api/articles'); ...
      setArticles(sampleArticles);
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

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        article.title.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        article.source.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)
      );
    });
  }, [articles, category, searchQuery]);

  const getRelated = useCallback(
    (article: Article, limit = 3) =>
      articles
        .filter((a) => a.id !== article.id && a.category === article.category)
        .slice(0, limit),
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
