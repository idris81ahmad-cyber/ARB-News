'use client';

import { FilterX, RefreshCw } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { ContinueReading } from '@/components/continue-reading';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { SkeletonGrid } from '@/components/skeleton-grid';
import { SiteHeader } from '@/components/site-header';
import { TopStoriesRail } from '@/components/top-stories-rail';
import { Button } from '@/components/ui/button';
import {
  useArticles,
  type ArticlesMeta,
} from '@/hooks/use-articles';
import { useSaved } from '@/components/saved-provider';
import { useTheme } from '@/components/theme-provider';
import type { Article } from '@/types/article';

interface NewsFeedProps {
  initialArticles?: Article[];
  initialMeta?: ArticlesMeta | null;
}

export function NewsFeed({
  initialArticles,
  initialMeta,
}: NewsFeedProps) {
  const {
    articles,
    visibleArticles,
    topStories,
    filteredCount,
    totalCount,
    hasMore,
    loadMore,
    status,
    error,
    meta,
    category,
    searchQuery,
    debouncedSearch,
    setCategory,
    setSearchQuery,
    clearFilters,
    reload,
  } = useArticles({ initialArticles, initialMeta });
  const { storageError: savedError } = useSaved();
  const { storageError: themeError } = useTheme();
  const banner = savedError || themeError || meta?.warning || null;

  const liveLabel = (() => {
    if (!meta) return null;
    if (meta.stale) return `Cached · ${meta.count} stories`;
    if (!meta.fallback) {
      const when = meta.fetchedAt
        ? ` · updated ${new Date(meta.fetchedAt).toLocaleString()}`
        : '';
      return `Live · ${meta.source} · ${meta.count} stories${when}`;
    }
    return 'Sample data';
  })();

  const hasFilters = category !== 'All' || searchQuery.trim().length > 0;
  const searching = searchQuery !== debouncedSearch;
  const showSkeleton = status === 'loading' && visibleArticles.length === 0;
  const isRefreshing = status === 'refreshing';

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
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-5 text-center sm:mb-6">
          <h2
            id="main-heading"
            tabIndex={-1}
            className="text-xl font-bold text-naija-green dark:text-emerald-300 sm:text-3xl"
          >
            📰 Latest Nigerian Headlines
          </h2>
          {liveLabel && (
            <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
              {liveLabel}
              {isRefreshing ? ' · refreshing…' : ''}
            </p>
          )}
          {(status === 'ready' || status === 'refreshing') && totalCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm" aria-live="polite">
              Showing {visibleArticles.length} of {filteredCount}
              {filteredCount !== totalCount ? ` (filtered from ${totalCount})` : ''}
              {searching ? ' · updating…' : ''}
              {' · '}
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => void reload()}
              >
                Refresh now
              </button>
            </p>
          )}
        </div>

        {showSkeleton && <SkeletonGrid count={6} />}

        {status === 'error' && error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950"
            role="alert"
          >
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button type="button" className="mt-4" onClick={() => void reload()}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              Retry
            </Button>
          </div>
        )}

        {(status === 'ready' || status === 'refreshing') && filteredCount === 0 && (
          <div
            className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm"
            role="status"
          >
            <FilterX
              className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
              aria-hidden
            />
            <h3 className="text-lg font-semibold">No matching stories</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {debouncedSearch.trim()
                ? `Nothing matched “${debouncedSearch.trim()}”${
                    category !== 'All' ? ` in ${category}` : ''
                  }. Try fewer keywords or another category.`
                : category !== 'All'
                  ? `No ${category} stories in the current feed. Try All or refresh.`
                  : 'The feed is empty right now. Try refreshing.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {hasFilters && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
              <Button type="button" onClick={() => void reload()}>
                <RefreshCw className="h-4 w-4" aria-hidden />
                Refresh feed
              </Button>
            </div>
            {articles.length > 0 && hasFilters && (
              <p className="mt-4 text-xs text-muted-foreground">
                {articles.length} stories available with filters cleared.
              </p>
            )}
          </div>
        )}

        {(status === 'ready' || status === 'refreshing') && (
          <ContinueReading />
        )}

        {(status === 'ready' || status === 'refreshing') &&
          visibleArticles.length > 0 && (
          <>
            {!hasFilters && topStories.length > 0 && (
              <TopStoriesRail stories={topStories} />
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  highlightQuery={debouncedSearch}
                />
              ))}
            </div>
            <InfiniteScrollSentinel hasMore={hasMore} onLoadMore={loadMore} />
            {hasMore && (
              <div className="flex justify-center pb-6">
                <Button type="button" variant="outline" onClick={loadMore}>
                  Load more stories
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
