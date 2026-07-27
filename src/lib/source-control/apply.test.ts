import { describe, expect, it } from 'vitest';
import { applySourceControl } from '@/lib/source-control/apply';
import { DEFAULT_SOURCE_CONTROL } from '@/lib/source-control/types';
import type { Article } from '@/types/article';

const articles: Article[] = [
  {
    id: 1,
    title: 'Lagos rail plan',
    category: 'Politics',
    content: 'Nigeria infrastructure in Lagos',
    imageUrl: '',
    date: '2026-07-01',
    source: 'Punch Newspapers',
    url: 'https://punchng.com/a',
  },
  {
    id: 2,
    title: 'Mars photo',
    category: 'Environment',
    content: 'NASA space',
    imageUrl: '',
    date: '2026-07-02',
    source: 'Live Science',
    url: 'https://www.livescience.com/b',
  },
  {
    id: 3,
    title: 'Super Eagles win',
    category: 'Sports',
    content: 'AFCON football Nigeria',
    imageUrl: '',
    date: '2026-07-03',
    source: 'Channels TV',
    url: 'https://www.channelstv.com/c',
  },
];

describe('applySourceControl', () => {
  it('blocks sources by substring', () => {
    const { articles: out } = applySourceControl(articles, {
      ...DEFAULT_SOURCE_CONTROL,
      blockedSources: ['live science'],
    });
    expect(out.map((a) => a.id)).not.toContain(2);
    expect(out.length).toBe(2);
  });

  it('disables categories', () => {
    const { articles: out } = applySourceControl(articles, {
      ...DEFAULT_SOURCE_CONTROL,
      disabledCategories: ['Sports'],
    });
    expect(out.every((a) => a.category !== 'Sports')).toBe(true);
  });

  it('allowlists sources', () => {
    const { articles: out } = applySourceControl(articles, {
      ...DEFAULT_SOURCE_CONTROL,
      allowedSources: ['punch'],
    });
    expect(out).toHaveLength(1);
    expect(out[0].source).toContain('Punch');
  });
});
