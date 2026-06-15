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
    const { prompt, size } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const zai = await getZAI();

    const response = await zai.images.generations.create({
      prompt,
      size: size || '1024x1024',
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 }
    );
  }
}
