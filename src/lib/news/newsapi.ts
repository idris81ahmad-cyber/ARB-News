import type { Article } from '@/types/article';
import { inferCategory } from '@/lib/news/category';
import { stableIdFromString } from '@/lib/news/id';
import { prioritizeNaijaArticles } from '@/lib/news/relevance';

const NEWSAPI_BASE = 'https://newsapi.org/v2';

interface NewsApiArticle {
  source?: { id?: string | null; name?: string | null };
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
}

interface NewsApiResponse {
  status: string;
  code?: string;
  message?: string;
  totalResults?: number;
  articles?: NewsApiArticle[];
}

function cleanText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/\[\+\d+\s+chars\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapNewsApiArticle(raw: NewsApiArticle): Article | null {
  const title = cleanText(raw.title);
  const url = raw.url?.trim();
  if (!title || !url || title === '[Removed]') return null;

  const description = cleanText(raw.description);
  const body = cleanText(raw.content);
  const content =
    [description, body].filter(Boolean).join(' ') ||
    'Full story available at the publisher link.';

  const date = raw.publishedAt
    ? raw.publishedAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const imageUrl =
    raw.urlToImage?.trim() ||
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop';

  return {
    id: stableIdFromString(url),
    title,
    category: inferCategory(`${title} ${content}`, raw.source?.name),
    content,
    imageUrl,
    date,
    source: cleanText(raw.source?.name) || 'NewsAPI',
    url,
  };
}

async function newsApiGet(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<NewsApiArticle[]> {
  const qs = new URLSearchParams({ ...params, apiKey });
  const res = await fetch(`${NEWSAPI_BASE}${path}?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });

  const data = (await res.json()) as NewsApiResponse;

  if (!res.ok || data.status !== 'ok') {
    throw new Error(
      data.message || `NewsAPI error (${res.status}) on ${path}`,
    );
  }

  return data.articles ?? [];
}

/**
 * Fetch Nigerian-focused headlines from NewsAPI.org.
 */
export async function fetchFromNewsApi(apiKey: string): Promise<Article[]> {
  const [headlines, everything] = await Promise.all([
    newsApiGet(
      '/top-headlines',
      { country: 'ng', pageSize: '30' },
      apiKey,
    ).catch(() => [] as NewsApiArticle[]),
    newsApiGet(
      '/everything',
      {
        q: 'Nigeria OR Nigerian OR Lagos OR Abuja OR Naira',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '30',
      },
      apiKey,
    ).catch(() => [] as NewsApiArticle[]),
  ]);

  const merged = [...headlines, ...everything];
  const seen = new Set<string>();
  const articles: Article[] = [];

  for (const raw of merged) {
    const mapped = mapNewsApiArticle(raw);
    if (!mapped || seen.has(mapped.url ?? mapped.title)) continue;
    seen.add(mapped.url ?? mapped.title);
    articles.push(mapped);
  }

  if (articles.length === 0) {
    throw new Error('NewsAPI returned no usable articles');
  }

  return prioritizeNaijaArticles(articles);
}
