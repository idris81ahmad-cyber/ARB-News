import { NextResponse } from 'next/server';
import { loadNews } from '@/lib/articles';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const result = await loadNews();

    return NextResponse.json(
      {
        articles: result.articles,
        meta: {
          source: result.source,
          fallback: result.fallback,
          warning: result.warning ?? null,
          count: result.articles.length,
          fetchedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/articles]', message);
    return NextResponse.json(
      {
        articles: [],
        meta: {
          source: 'error',
          fallback: true,
          warning: message,
          count: 0,
          fetchedAt: new Date().toISOString(),
        },
      },
      { status: 502 },
    );
  }
}
