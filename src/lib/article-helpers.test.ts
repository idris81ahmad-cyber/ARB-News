import { describe, expect, it } from 'vitest';
import {
  escapeRegExp,
  filterArticles,
  getRelatedArticles,
} from '@/lib/article-helpers';
import type { Article } from '@/types/article';

const articles: Article[] = [
  {
    id: 1,
    title: 'Lagos rail expands',
    category: 'Politics',
    content: 'Infrastructure update in Lagos transport corridor',
    imageUrl: '',
    date: '2026-01-01',
    source: 'ARB Desk',
  },
  {
    id: 2,
    title: 'Super Eagles win',
    category: 'Sports',
    content: 'Football victory',
    imageUrl: '',
    date: '2026-01-02',
    source: 'ARB Sports',
  },
  {
    id: 3,
    title: 'Another politics story about Lagos transport',
    category: 'Politics',
    content: 'Senate debate on rail funding in Lagos',
    imageUrl: '',
    date: '2026-01-03',
    source: 'ARB Desk',
  },
  {
    id: 4,
    title: 'Culture festival',
    category: 'Culture',
    content: 'Carnival',
    imageUrl: '',
    date: '2026-01-04',
    source: 'ARB Culture',
  },
];

describe('filterArticles', () => {
  it('filters by category', () => {
    const result = filterArticles(articles, 'Sports', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by search query', () => {
    const result = filterArticles(articles, 'All', 'lagos');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getRelatedArticles', () => {
  it('prefers same category and overlapping terms', () => {
    const related = getRelatedArticles(articles, articles[0], 2);
    expect(related[0].id).toBe(3);
    expect(related.every((a) => a.id !== 1)).toBe(true);
  });
});

describe('escapeRegExp', () => {
  it('escapes special characters', () => {
    expect(escapeRegExp('a+b')).toBe('a\\+b');
  });
});
