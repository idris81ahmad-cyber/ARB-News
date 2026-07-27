import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleDetailClient } from '@/components/article-detail-client';
import { getArticleById, getArticles, getRelatedArticles } from '@/lib/articles';
import { getSiteUrl } from '@/lib/site';

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.slice(0, 30).map((a) => ({ id: String(a.id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) return { title: 'Article not found' };

  const description = article.content.slice(0, 160);
  const url = `${getSiteUrl()}/article/${article.id}`;

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description,
      siteName: 'ARB News',
      locale: 'en_NG',
      publishedTime: article.date,
      authors: [article.source],
      tags: [article.category, 'Nigeria', 'news'],
      // File-based opengraph-image.tsx is auto-attached by Next.js
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articleId = Number(id);
  if (Number.isNaN(articleId)) notFound();

  const article = await getArticleById(articleId);
  if (!article) notFound();

  const all = await getArticles();
  const related = getRelatedArticles(all, article, 4);

  return <ArticleDetailClient article={article} related={related} />;
}
