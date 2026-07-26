import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleDetailClient } from '@/components/article-detail-client';
import { getArticleById, getArticles, getRelatedArticles } from '@/lib/articles';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160),
      images: [article.imageUrl],
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
  const related = getRelatedArticles(all, article);

  return <ArticleDetailClient article={article} related={related} />;
}
