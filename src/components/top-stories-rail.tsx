'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { ArticleImage } from '@/components/article-image';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_ICONS, type Article } from '@/types/article';
import { cn } from '@/lib/utils';

interface TopStoriesRailProps {
  stories: Article[];
}

export function TopStoriesRail({ stories }: TopStoriesRailProps) {
  if (!stories.length) return null;

  const [hero, ...rest] = stories;

  return (
    <section
      className="mb-8"
      aria-labelledby="top-stories-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-naija-gold/20 text-naija-gold">
          <Flame className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-naija-gold">
            Editor&apos;s picks
          </p>
          <h2
            id="top-stories-heading"
            className="text-lg font-bold text-naija-green dark:text-emerald-300 sm:text-xl"
          >
            Top stories
          </h2>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Hero */}
        <Link
          href={`/article/${hero.id}`}
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
            'lg:col-span-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold',
          )}
          aria-label={`Top story: ${hero.title}`}
        >
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <ArticleImage
              src={hero.imageUrl}
              alt=""
              fill
              priority
              className="transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:p-5">
              <Badge variant="gold" className="text-[0.7rem]">
                <span aria-hidden>{CATEGORY_ICONS[hero.category]} </span>
                {hero.category}
              </Badge>
              <h3 className="text-lg font-bold leading-snug text-white sm:text-2xl">
                {hero.title}
              </h3>
              <p className="text-xs text-white/80 sm:text-sm">
                {hero.source} · {new Date(hero.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>

        {/* Side list */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {rest.map((item, idx) => (
            <Link
              key={item.id}
              href={`/article/${item.id}`}
              className={cn(
                'group flex gap-3 overflow-hidden rounded-xl border border-border bg-card p-2.5 shadow-sm transition',
                'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold',
              )}
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-28">
                <ArticleImage src={item.imageUrl} alt="" fill />
                <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-naija-gold text-[0.65rem] font-bold text-neutral-900">
                  {idx + 2}
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1 py-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-naija-green dark:text-emerald-300">
                  {CATEGORY_ICONS[item.category]} {item.category}
                </p>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-naija-green dark:group-hover:text-emerald-300">
                  {item.title}
                </h3>
                <p className="text-[0.7rem] text-muted-foreground">
                  {item.source}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
