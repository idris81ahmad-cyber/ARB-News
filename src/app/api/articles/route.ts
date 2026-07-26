import { NextResponse } from 'next/server';
import { sampleArticles } from '@/data/sample-articles';

export async function GET() {
  return NextResponse.json({ articles: sampleArticles });
}
