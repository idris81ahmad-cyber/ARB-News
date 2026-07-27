import type { Article } from '@/types/article';

/** Premium Nigerian outlets — boost strongly */
const TIER1_SOURCES = [
  'premium times',
  'premiumtimes',
  'the cable',
  'cable.ng',
  'punch',
  'guardian.ng',
  'guardian nigeria',
  'thisday',
  'businessday',
  'channelstv',
  'channels tv',
  'nairametrics',
  'daily trust',
  'arise news',
  'tvc news',
  'news agency of nigeria',
  'nan news',
];

/** Solid local outlets */
const TIER2_SOURCES = [
  'vanguard',
  'tribune',
  'nigerian tribune',
  'leadership',
  'sun news',
  'legit.ng',
  'legit ng',
  'independent.ng',
  'pm news',
  'pmnews',
  'blueprint',
  'ripple nigeria',
  'sahara',
  'tv360',
];

const NAIJA_KEYWORDS = [
  'nigeria',
  'nigerian',
  'naija',
  'lagos',
  'abuja',
  'kano',
  'ibadan',
  'port harcourt',
  'enugu',
  'kaduna',
  'oyo',
  'rivers state',
  'super eagles',
  'naira',
  'cbn',
  'tinubu',
  'nollywood',
  'afrobeats',
  'efcc',
  'inec',
  'asuu',
  'nnpc',
  'niger delta',
  'yoruba',
  'igbo',
  'hausa',
  'calabar',
  'jos',
  'benin city',
  'ondo',
  'anambra',
  'cross river',
];

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function sourceTier(source: string, url?: string): number {
  const s = source.toLowerCase();
  let host = '';
  try {
    if (url) host = new URL(url).hostname.toLowerCase();
  } catch {
    /* ignore */
  }
  const blob = `${s} ${host}`;

  if (includesAny(blob, TIER1_SOURCES)) return 3;
  if (host.endsWith('.ng') || includesAny(blob, TIER2_SOURCES)) return 2;
  return 0;
}

/** Score how Nigeria-relevant + trustworthy an article is. */
export function naijaRelevanceScore(article: Article): number {
  const text =
    `${article.title} ${article.content} ${article.source} ${article.url ?? ''}`.toLowerCase();
  let score = 0;

  const tier = sourceTier(article.source, article.url);
  score += tier * 4; // 0, 8, or 12

  for (const kw of NAIJA_KEYWORDS) {
    if (text.includes(kw)) {
      score += kw === 'nigeria' || kw === 'nigerian' ? 3 : 1;
    }
  }

  // Recency soft boost (ISO date YYYY-MM-DD)
  try {
    const ageDays =
      (Date.now() - new Date(article.date).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 1) score += 3;
    else if (ageDays <= 3) score += 2;
    else if (ageDays <= 7) score += 1;
  } catch {
    /* ignore */
  }

  return score;
}

/** Normalize title for near-duplicate detection. */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|a|an|in|on|of|to|for|and|or|is|are|has|have|as|by|with|from)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleTokenSet(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(' ')
      .filter((t) => t.length > 2),
  );
}

/** Jaccard-like overlap on title tokens. */
function titleSimilarity(a: string, b: string): number {
  const sa = titleTokenSet(a);
  const sb = titleTokenSet(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter += 1;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Drop near-duplicate headlines (same story from multiple outlets).
 * Keeps the higher-scored / earlier item.
 */
export function dedupeNearDuplicates(
  articles: Article[],
  threshold = 0.62,
): Article[] {
  const kept: Article[] = [];

  for (const article of articles) {
    const isDup = kept.some(
      (k) =>
        (article.url && k.url && article.url === k.url) ||
        titleSimilarity(article.title, k.title) >= threshold,
    );
    if (!isDup) kept.push(article);
  }

  return kept;
}

/**
 * Prefer Nigerian + trusted sources; dedupe near-duplicates;
 * drop clearly off-topic global noise when enough Naija hits remain.
 */
export function prioritizeNaijaArticles(
  articles: Article[],
  options?: { minKeep?: number; minScore?: number },
): Article[] {
  const minKeep = options?.minKeep ?? 6;
  const minScore = options?.minScore ?? 1;

  const ranked = [...articles]
    .map((a) => ({ article: a, score: naijaRelevanceScore(a) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.article.date.localeCompare(a.article.date);
    });

  const relevant = ranked
    .filter((r) => r.score >= minScore)
    .map((r) => r.article);

  const pool =
    relevant.length >= minKeep
      ? relevant
      : relevant.length > 0
        ? relevant
        : [...articles].sort((a, b) => b.date.localeCompare(a.date));

  return dedupeNearDuplicates(pool);
}

/**
 * Pick top stories for the home rail:
 * high relevance, prefer tier-1 sources, diverse categories when possible.
 */
export function selectTopStories(
  articles: Article[],
  limit = 5,
): Article[] {
  if (articles.length === 0) return [];

  const ranked = [...articles]
    .map((a) => ({
      article: a,
      score: naijaRelevanceScore(a) + sourceTier(a.source, a.url) * 2,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.article.date.localeCompare(a.article.date);
    });

  const picked: Article[] = [];
  const seenCategories = new Set<string>();

  // First pass: prefer category diversity among strong scores
  for (const row of ranked) {
    if (picked.length >= limit) break;
    if (seenCategories.has(row.article.category) && picked.length < limit - 1) {
      continue;
    }
    picked.push(row.article);
    seenCategories.add(row.article.category);
  }

  // Fill remaining slots with next best
  if (picked.length < limit) {
    for (const row of ranked) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.id === row.article.id)) continue;
      picked.push(row.article);
    }
  }

  return picked;
}
