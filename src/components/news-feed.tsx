'use client';

import { ArticleCard } from '@/components/article-card';
import { SkeletonGrid } from '@/components/skeleton-grid';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { useArticles } from '@/hooks/use-articles';
import { useSaved } from '@/components/saved-provider';
import { useTheme } from '@/components/theme-provider';

export function NewsFeed() {
  const {
    filteredArticles,
    status,
    error,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    reload,
  } = useArticles();
  const { storageError: savedError } = useSaved();
  const { storageError: themeError } = useTheme();
  const banner = savedError || themeError;

  return (
    <>
      <SiteHeader
        category={category}
        searchQuery={searchQuery}
        onCategoryChange={setCategory}
        onSearchChange={setSearchQuery}
        showFilters
      />
      {banner && (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          role="status"
        >
          {banner}
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2
          id="main-heading"
          tabIndex={-1}
          className="mb-6 text-center text-2xl font-bold text-naija-green dark:text-emerald-300 sm:text-3xl"
        >
          📰 Latest Nigerian Headlines
        </h2>

        {status === 'loading' && <SkeletonGrid count={6} />}

        {status === 'error' && error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950"
            role="alert"
          >
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button type="button" className="mt-4" onClick={() => void reload()}>
              Retry
            </Button>
          </div>
        )}

        {status === 'ready' && filteredArticles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground" role="status">
            {searchQuery.trim()
              ? `No articles match “${searchQuery.trim()}”. Try another search or category.`
              : 'No articles in this category yet.'}
          </p>
        )}

        {status === 'ready' && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
