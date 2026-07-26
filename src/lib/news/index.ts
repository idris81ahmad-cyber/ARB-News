import { sampleArticles } from '@/data/sample-articles';
import { fetchFromGNews } from '@/lib/news/gnews';
import { fetchFromNewsApi } from '@/lib/news/newsapi';
import type { Article } from '@/types/article';

export type NewsSource = 'newsapi' | 'gnews' | 'sample';

export interface FetchNewsResult {
  articles: Article[];
  source: NewsSource;
  /** True when live provider failed and sample data was used. */
  fallback: boolean;
  warning?: string;
}

function preferredProvider(): 'newsapi' | 'gnews' | 'auto' {
  const raw = (process.env.NEWS_PROVIDER ?? 'auto').toLowerCase();
  if (raw === 'newsapi' || raw === 'gnews' || raw === 'auto') return raw;
  return 'auto';
}

/**
 * Load articles from a configured news CMS/API, with sample fallback.
 *
 * Env:
 * - NEWS_API_KEY   → NewsAPI.org (preferred default)
 * - GNEWS_API_KEY  → GNews.io
 * - NEWS_PROVIDER  → auto | newsapi | gnews
 */
export async function fetchNewsArticles(): Promise<FetchNewsResult> {
  const newsApiKey = process.env.NEWS_API_KEY?.trim();
  const gnewsKey = process.env.GNEWS_API_KEY?.trim();
  const provider = preferredProvider();

  const attempts: { name: NewsSource; run: () => Promise<Article[]> }[] = [];

  if (provider === 'newsapi' || provider === 'auto') {
    if (newsApiKey) {
      attempts.push({ name: 'newsapi', run: () => fetchFromNewsApi(newsApiKey) });
    }
  }

  if (provider === 'gnews' || provider === 'auto') {
    if (gnewsKey) {
      attempts.push({ name: 'gnews', run: () => fetchFromGNews(gnewsKey) });
    }
  }

  // If user forced a provider but key is missing, surface a clear warning via fallback.
  if (attempts.length === 0) {
    return {
      articles: sampleArticles,
      source: 'sample',
      fallback: true,
      warning:
        'No news API key configured. Set NEWS_API_KEY (NewsAPI.org) or GNEWS_API_KEY in .env.local. Serving sample articles.',
    };
  }

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const articles = await attempt.run();
      return {
        articles,
        source: attempt.name,
        fallback: false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${attempt.name}: ${message}`);
      console.error(`[news] ${attempt.name} failed:`, message);
    }
  }

  return {
    articles: sampleArticles,
    source: 'sample',
    fallback: true,
    warning: `Live news providers failed (${errors.join(' | ')}). Serving sample articles.`,
  };
}
