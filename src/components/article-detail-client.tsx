'use client';

import { ExternalLink, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArticleImage } from '@/components/article-image';
import { RelatedArticles } from '@/components/related-articles';
import { useReadingHistoryContext } from '@/components/reading-history-provider';
import { useSaved } from '@/components/saved-provider';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { estimateReadingTime } from '@/lib/reading-time';
import { CATEGORY_ICONS, type Article } from '@/types/article';

async function shareArticle(article: Article): Promise<void> {
  // Prefer ARB article URL so social previews use our OG cards
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/article/${article.id}`
      : article.url || '';
  const payload = {
    title: article.title,
    text: `${article.title} — via ARB News`,
    url,
  };

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return;
    } catch {
      /* cancelled or failed — fall through to clipboard */
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${article.title}\n${url}`);
  }
}

interface ArticleDetailClientProps {
  article: Article;
  related: Article[];
}

export function ArticleDetailClient({ article, related }: ArticleDetailClientProps) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { isSaved, toggleSave } = useSaved();
  const { recordRead } = useReadingHistoryContext();
  const saved = isSaved(article.id);
  const minutes = estimateReadingTime(article.content);
  const icon = CATEGORY_ICONS[article.category];

  useEffect(() => {
    headingRef.current?.focus();
  }, [article.id]);

  useEffect(() => {
    void recordRead(article);
    // Only re-record when the article identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        router.push('/');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return (
    <>
      <SiteHeader showFilters={false} />
      <article className="mx-auto max-w-3xl px-4 py-8">
        <Button
          type="button"
          variant="default"
          className="mb-5"
          onClick={() => router.push('/')}
          aria-label="Back to news feed"
        >
          ← Back to Feed
        </Button>

        <Card className="overflow-hidden">
          <div className="relative h-56 w-full bg-emerald-50 sm:h-80 dark:bg-emerald-950">
            <ArticleImage
              src={article.imageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          <CardContent className="space-y-4 p-5 sm:p-8">
            <Badge variant="gold">
              <span aria-hidden="true">{icon} </span>
              {article.category}
            </Badge>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl font-bold leading-tight focus:outline-none sm:text-4xl"
            >
              {article.title}
            </h1>
            <p className="text-muted-foreground">
              {article.source} · {new Date(article.date).toLocaleDateString()} ·{' '}
              {minutes} min read
            </p>
            <p className="text-base leading-relaxed sm:text-lg">{article.content}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                variant={saved ? 'default' : 'outline'}
                aria-pressed={saved}
                aria-label={saved ? 'Remove article from saved' : 'Save article'}
                onClick={() => void toggleSave(article)}
              >
                {saved ? '💚 Remove from Saved' : '💖 Save Article'}
              </Button>
              <Button
                type="button"
                variant="default"
                aria-label="Share this article"
                onClick={() => void shareArticle(article)}
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Share
              </Button>
              {article.url && (
                <Button asChild variant="gold" className="font-semibold">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Read full story on publisher site"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Read original story
                  </a>
                </Button>
              )}
            </div>

            <RelatedArticles seedTitle={article.title} related={related} />
          </CardContent>
        </Card>
      </article>
    </>
  );
}
