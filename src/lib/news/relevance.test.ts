import { describe, expect, it } from 'vitest';
import {
  naijaRelevanceScore,
  prioritizeNaijaArticles,
} from '@/lib/news/relevance';
import type { Article } from '@/types/article';

function article(partial: Partial<Article> & Pick<Article, 'id' | 'title'>): Article {
  return {
    category: 'Politics',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo.jpg',
    date: '2026-07-01',
    source: 'Wire',
    ...partial,
  };
}

describe('naijaRelevanceScore', () => {
  it('scores Nigerian stories higher', () => {
    const naija = article({
      id: 1,
      title: 'Lagos governor unveils new transport plan',
      content: 'Nigeria infrastructure',
      source: 'Punch Newspapers',
      url: 'https://punchng.com/story',
    });
    const global = article({
      id: 2,
      title: 'Mars rover sends new photos',
      content: 'NASA space exploration',
      source: 'Live Science',
      url: 'https://www.livescience.com/space',
    });
    expect(naijaRelevanceScore(naija)).toBeGreaterThan(naijaRelevanceScore(global));
  });
});

describe('prioritizeNaijaArticles', () => {
  it('filters out off-topic stories when enough Naija hits exist', () => {
    const input = [
      article({
        id: 1,
        title: 'Abuja summit on security',
        content: 'Nigerian leaders meet',
        source: 'Premium Times',
        url: 'https://www.premiumtimesng.com/a',
      }),
      article({
        id: 2,
        title: 'Lagos tech conference draws founders',
        content: 'Startups across Nigeria',
        source: 'Nairametrics',
        url: 'https://nairametrics.com/b',
      }),
      article({
        id: 3,
        title: 'Kano market reopens',
        content: 'Traders return after holiday',
        source: 'Daily Trust',
        url: 'https://dailytrust.com/c',
      }),
      article({
        id: 4,
        title: 'Super Eagles train in Uyo',
        content: 'Football camp ahead of AFCON',
        source: 'Channels TV',
        url: 'https://www.channelstv.com/d',
      }),
      article({
        id: 5,
        title: 'Naira fintech rails expand',
        content: 'Business day coverage of banks',
        source: 'BusinessDay',
        url: 'https://businessday.ng/e',
      }),
      article({
        id: 6,
        title: 'Calabar carnival returns',
        content: 'Culture festival in Cross River',
        source: 'Guardian Nigeria',
        url: 'https://guardian.ng/f',
      }),
      article({
        id: 7,
        title: 'Mars photo of the week',
        content: 'NASA anniversary',
        source: 'Live Science',
        url: 'https://www.livescience.com/mars',
      }),
    ];

    const result = prioritizeNaijaArticles(input, { minKeep: 6, minScore: 1 });
    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.some((a) => a.title.includes('Mars'))).toBe(false);
  });
});
