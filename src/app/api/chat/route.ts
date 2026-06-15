import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Use Node.js runtime so we can use the ZAI SDK properly
export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  provider: string;
}

// Initialize ZAI SDK singleton
let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const { messages, model, provider } = body;

    if (!messages || !model) {
      return new Response(
        JSON.stringify({ error: 'messages and model are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const zai = await getZAI();

    // Call ZAI SDK chat completions with streaming
    const completion = await zai.chat.completions.create({
      model: model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    // If the SDK returns a ReadableStream (streaming mode), pipe it through our transformer
    if (completion && typeof completion === 'object' && 'getReader' in completion) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let buffer = '';

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          // Handle UTF-8 correctly: use stream: true per Habr article advice
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split('\n');
          // Keep incomplete last line in buffer (per Habr article: buffer by \n\n boundaries)
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed === '' || trimmed === 'data: [DONE]') {
              if (trimmed === 'data: [DONE]') {
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
              }
              continue;
            }

            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.slice(6);
                const parsed = JSON.parse(jsonStr);

                const delta = parsed.choices?.[0]?.delta;
                const content = delta?.content || '';

                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `event: token\ndata: ${JSON.stringify({
                        content,
                        provider,
                        model,
                      })}\n\n`
                    )
                  );
                }

                const usage = parsed.usage;
                if (usage) {
                  controller.enqueue(
                    encoder.encode(
                      `event: usage\ndata: ${JSON.stringify({
                        promptTokens: usage.prompt_tokens || 0,
                        completionTokens: usage.completion_tokens || 0,
                        totalTokens: usage.total_tokens || 0,
                        provider,
                        model,
                      })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        },
        flush(controller) {
          // Process remaining buffer
          if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `event: token\ndata: ${JSON.stringify({ content, provider, model })}\n\n`
                    )
                  );
                }
              } catch {
                // Ignore
              }
            }
          }
          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        },
      });

      const readable = completion as unknown as ReadableStream<Uint8Array>;
      const transformedStream = readable.pipeThrough(transformStream);

      return new Response(transformedStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // If streaming not available, return as a single response
    const result = completion as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };
    const content = result?.choices?.[0]?.message?.content || '';
    const usage = result?.usage;

    const encoder = new TextEncoder();
    const singleResponse = new ReadableStream({
      start(controller) {
        if (content) {
          controller.enqueue(
            encoder.encode(
              `event: token\ndata: ${JSON.stringify({ content, provider, model })}\n\n`
            )
          );
        }
        if (usage) {
          controller.enqueue(
            encoder.encode(
              `event: usage\ndata: ${JSON.stringify({
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
                provider,
                model,
              })}\n\n`
            )
          );
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      },
    });

    return new Response(singleResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`
          )
        );
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      },
    });

    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }
}
