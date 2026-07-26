'use client';

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
        <div className="relative h-48 w-full bg-emerald-50 dark:bg-emerald-950">
          <ArticleImage
            src={article.imageUrl}
            alt=""
            fill
            className="transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <Badge>
          <span aria-hidden="true">{icon} </span>
          {article.category}
        </Badge>
        <Link href={`/article/${article.id}`}>
          <h3 className="text-lg font-bold leading-snug hover:text-naija-green dark:hover:text-emerald-300">
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
