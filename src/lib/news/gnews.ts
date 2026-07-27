import type { Article } from '@/types/article';
import { inferCategory } from '@/lib/news/category';
import { stableIdFromString } from '@/lib/news/id';
import { prioritizeNaijaArticles } from '@/lib/news/relevance';

const GNEWS_BASE = 'https://gnews.io/api/v4';

interface GNewsArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string; url?: string };
}

interface GNewsResponse {
  totalArticles?: number;
  articles?: GNewsArticle[];
  errors?: string[] | string;
  message?: string;
}

function cleanText(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

export function mapGNewsArticle(raw: GNewsArticle): Article | null {
  const title = cleanText(raw.title);
  const url = raw.url?.trim();
  if (!title || !url) return null;

  const description = cleanText(raw.description);
  const body = cleanText(raw.content);
  const content =
    [description, body].filter(Boolean).join(' ') ||
    'Full story available at the publisher link.';

  return {
    id: stableIdFromString(url),
    title,
    category: inferCategory(`${title} ${content}`, raw.source?.name),
    content,
    imageUrl:
      raw.image?.trim() ||
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop',
    date: raw.publishedAt
      ? raw.publishedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    source: cleanText(raw.source?.name) || 'GNews',
    url,
  };
}

async function gnewsGet(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<GNewsArticle[]> {
  const qs = new URLSearchParams({ ...params, apikey: apiKey });
  const res = await fetch(`${GNEWS_BASE}${path}?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });

  const data = (await res.json()) as GNewsResponse;

  if (!res.ok) {
    const msg =
      typeof data.errors === 'string'
        ? data.errors
        : Array.isArray(data.errors)
          ? data.errors.join(', ')
          : data.message || `GNews error (${res.status})`;
    throw new Error(msg);
  }

  return data.articles ?? [];
}

/**
 * Naija-first GNews fetch:
 * 1) search query for Nigeria-related terms
 * 2) top-headlines country=ng as supplement
 * then relevance-rank and de-dupe.
 */
export async function fetchFromGNews(apiKey: string): Promise<Article[]> {
  const [searchHits, countryHits] = await Promise.all([
    gnewsGet(
      '/search',
      {
        q: 'Nigeria OR Nigerian OR Lagos OR Abuja OR Naira',
        lang: 'en',
        max: '25',
        sortby: 'publishedAt',
      },
      apiKey,
    ).catch(() => [] as GNewsArticle[]),
    gnewsGet(
      '/top-headlines',
      {
        country: 'ng',
        lang: 'en',
        max: '25',
      },
      apiKey,
    ).catch(() => [] as GNewsArticle[]),
  ]);

  const seen = new Set<string>();
  const articles: Article[] = [];

  for (const raw of [...searchHits, ...countryHits]) {
    const mapped = mapGNewsArticle(raw);
    if (!mapped) continue;
    const key = mapped.url ?? mapped.title;
    if (seen.has(key)) continue;
    seen.add(key);
    articles.push(mapped);
  }

  if (articles.length === 0) {
    throw new Error('GNews returned no usable articles');
  }

  return prioritizeNaijaArticles(articles);
}
