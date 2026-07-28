import type { Article } from '@/types/article';
import { inferCategory } from '@/lib/news/category';
import { stableIdFromString } from '@/lib/news/id';
import { prioritizeNaijaArticles } from '@/lib/news/relevance';

export type RssFeed = {
  name: string;
  url: string;
};

/** Curated Nigerian publisher feeds — no API key required. */
export const NAIJA_RSS_FEEDS: RssFeed[] = [
  { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed' },
  { name: 'Punch', url: 'https://punchng.com/feed/' },
  { name: 'The Cable', url: 'https://www.thecable.ng/feed' },
  { name: 'Guardian Nigeria', url: 'https://guardian.ng/feed/' },
  { name: 'Vanguard', url: 'https://www.vanguardngr.com/feed/' },
  { name: 'Daily Trust', url: 'https://dailytrust.com/feed/' },
  { name: 'BusinessDay', url: 'https://businessday.ng/feed/' },
  { name: 'Nairametrics', url: 'https://nairametrics.com/feed/' },
];

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    );
}

function stripHtml(input: string): string {
  return decodeEntities(input)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagContent(block: string, tag: string): string {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    'i',
  );
  const m = block.match(re);
  return m ? decodeEntities(m[1].trim()) : '';
}

function attrFromTag(block: string, tag: string, attr: string): string {
  const re = new RegExp(
    `<${tag}[^>]*\\b${attr}=["']([^"']+)["'][^>]*/?>`,
    'i',
  );
  const m = block.match(re);
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractLink(block: string): string {
  // RSS: <link>url</link>
  const rss = tagContent(block, 'link');
  if (rss && /^https?:\/\//i.test(rss)) return rss.trim();

  // Atom: <link href="..." />
  const href = attrFromTag(block, 'link', 'href');
  if (href && /^https?:\/\//i.test(href)) return href.trim();

  // GUID sometimes is the permalink
  const guid = tagContent(block, 'guid');
  if (guid && /^https?:\/\//i.test(guid)) return guid.trim();

  return '';
}

function extractImage(block: string): string {
  const media =
    attrFromTag(block, 'media:content', 'url') ||
    attrFromTag(block, 'media:thumbnail', 'url') ||
    attrFromTag(block, 'enclosure', 'url');
  if (media && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(media)) return media;

  // First <img src> inside description/content
  const html =
    tagContent(block, 'content:encoded') ||
    tagContent(block, 'description') ||
    tagContent(block, 'content') ||
    '';
  const img = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img?.[1]) return decodeEntities(img[1].trim());

  return '';
}

function extractDate(block: string): string {
  const raw =
    tagContent(block, 'pubDate') ||
    tagContent(block, 'published') ||
    tagContent(block, 'updated') ||
    tagContent(block, 'dc:date');
  if (!raw) return new Date().toISOString().slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function splitItems(xml: string): string[] {
  const items: string[] = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const entryRe = /<entry[\s\S]*?<\/entry>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) items.push(m[0]);
  while ((m = entryRe.exec(xml))) items.push(m[0]);
  return items;
}

export function mapRssItem(
  block: string,
  feedName: string,
): Article | null {
  const title = stripHtml(tagContent(block, 'title'));
  const url = extractLink(block);
  if (!title || !url) return null;

  const rawBody =
    tagContent(block, 'content:encoded') ||
    tagContent(block, 'description') ||
    tagContent(block, 'summary') ||
    tagContent(block, 'content') ||
    '';
  const content =
    stripHtml(rawBody) || 'Full story available at the publisher link.';

  const imageUrl =
    extractImage(block) ||
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop';

  return {
    id: stableIdFromString(url),
    title,
    category: inferCategory(`${title} ${content}`, feedName),
    content: content.slice(0, 1200),
    imageUrl,
    date: extractDate(block),
    source: feedName,
    url,
  };
}

async function fetchFeed(feed: RssFeed): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(feed.url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'ARB-News/2.1 (+https://github.com/idris81ahmad-cyber/ARB-News)',
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`${feed.name} HTTP ${res.status}`);
    }

    const xml = await res.text();
    const blocks = splitItems(xml);
    const articles: Article[] = [];

    for (const block of blocks) {
      const mapped = mapRssItem(block, feed.name);
      if (mapped) articles.push(mapped);
    }

    return articles;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch latest stories from Nigerian publisher RSS feeds.
 * No API key required. Individual feed failures are ignored.
 */
export async function fetchFromRss(
  feeds: RssFeed[] = NAIJA_RSS_FEEDS,
): Promise<Article[]> {
  const results = await Promise.allSettled(feeds.map((f) => fetchFeed(f)));

  const merged: Article[] = [];
  const errors: string[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      merged.push(...r.value);
    } else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      errors.push(`${feeds[i]?.name}: ${msg}`);
    }
  });

  if (merged.length === 0) {
    throw new Error(
      errors.length
        ? `All RSS feeds failed (${errors.join(' | ')})`
        : 'RSS feeds returned no articles',
    );
  }

  if (errors.length) {
    console.warn('[rss] partial feed failures:', errors.join(' | '));
  }

  return prioritizeNaijaArticles(merged, { minKeep: 8, minScore: 1 });
}
