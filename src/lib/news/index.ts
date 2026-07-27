import { sampleArticles } from '@/data/sample-articles';
import { fetchFromGNews } from '@/lib/news/gnews';
import { createRequestId, newsLog } from '@/lib/news/log';
import { fetchFromNewsApi } from '@/lib/news/newsapi';
import { withRetry } from '@/lib/news/retry';
import { getStaleNews, setStaleNews } from '@/lib/news/stale-cache';
import { applySourceControl } from '@/lib/source-control/apply';
import { getSourceControl } from '@/lib/source-control/store';
import type { SourceStats } from '@/lib/source-control/apply';
import type { Article } from '@/types/article';

export type NewsSource = 'newsapi' | 'gnews' | 'sample' | 'stale';

export interface FetchNewsResult {
  articles: Article[];
  source: NewsSource;
  /** True when live provider failed and sample/stale data was used. */
  fallback: boolean;
  stale?: boolean;
  warning?: string;
  requestId?: string;
  sourceStats?: SourceStats[];
  droppedByControl?: number;
}

function preferredProvider(): 'newsapi' | 'gnews' | 'auto' {
  const control = getSourceControl();
  if (control.preferredProvider) return control.preferredProvider;
  const raw = (process.env.NEWS_PROVIDER ?? 'auto').toLowerCase();
  if (raw === 'newsapi' || raw === 'gnews' || raw === 'auto') return raw;
  return 'auto';
}

function withControl(
  articles: Article[],
  base: Omit<FetchNewsResult, 'articles' | 'sourceStats' | 'droppedByControl'>,
): FetchNewsResult {
  const control = getSourceControl();
  const { articles: next, stats, dropped } = applySourceControl(articles, control);
  return {
    ...base,
    articles: next.length > 0 ? next : articles.slice(0, control.maxArticles || 20),
    sourceStats: stats,
    droppedByControl: dropped,
  };
}

/**
 * Load articles from a configured news CMS/API.
 * Order of resilience: live (retry) → in-memory stale → sample.
 */
export async function fetchNewsArticles(
  opts?: { requestId?: string },
): Promise<FetchNewsResult> {
  const requestId = opts?.requestId ?? createRequestId();
  const started = Date.now();
  const newsApiKey = process.env.NEWS_API_KEY?.trim();
  const gnewsKey = process.env.GNEWS_API_KEY?.trim();
  const provider = preferredProvider();

  const attempts: {
    name: Exclude<NewsSource, 'sample' | 'stale'>;
    run: () => Promise<Article[]>;
  }[] = [];

  if (provider === 'newsapi' || provider === 'auto') {
    if (newsApiKey) {
      attempts.push({
        name: 'newsapi',
        run: () => fetchFromNewsApi(newsApiKey),
      });
    }
  }

  if (provider === 'gnews' || provider === 'auto') {
    if (gnewsKey) {
      attempts.push({
        name: 'gnews',
        run: () => fetchFromGNews(gnewsKey),
      });
    }
  }

  if (attempts.length === 0) {
    newsLog('warn', 'No news API keys configured; using sample articles', {
      requestId,
    });
    return withControl(sampleArticles, {
      source: 'sample',
      fallback: true,
      requestId,
      warning:
        'No news API key configured. Set NEWS_API_KEY or GNEWS_API_KEY. Serving sample articles.',
    });
  }

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const articles = await withRetry(
        attempt.name,
        () => attempt.run(),
        { retries: 2, baseDelayMs: 350, requestId },
      );
      setStaleNews(articles, attempt.name);
      const controlled = withControl(articles, {
        source: attempt.name,
        fallback: false,
        requestId,
      });
      newsLog('info', 'Live news loaded', {
        requestId,
        provider: attempt.name,
        count: controlled.articles.length,
        dropped: controlled.droppedByControl,
        durationMs: Date.now() - started,
      });
      return controlled;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${attempt.name}: ${message}`);
      newsLog('error', 'Provider exhausted retries', {
        requestId,
        provider: attempt.name,
        error: message,
      });
    }
  }

  const stale = getStaleNews();
  if (stale && stale.articles.length > 0) {
    newsLog('warn', 'Serving stale live cache after provider failures', {
      requestId,
      provider: stale.source,
      count: stale.articles.length,
      stale: true,
      durationMs: Date.now() - started,
    });
    return withControl(stale.articles, {
      source: 'stale',
      fallback: true,
      stale: true,
      requestId,
      warning: `Live providers failed (${errors.join(' | ')}). Showing recent cached headlines from ${stale.fetchedAt}.`,
    });
  }

  newsLog('warn', 'Falling back to sample articles', {
    requestId,
    durationMs: Date.now() - started,
    error: errors.join(' | '),
  });

  return withControl(sampleArticles, {
    source: 'sample',
    fallback: true,
    requestId,
    warning: `Live news providers failed (${errors.join(' | ')}). Serving sample articles.`,
  });
}
