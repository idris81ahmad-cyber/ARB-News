import { NextResponse } from 'next/server';
import { loadNews } from '@/lib/articles';
import { createRequestId, newsLog } from '@/lib/news/log';
import { getSourceControl } from '@/lib/source-control/store';

export const revalidate = 60; // 1 minute — fresher “latest” headlines

export async function GET() {
  const requestId = createRequestId();
  const started = Date.now();

  try {
    const result = await loadNews({ requestId });
    const control = getSourceControl();

    newsLog('info', 'GET /api/articles ok', {
      requestId,
      provider: result.source,
      count: result.articles.length,
      dropped: result.droppedByControl ?? 0,
      stale: result.stale ?? false,
      durationMs: Date.now() - started,
    });

    return NextResponse.json(
      {
        articles: result.articles,
        meta: {
          source: result.source,
          fallback: result.fallback,
          stale: result.stale ?? false,
          warning: result.warning ?? null,
          count: result.articles.length,
          fetchedAt: new Date().toISOString(),
          requestId,
          droppedByControl: result.droppedByControl ?? 0,
          sourceStats: result.sourceStats ?? [],
          control: {
            preferTier1Only: control.preferTier1Only,
            minRelevanceScore: control.minRelevanceScore,
            blockedCount: control.blockedSources.length,
            allowedCount: control.allowedSources.length,
            disabledCategories: control.disabledCategories,
          },
        },
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
          'X-Request-Id': requestId,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    newsLog('error', 'GET /api/articles failed', {
      requestId,
      error: message,
      durationMs: Date.now() - started,
    });
    return NextResponse.json(
      {
        articles: [],
        meta: {
          source: 'error',
          fallback: true,
          stale: false,
          warning: message,
          count: 0,
          fetchedAt: new Date().toISOString(),
          requestId,
        },
      },
      {
        status: 502,
        headers: { 'X-Request-Id': requestId },
      },
    );
  }
}
