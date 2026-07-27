import type { Article } from '@/types/article';

export const READING_HISTORY_KEY = 'readingHistory';
export const MAX_HISTORY = 12;

export interface ReadingHistoryEntry extends Article {
  lastReadAt: string; // ISO
}

export function isReadingHistoryEntry(value: unknown): value is ReadingHistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as ReadingHistoryEntry;
  return (
    typeof v.id === 'number' &&
    typeof v.title === 'string' &&
    typeof v.lastReadAt === 'string'
  );
}

export function normalizeHistory(raw: unknown): ReadingHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isReadingHistoryEntry);
}

/** Put article at the front; drop older duplicates; cap length. */
export function pushReadingHistory(
  history: ReadingHistoryEntry[],
  article: Article,
  now = new Date().toISOString(),
): ReadingHistoryEntry[] {
  const entry: ReadingHistoryEntry = {
    ...article,
    lastReadAt: now,
  };
  const rest = history.filter((h) => h.id !== article.id);
  return [entry, ...rest].slice(0, MAX_HISTORY);
}

export function removeFromHistory(
  history: ReadingHistoryEntry[],
  id: number,
): ReadingHistoryEntry[] {
  return history.filter((h) => h.id !== id);
}

export function clearHistory(): ReadingHistoryEntry[] {
  return [];
}

export function formatRelativeReadTime(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'Recently';
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}
