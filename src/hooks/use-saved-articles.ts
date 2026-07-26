'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseJsonSafe, persistence } from '@/lib/persistence';
import type { Article } from '@/types/article';

const SAVED_KEY = 'savedArticles';

function isArticleArray(value: unknown): value is Article[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Article).id === 'number' &&
        typeof (item as Article).title === 'string',
    )
  );
}

export function useSavedArticles() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await persistence.getItem(SAVED_KEY);
        if (cancelled) return;
        const parsed = parseJsonSafe<unknown>(raw, []);
        setSavedArticles(isArticleArray(parsed) ? parsed : []);
      } catch {
        if (!cancelled) {
          setStorageError('Could not load saved articles. Using an empty list.');
          setSavedArticles([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Article[]) => {
    setSavedArticles(next);
    try {
      await persistence.setItem(SAVED_KEY, JSON.stringify(next));
      setStorageError(null);
    } catch {
      setStorageError('Could not save your library. Changes may not persist.');
    }
  }, []);

  const toggleSave = useCallback(
    async (article: Article) => {
      const isAlreadySaved = savedArticles.some((a) => a.id === article.id);
      const next = isAlreadySaved
        ? savedArticles.filter((a) => a.id !== article.id)
        : [...savedArticles, article];
      await persist(next);
    },
    [persist, savedArticles],
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const isSaved = useCallback(
    (id: number) => savedArticles.some((a) => a.id === id),
    [savedArticles],
  );

  return {
    savedArticles,
    ready,
    storageError,
    toggleSave,
    clearAll,
    isSaved,
  };
}
