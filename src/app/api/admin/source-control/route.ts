import { NextResponse } from 'next/server';
import { loadNews } from '@/lib/articles';
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/source-control/auth';
import {
  exportSourceControlEnv,
  getSourceControl,
  resetSourceControl,
  setSourceControl,
} from '@/lib/source-control/store';
import type { SourceControlConfig } from '@/lib/source-control/types';

export async function GET() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin not configured (set ADMIN_SECRET).' },
      { status: 503 },
    );
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getSourceControl();
  const news = await loadNews();

  return NextResponse.json({
    config,
    envExport: exportSourceControlEnv(config),
    feed: {
      provider: news.source,
      count: news.articles.length,
      droppedByControl: news.droppedByControl ?? 0,
      sourceStats: news.sourceStats ?? [],
    },
  });
}

export async function PUT(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin not configured (set ADMIN_SECRET).' },
      { status: 503 },
    );
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<SourceControlConfig> = {};
  try {
    body = (await request.json()) as Partial<SourceControlConfig>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const config = setSourceControl(body);
  const news = await loadNews();

  return NextResponse.json({
    config,
    envExport: exportSourceControlEnv(config),
    feed: {
      provider: news.source,
      count: news.articles.length,
      droppedByControl: news.droppedByControl ?? 0,
      sourceStats: news.sourceStats ?? [],
    },
    note:
      'Runtime config applied on this instance. For cold-start durability on Vercel, set SOURCE_CONTROL_JSON to envExport.',
  });
}

export async function DELETE() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin not configured (set ADMIN_SECRET).' },
      { status: 503 },
    );
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = resetSourceControl();
  return NextResponse.json({
    config,
    envExport: exportSourceControlEnv(config),
    note: 'Runtime overrides cleared. Env SOURCE_CONTROL_JSON (if set) still applies.',
  });
}
