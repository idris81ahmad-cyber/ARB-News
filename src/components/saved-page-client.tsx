'use client';

import { useEffect, useRef } from 'react';
import { ArticleCard } from '@/components/article-card';
import { useSaved } from '@/components/saved-provider';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

export function SavedPageClient() {
  const { savedArticles, clearAll, storageError } = useSaved();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <>
      <SiteHeader showFilters={false} />
      {storageError && (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          role="status"
        >
          {storageError}
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <h2
            ref={headingRef}
            id="main-heading"
            tabIndex={-1}
            className="text-center text-2xl font-bold text-naija-green focus:outline-none dark:text-emerald-300 sm:text-3xl"
          >
            💼 Your Saved Nigerian Stories
          </h2>
          {savedArticles.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => void clearAll()}
              aria-label={`Clear all ${savedArticles.length} saved articles`}
            >
              Clear all
            </Button>
          )}
        </div>

        {savedArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground" role="status">
            No saved articles yet. Explore the news feed to save fascinating stories!
          </p>
        )}
      </div>
    </>
  );
}
