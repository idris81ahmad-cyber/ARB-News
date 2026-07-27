import Link from 'next/link';
import { ArticleImage } from '@/components/article-image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_ICONS, type Article } from '@/types/article';

interface RelatedArticlesProps {
  seedTitle: string;
  related: Article[];
}

export function RelatedArticles({ seedTitle, related }: RelatedArticlesProps) {
  if (related.length === 0) return null;

  return (
    <section
      className="mt-10 border-t-2 border-naija-gold/60 pt-8"
      aria-labelledby="related-heading"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-naija-gold">
          Keep reading
        </p>
        <h2
          id="related-heading"
          className="text-xl font-bold text-naija-green dark:text-emerald-300 sm:text-2xl"
        >
          Related stories
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          More coverage connected to “{seedTitle.slice(0, 72)}
          {seedTitle.length > 72 ? '…' : ''}”
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {related.map((item) => {
          const icon = CATEGORY_ICONS[item.category];
          return (
            <Card
              key={item.id}
              className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link
                href={`/article/${item.id}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold"
              >
                <div className="relative h-36 w-full">
                  <ArticleImage src={item.imageUrl} alt="" fill />
                </div>
                <CardContent className="space-y-2 p-3.5">
                  <Badge className="text-[0.7rem]">
                    <span aria-hidden="true">{icon} </span>
                    {item.category}
                  </Badge>
                  <h3 className="text-sm font-bold leading-snug sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.source} · {new Date(item.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
