import { NewsFeed } from '@/components/news-feed';
import { loadNews } from '@/lib/articles';
import type { ArticlesMeta } from '@/hooks/use-articles';

/** Refresh homepage data often so “latest” stays current. */
export const revalidate = 60;

export default async function HomePage() {
  const result = await loadNews();

  const initialMeta: ArticlesMeta = {
    source: result.source,
    fallback: result.fallback,
    stale: result.stale ?? false,
    warning: result.warning ?? null,
    count: result.articles.length,
    fetchedAt: new Date().toISOString(),
    requestId: result.requestId,
    droppedByControl: result.droppedByControl,
  };

  return (
    <NewsFeed
      initialArticles={result.articles}
      initialMeta={initialMeta}
    />
  );
}
