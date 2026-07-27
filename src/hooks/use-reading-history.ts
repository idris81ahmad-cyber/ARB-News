'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  READING_HISTORY_KEY,
  normalizeHistory,
  pushReadingHistory,
  removeFromHistory,
  type ReadingHistoryEntry,
} from '@/lib/reading-history';
import { parseJsonSafe, persistence } from '@/lib/persistence';
import type { Article } from '@/types/article';

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await persistence.getItem(READING_HISTORY_KEY);
        if (cancelled) return;
        const parsed = parseJsonSafe<unknown>(raw, []);
        setHistory(normalizeHistory(parsed));
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const write = useCallback(async (next: ReadingHistoryEntry[]) => {
    setHistory(next);
    try {
      await persistence.setItem(READING_HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* non-fatal */
    }
  }, []);

  const recordRead = useCallback(
    async (article: Article) => {
      setHistory((prev) => {
        const next = pushReadingHistory(prev, article);
        void persistence.setItem(READING_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const dismiss = useCallback(
    async (id: number) => {
      setHistory((prev) => {
        const next = removeFromHistory(prev, id);
        void persistence.setItem(READING_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearAll = useCallback(async () => {
    await write([]);
  }, [write]);

  const lastRead = history[0] ?? null;
  const recent = history.slice(0, 6);

  return {
    history,
    recent,
    lastRead,
    ready,
    recordRead,
    dismiss,
    clearAll,
  };
}
