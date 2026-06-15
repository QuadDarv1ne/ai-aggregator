import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, role, content, provider, model, promptTokens, completionTokens, totalTokens } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: 'conversationId, role, and content are required' },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        conversationId,
        role,
        content,
        provider: provider || null,
        model: model || null,
        promptTokens: promptTokens || 0,
        completionTokens: completionTokens || 0,
        totalTokens: totalTokens || 0,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
