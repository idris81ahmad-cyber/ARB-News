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

export function getRelatedArticles(
  articles: Article[],
  article: Article,
  limit = 3,
): Article[] {
  const sameCategory = articles.filter(
    (a) => a.id !== article.id && a.category === article.category,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const rest = articles.filter(
    (a) => a.id !== article.id && a.category !== article.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}
