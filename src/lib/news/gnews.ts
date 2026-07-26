import type { Article } from '@/types/article';
import { inferCategory } from '@/lib/news/category';
import { stableIdFromString } from '@/lib/news/id';

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

function mapGNewsArticle(raw: GNewsArticle): Article | null {
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

/** Optional GNews.io provider (set GNEWS_API_KEY). */
export async function fetchFromGNews(apiKey: string): Promise<Article[]> {
  const qs = new URLSearchParams({
    country: 'ng',
    lang: 'en',
    max: '30',
    apikey: apiKey,
  });

  const res = await fetch(`${GNEWS_BASE}/top-headlines?${qs.toString()}`, {
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

  const articles = (data.articles ?? [])
    .map(mapGNewsArticle)
    .filter((a): a is Article => a !== null);

  if (articles.length === 0) {
    throw new Error('GNews returned no usable articles');
  }

  articles.sort((a, b) => b.date.localeCompare(a.date));
  return articles;
}
