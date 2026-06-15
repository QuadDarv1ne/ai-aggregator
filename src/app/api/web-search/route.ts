import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';

let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { query, num } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const zai = await getZAI();

    const results = await zai.functions.invoke('web_search', {
      query,
      num: num || 8,
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
