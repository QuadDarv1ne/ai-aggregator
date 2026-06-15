'use client';

import { useChatStore, type ChatMessage } from '@/lib/chat-store';
import { AI_PROVIDERS, getModelById } from '@/lib/ai-providers';
import { Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRef, useEffect } from 'react';

interface CompareColumnProps {
  modelId: string;
  messages: ChatMessage[];
}

function CompareColumn({ modelId, messages }: CompareColumnProps) {
  const model = getModelById(modelId);
  const provider = model ? AI_PROVIDERS.find((p) => p.id === model.provider) : undefined;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Model header */}
      <div
        className="flex items-center gap-2 border-b border-border px-4 py-3"
        style={{ borderBottomColor: provider?.color + '40' }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs"
          style={{ backgroundColor: provider?.color }}
        >
          {provider?.icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{model?.name}</div>
          <div className="text-xs text-muted-foreground">{provider?.name}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
            <Bot className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Ожидание ответа...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`px-4 py-3 ${msg.role === 'assistant' ? 'bg-muted/20' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4 text-amber-500" />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
                <span className="text-xs font-medium">
                  {msg.role === 'assistant' ? model?.name : 'Вы'}
                </span>
                {msg.isStreaming && (
                  <span className="text-xs text-muted-foreground animate-pulse">печатает...</span>
                )}
                {msg.isError && (
                  <span className="inline-flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" /> Ошибка
                  </span>
                )}
              </div>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.totalTokens ? (
                <div className="mt-1 text-xs text-muted-foreground">{msg.totalTokens} токенов</div>
              ) : null}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export function CompareView() {
  const { getCurrentConversation, selectedModels } = useChatStore();
  const conversation = getCurrentConversation();

  if (!conversation) return null;

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-border overflow-hidden">
      {selectedModels.map((modelId) => {
        const messages = conversation.messages.filter(
          (m) => m.role === 'user' || (m.role === 'assistant' && m.model === modelId)
        );
        return <CompareColumn key={modelId} modelId={modelId} messages={messages} />;
      })}
    </div>
  );
}
