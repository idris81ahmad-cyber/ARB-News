import type { Article } from '@/types/article';

/** Domains / names strongly associated with Nigerian coverage. */
const NAIJA_SOURCE_HINTS = [
  'punch',
  'vanguard',
  'guardian.ng',
  'premium times',
  'premiumtimes',
  'thisday',
  'channelstv',
  'channels tv',
  'nairametrics',
  'legit.ng',
  'legit ng',
  'sahara',
  'ripple nigeria',
  'daily trust',
  'the cable',
  'cable.ng',
  'businessday',
  'tribune',
  'sun news',
  'leadership',
  'blueprint',
  'pm news',
  'pmnews',
  'nigerian tribune',
  'tv360',
  'arise news',
  'tvc news',
  'nan news',
  'news agency of nigeria',
  'independent.ng',
  'guardian nigeria',
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
  'buhari',
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

/** Score how Nigeria-relevant an article is (higher = better). */
export function naijaRelevanceScore(article: Article): number {
  const text = `${article.title} ${article.content} ${article.source} ${article.url ?? ''}`.toLowerCase();
  let score = 0;

  if (includesAny(text, NAIJA_SOURCE_HINTS)) score += 5;

  for (const kw of NAIJA_KEYWORDS) {
    if (text.includes(kw)) score += kw === 'nigeria' || kw === 'nigerian' ? 3 : 1;
  }

  // Host ends with .ng
  try {
    if (article.url && new URL(article.url).hostname.endsWith('.ng')) score += 4;
  } catch {
    /* ignore */
  }

  return score;
}

/**
 * Prefer Nigerian stories; drop clearly off-topic global noise when enough
 * Naija hits remain. Falls back to original list if filtering would empty it.
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

  const relevant = ranked.filter((r) => r.score >= minScore).map((r) => r.article);

  if (relevant.length >= minKeep) return relevant;
  if (relevant.length > 0) return relevant;

  // Nothing matched — return date-sorted originals rather than empty feed
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}
