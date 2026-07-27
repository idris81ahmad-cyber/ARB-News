import type { Article, CategoryFilter } from '@/types/article';

export function filterArticles(
  articles: Article[],
  category: CategoryFilter,
  searchQuery: string,
): Article[] {
  const q = searchQuery.trim().toLowerCase();
  return articles.filter((article) => {
    const matchesCategory = category === 'All' || article.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      article.title.toLowerCase().includes(q) ||
      article.content.toLowerCase().includes(q) ||
      article.source.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q)
    );
  });
}

function relatedScore(candidate: Article, seed: Article): number {
  let score = 0;
  if (candidate.category === seed.category) score += 5;
  if (
    candidate.source &&
    seed.source &&
    candidate.source.toLowerCase() === seed.source.toLowerCase()
  ) {
    score += 2;
  }

  const seedTokens = new Set(
    `${seed.title} ${seed.content}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3),
  );
  const candTokens = `${candidate.title} ${candidate.content}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);

  let overlap = 0;
  for (const t of candTokens) {
    if (seedTokens.has(t)) overlap += 1;
  }
  score += Math.min(overlap, 8);
  return score;
}

/** Related stories: same category first, then token/source similarity. */
export function getRelatedArticles(
  articles: Article[],
  article: Article,
  limit = 4,
): Article[] {
  return articles
    .filter((a) => a.id !== article.id)
    .map((a) => ({ a, score: relatedScore(a, article) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return y.a.date.localeCompare(x.a.date);
    })
    .slice(0, limit)
    .map((x) => x.a);
}

/** Escape regex special chars for highlight building. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
