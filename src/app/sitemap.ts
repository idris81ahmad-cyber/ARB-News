import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/articles';
import { getSiteUrl } from '@/lib/site';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${base}/saved`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];

  try {
    const articles = await getArticles();
    const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${base}/article/${a.id}`,
      lastModified: a.date ? new Date(a.date) : now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
