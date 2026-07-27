import { naijaRelevanceScore } from '@/lib/news/relevance';
import type { SourceControlConfig } from '@/lib/source-control/types';
import type { Article } from '@/types/article';

const TIER1_HINTS = [
  'premium times',
  'the cable',
  'punch',
  'guardian',
  'businessday',
  'channels',
  'nairametrics',
  'daily trust',
  'thisday',
  'arise',
  'tvc',
];

function matchesAny(haystack: string, needles: string[]): boolean {
  if (needles.length === 0) return false;
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function sourceBlob(article: Article): string {
  return `${article.source} ${article.url ?? ''}`.toLowerCase();
}

function isTier1(article: Article): boolean {
  return matchesAny(sourceBlob(article), TIER1_HINTS);
}

export interface SourceStats {
  name: string;
  count: number;
  blocked: boolean;
}

/** Apply admin source-control rules to a fetched article list. */
export function applySourceControl(
  articles: Article[],
  config: SourceControlConfig,
): { articles: Article[]; stats: SourceStats[]; dropped: number } {
  const before = articles.length;

  let filtered = articles.filter((a) => {
    const blob = sourceBlob(a);

    if (matchesAny(blob, config.blockedSources)) return false;

    if (config.allowedSources.length > 0 && !matchesAny(blob, config.allowedSources)) {
      return false;
    }

    if (config.disabledCategories.includes(a.category)) return false;

    if (
      config.minRelevanceScore > 0 &&
      naijaRelevanceScore(a) < config.minRelevanceScore
    ) {
      return false;
    }

    if (config.preferTier1Only && !isTier1(a)) return false;

    return true;
  });

  // Sort by relevance then date
  filtered = [...filtered].sort((a, b) => {
    const rs = naijaRelevanceScore(b) - naijaRelevanceScore(a);
    if (rs !== 0) return rs;
    return b.date.localeCompare(a.date);
  });

  if (config.maxArticles > 0) {
    filtered = filtered.slice(0, config.maxArticles);
  }

  const counts = new Map<string, number>();
  for (const a of articles) {
    const name = a.source || 'Unknown';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const stats: SourceStats[] = [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      blocked: matchesAny(name, config.blockedSources),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    articles: filtered,
    stats,
    dropped: Math.max(0, before - filtered.length),
  };
}
