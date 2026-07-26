import { filterArticles, getRelatedArticles } from '@/lib/article-helpers';
import { fetchNewsArticles, type FetchNewsResult } from '@/lib/news';
import type { Article } from '@/types/article';

export type { FetchNewsResult };
export { filterArticles, getRelatedArticles };

/** Shared server-side loader used by pages and the API route. */
export async function loadNews(): Promise<FetchNewsResult> {
  return fetchNewsArticles();
}

export async function getArticles(): Promise<Article[]> {
  const { articles } = await loadNews();
  return articles;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const articles = await getArticles();
  return articles.find((a) => a.id === id);
}
