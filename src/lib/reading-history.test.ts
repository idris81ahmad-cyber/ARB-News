import { describe, expect, it } from 'vitest';
import {
  formatRelativeReadTime,
  normalizeHistory,
  pushReadingHistory,
  removeFromHistory,
} from '@/lib/reading-history';
import type { Article } from '@/types/article';

const sample: Article = {
  id: 1,
  title: 'Lagos story',
  category: 'Politics',
  content: 'Body',
  imageUrl: 'https://example.com/a.jpg',
  date: '2026-07-01',
  source: 'Punch',
};

describe('pushReadingHistory', () => {
  it('puts the latest read first and dedupes by id', () => {
    const first = pushReadingHistory([], sample, '2026-07-27T10:00:00.000Z');
    const second = pushReadingHistory(
      first,
      { ...sample, title: 'Updated title' },
      '2026-07-27T11:00:00.000Z',
    );
    expect(second).toHaveLength(1);
    expect(second[0].title).toBe('Updated title');
    expect(second[0].lastReadAt).toBe('2026-07-27T11:00:00.000Z');
  });

  it('keeps multiple distinct articles', () => {
    let hist = pushReadingHistory([], sample, '2026-07-27T10:00:00.000Z');
    hist = pushReadingHistory(
      hist,
      { ...sample, id: 2, title: 'Other' },
      '2026-07-27T11:00:00.000Z',
    );
    expect(hist.map((h) => h.id)).toEqual([2, 1]);
  });
});

describe('removeFromHistory', () => {
  it('removes by id', () => {
    const hist = pushReadingHistory([], sample);
    expect(removeFromHistory(hist, 1)).toHaveLength(0);
  });
});

describe('normalizeHistory', () => {
  it('filters invalid entries', () => {
    expect(normalizeHistory([{ id: 1 }, sample])).toHaveLength(0);
    expect(
      normalizeHistory([
        { ...sample, lastReadAt: '2026-07-27T10:00:00.000Z' },
        { foo: 1 },
      ]),
    ).toHaveLength(1);
  });
});

describe('formatRelativeReadTime', () => {
  it('formats recent times', () => {
    const now = Date.parse('2026-07-27T12:00:00.000Z');
    expect(formatRelativeReadTime('2026-07-27T11:59:30.000Z', now)).toBe(
      'Just now',
    );
    expect(formatRelativeReadTime('2026-07-27T11:59:00.000Z', now)).toBe(
      '1m ago',
    );
    expect(formatRelativeReadTime('2026-07-27T11:30:00.000Z', now)).toBe(
      '30m ago',
    );
    expect(formatRelativeReadTime('2026-07-27T09:00:00.000Z', now)).toBe(
      '3h ago',
    );
  });
});
