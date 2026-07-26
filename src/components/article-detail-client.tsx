'use client';

import { Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArticleImage } from '@/components/article-image';
import { useSaved } from '@/components/saved-provider';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { estimateReadingTime } from '@/lib/reading-time';
import { CATEGORY_ICONS, type Article } from '@/types/article';

async function shareArticle(article: Article): Promise<void> {
  const url = typeof window !== 'undefined' ? window.location.href : '';
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
      /* cancelled */
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
  const saved = isSaved(article.id);
  const minutes = estimateReadingTime(article.content);
  const icon = CATEGORY_ICONS[article.category];

  useEffect(() => {
    headingRef.current?.focus();
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
            </div>

            {related.length > 0 && (
              <section
                className="mt-8 border-t border-border pt-6"
                aria-labelledby="related-heading"
              >
                <h2
                  id="related-heading"
                  className="mb-3 text-lg font-semibold text-naija-green dark:text-emerald-300"
                >
                  Related in {article.category}
                </h2>
                <ul className="space-y-2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/article/${item.id}`}
                        className="block rounded-md border-l-4 border-naija-gold bg-emerald-50/70 px-3 py-2.5 text-sm font-medium hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/40"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </CardContent>
        </Card>
      </article>
    </>
  );
}
