import { sampleArticles } from '@/data/sample-articles';
import { fetchFromGNews } from '@/lib/news/gnews';
import { createRequestId, newsLog } from '@/lib/news/log';
import { fetchFromNewsApi } from '@/lib/news/newsapi';
import { prioritizeNaijaArticles } from '@/lib/news/relevance';
import { withRetry } from '@/lib/news/retry';
import { fetchFromRss } from '@/lib/news/rss';
import { getStaleNews, setStaleNews } from '@/lib/news/stale-cache';
import { applySourceControl } from '@/lib/source-control/apply';
import { getSourceControl } from '@/lib/source-control/store';
import type { SourceStats } from '@/lib/source-control/apply';
import type { Article } from '@/types/article';

export type NewsSource =
  | 'newsapi'
  | 'gnews'
  | 'rss'
  | 'mixed'
  | 'sample'
  | 'stale';

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

function preferredProvider(): 'newsapi' | 'gnews' | 'rss' | 'auto' {
  const control = getSourceControl();
  if (control.preferredProvider) {
    return control.preferredProvider as 'newsapi' | 'gnews' | 'rss' | 'auto';
  }
  const raw = (process.env.NEWS_PROVIDER ?? 'auto').toLowerCase();
  if (raw === 'newsapi' || raw === 'gnews' || raw === 'rss' || raw === 'auto') {
    return raw;
  }
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

function mergeArticleLists(...lists: Article[][]): Article[] {
  const combined = lists.flat();
  return prioritizeNaijaArticles(combined, { minKeep: 8, minScore: 0 });
}

/**
 * Load articles from RSS + optional NewsAPI/GNews.
 *
 * Strategy (auto):
 * 1. Always try Nigerian RSS feeds (no key)
 * 2. Also try NewsAPI / GNews when keys exist
 * 3. Merge → rank → source-control
 * 4. On total failure → stale cache → sample
 */
export async function fetchNewsArticles(
  opts?: { requestId?: string },
): Promise<FetchNewsResult> {
  const requestId = opts?.requestId ?? createRequestId();
  const started = Date.now();
  const newsApiKey = process.env.NEWS_API_KEY?.trim();
  const gnewsKey = process.env.GNEWS_API_KEY?.trim();
  const provider = preferredProvider();

  const buckets: { name: Exclude<NewsSource, 'sample' | 'stale' | 'mixed'>; articles: Article[] }[] =
    [];
  const errors: string[] = [];

  const runOne = async (
    name: Exclude<NewsSource, 'sample' | 'stale' | 'mixed'>,
    run: () => Promise<Article[]>,
    retries = 2,
  ) => {
    try {
      const articles = await withRetry(name, run, {
        retries,
        baseDelayMs: 300,
        requestId,
      });
      if (articles.length) buckets.push({ name, articles });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${name}: ${message}`);
      newsLog('error', 'Provider exhausted retries', {
        requestId,
        provider: name,
        error: message,
      });
    }
  };

  const tasks: Promise<void>[] = [];

  // Prefer API providers when keys exist (faster + reliable).
  // RSS is fallback-only: many Nigerian feeds return 403 from cloud IPs and
  // slow builds/home SSR to tens of seconds when run on every page render.
  if (provider === 'newsapi' || provider === 'auto') {
    if (newsApiKey) {
      tasks.push(runOne('newsapi', () => fetchFromNewsApi(newsApiKey), 1));
    }
  }

  if (provider === 'gnews' || provider === 'auto') {
    if (gnewsKey) {
      tasks.push(runOne('gnews', () => fetchFromGNews(gnewsKey), 1));
    }
  }

  const hasApiProvider = tasks.length > 0;

  if (provider === 'rss' || (provider === 'auto' && !hasApiProvider)) {
    tasks.push(runOne('rss', () => fetchFromRss(), 0));
  }

  if (tasks.length === 0) {
    newsLog('warn', 'No providers configured; trying RSS', { requestId });
    await runOne('rss', () => fetchFromRss(), 0);
  } else {
    await Promise.all(tasks);
  }

  // If APIs failed and we skipped RSS, try RSS once as last live option
  if (buckets.length === 0 && hasApiProvider && provider === 'auto') {
    newsLog('warn', 'API providers empty; falling back to RSS', { requestId });
    await runOne('rss', () => fetchFromRss(), 0);
  }

  if (buckets.length > 0) {
    const merged = mergeArticleLists(...buckets.map((b) => b.articles));
    const sourceNames = buckets.map((b) => b.name);
    const source: NewsSource =
      sourceNames.length > 1 ? 'mixed' : sourceNames[0] ?? 'rss';

    setStaleNews(merged, source === 'mixed' ? 'rss' : source);

    const controlled = withControl(merged, {
      source,
      fallback: false,
      requestId,
    });

    newsLog('info', 'Live news loaded', {
      requestId,
      provider: source,
      providers: sourceNames.join('+'),
      count: controlled.articles.length,
      dropped: controlled.droppedByControl,
      durationMs: Date.now() - started,
    });

    return controlled;
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
      warning: `Live providers failed (${errors.join(' | ') || 'unknown'}). Showing recent cached headlines from ${stale.fetchedAt}.`,
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
    warning: `Live news providers failed (${errors.join(' | ') || 'none available'}). Serving sample articles.`,
  });
}
