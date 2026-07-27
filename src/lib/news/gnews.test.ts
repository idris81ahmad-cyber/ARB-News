import { describe, expect, it } from 'vitest';
import { mapGNewsArticle } from '@/lib/news/gnews';

describe('mapGNewsArticle', () => {
  it('maps a valid payload', () => {
    const article = mapGNewsArticle({
      title: 'Lagos port expansion approved',
      description: 'Nigeria trade corridor',
      content: 'Federal and state partners...',
      url: 'https://punchng.com/lagos-port',
      image: 'https://example.com/img.jpg',
      publishedAt: '2026-07-20T10:00:00Z',
      source: { name: 'Punch Newspapers' },
    });

    expect(article).not.toBeNull();
    expect(article!.title).toContain('Lagos');
    expect(article!.source).toBe('Punch Newspapers');
    expect(article!.url).toContain('punchng.com');
    expect(article!.id).toBeGreaterThan(0);
  });

  it('returns null without title or url', () => {
    expect(mapGNewsArticle({ title: 'Only title' })).toBeNull();
    expect(mapGNewsArticle({ url: 'https://x.com' })).toBeNull();
  });
});
