'use client';

import { BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { ArticleImage } from '@/components/article-image';
import { useReadingHistoryContext } from '@/components/reading-history-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeReadTime } from '@/lib/reading-history';
import { CATEGORY_ICONS } from '@/types/article';
import { cn } from '@/lib/utils';

export function ContinueReading() {
  const { lastRead, recent, ready, dismiss, clearAll } = useReadingHistoryContext();

  if (!ready || !lastRead) return null;

  const others = recent.filter((h) => h.id !== lastRead.id).slice(0, 4);
  const icon = CATEGORY_ICONS[lastRead.category];

  return (
    <section
      className="mb-8 rounded-xl border border-naija-green/25 bg-gradient-to-br from-emerald-50/90 to-white p-4 shadow-sm dark:from-emerald-950/40 dark:to-card sm:p-5"
      aria-labelledby="continue-reading-heading"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-naija-green/15 text-naija-green dark:text-emerald-300">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-naija-green dark:text-emerald-300">
              Pick up where you left off
            </p>
            <h2
              id="continue-reading-heading"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              Continue reading
            </h2>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => void clearAll()}
          aria-label="Clear reading history"
        >
          Clear history
        </Button>
      </div>

      {/* Last opened — primary CTA */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <Link
          href={`/article/${lastRead.id}`}
          className="grid gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold sm:grid-cols-[11rem_1fr]"
        >
          <div className="relative h-36 w-full sm:h-full sm:min-h-[8.5rem]">
            <ArticleImage src={lastRead.imageUrl} alt="" fill />
          </div>
          <div className="flex flex-col justify-center gap-2 p-4 sm:pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <span aria-hidden="true">{icon} </span>
                {lastRead.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Read {formatRelativeReadTime(lastRead.lastReadAt)}
              </span>
            </div>
            <h3 className="text-base font-bold leading-snug sm:text-lg">
              {lastRead.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {lastRead.content}
            </p>
            <span className="text-sm font-semibold text-naija-green dark:text-emerald-300">
              Resume story →
            </span>
          </div>
        </Link>
        <button
          type="button"
          className={cn(
            'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full',
            'bg-black/50 text-white hover:bg-black/70 sm:bg-muted sm:text-foreground sm:hover:bg-muted/80',
          )}
          aria-label="Dismiss this story from continue reading"
          onClick={() => void dismiss(lastRead.id)}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {others.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent
          </p>
          <ul className="flex gap-3 overflow-x-auto pb-1">
            {others.map((item) => (
              <li key={item.id} className="w-44 shrink-0 sm:w-52">
                <Link
                  href={`/article/${item.id}`}
                  className="block overflow-hidden rounded-lg border border-border bg-card transition hover:border-naija-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold"
                >
                  <div className="relative h-24 w-full">
                    <ArticleImage src={item.imageUrl} alt="" fill />
                  </div>
                  <div className="space-y-1 p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {formatRelativeReadTime(item.lastReadAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
