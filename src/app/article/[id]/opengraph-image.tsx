import { ImageResponse } from 'next/og';
import { getArticleById } from '@/lib/articles';
import { OgBrandShell } from '@/lib/og-brand';
import { getSiteUrl } from '@/lib/site';

export const runtime = 'edge';
export const alt = 'ARB News article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArticleOpenGraphImage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  const host = getSiteUrl().replace(/^https?:\/\//, '');

  if (!article) {
    return new ImageResponse(
      (
        <OgBrandShell
          title="Story not found"
          footer={host}
        />
      ),
      { ...size },
    );
  }

  const title =
    article.title.length > 140
      ? `${article.title.slice(0, 137)}…`
      : article.title;

  return new ImageResponse(
    (
      <OgBrandShell
        eyebrow={`${article.category} · ${article.source}`}
        title={title}
        footer={host}
      />
    ),
    { ...size },
  );
}
