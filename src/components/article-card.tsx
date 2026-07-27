'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ArticleImage } from '@/components/article-image';
import { useSaved } from '@/components/saved-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { estimateReadingTime } from '@/lib/reading-time';
import { CATEGORY_ICONS, type Article } from '@/types/article';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(article.id);
  const minutes = estimateReadingTime(article.content);
  const icon = CATEGORY_ICONS[article.category];

  return (
    <Card className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/article/${article.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold"
        aria-label={`Open article: ${article.title}`}
      >
        <div className="relative h-44 w-full bg-emerald-50 sm:h-48 dark:bg-emerald-950">
          <ArticleImage
            src={article.imageUrl}
            alt=""
            fill
            className="transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="space-y-3 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            <span aria-hidden="true">{icon} </span>
            {article.category}
          </Badge>
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-naija-green underline-offset-2 hover:underline dark:text-emerald-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Original
            </a>
          )}
        </div>
        <Link href={`/article/${article.id}`}>
          <h3 className="text-base font-bold leading-snug sm:text-lg hover:text-naija-green dark:hover:text-emerald-300">
            {article.title}
          </h3>
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {article.content}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {article.source} · {new Date(article.date).toLocaleDateString()} ·{' '}
            {minutes} min read
          </span>
          <Button
            type="button"
            size="sm"
            variant={saved ? 'default' : 'outline'}
            aria-pressed={saved}
            aria-label={
              saved
                ? `Remove ${article.title} from saved`
                : `Save ${article.title}`
            }
            onClick={(e) => {
              e.preventDefault();
              void toggleSave(article);
            }}
          >
            {saved ? '💚 Saved' : '💖 Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
