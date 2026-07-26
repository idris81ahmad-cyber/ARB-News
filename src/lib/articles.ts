import { sampleArticles } from '@/data/sample-articles';
import type { Article, CategoryFilter } from '@/types/article';

export async function getArticles(): Promise<Article[]> {
  // Swap for a real CMS/API fetch later.
  return sampleArticles;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const articles = await getArticles();
  return articles.find((a) => a.id === id);
}

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
  return articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, limit);
}
