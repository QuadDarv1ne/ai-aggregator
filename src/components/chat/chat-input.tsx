'use client';

import { useChatStore } from '@/lib/chat-store';
import { AI_PROVIDERS, getModelById } from '@/lib/ai-providers';
import { Send, Square, Sparkles, LayoutGrid } from 'lucide-react';
import { useRef, useEffect, useCallback, FormEvent } from 'react';

export function ChatInput() {
  const {
    getCurrentConversation,
    createConversation,
    addMessage,
    updateMessage,
    selectedModel,
    isCompareMode,
    selectedModels,
    isStreaming,
    setIsStreaming,
    updateConversationTitle,
    inputText,
    setInputText,
  } = useChatStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  // Focus textarea when inputText changes externally (e.g. from templates)
  useEffect(() => {
    if (inputText && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [inputText]);

  const sendMessage = useCallback(
    async (content: string, modelId: string, conversationId: string, messageIdPrefix: string) => {
      const assistantMessageId = messageIdPrefix;
      const model = getModelById(modelId);
      const provider = model?.provider || 'zai';

      addMessage(conversationId, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        provider,
        model: modelId,
        isStreaming: true,
      });

      try {
        const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId);
        const messages = (conversation?.messages || [])
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .filter((m) => m.id !== assistantMessageId)
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // Add system prompt if set
        const systemPrompt = conversation?.systemPrompt;
        const finalMessages = systemPrompt
          ? [{ role: 'system' as const, content: systemPrompt }, ...messages, { role: 'user' as const, content }]
          : [...messages, { role: 'user' as const, content }];

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: finalMessages,
            model: modelId,
            provider,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let fullContent = '';
        let usageData = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Handle UTF-8 correctly per Habr article: use stream: true
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  updateMessage(conversationId, assistantMessageId, {
                    content: fullContent,
                    isStreaming: true,
                  });
                }
                if (data.promptTokens !== undefined) {
                  usageData = {
                    promptTokens: data.promptTokens,
                    completionTokens: data.completionTokens,
                    totalTokens: data.totalTokens,
                  };
                }
                if (data.error) {
                  updateMessage(conversationId, assistantMessageId, {
                    content: `Ошибка: ${data.error}`,
                    isStreaming: false,
                    isError: true,
                  });
                  return;
                }
              } catch {
                // Skip malformed data
              }
            } else if (line.startsWith('event: done')) {
              // Stream complete
            } else if (line.startsWith('event: error')) {
              // Error will be in next data line
            }
          }
        }

        // Finalize message
        updateMessage(conversationId, assistantMessageId, {
          content: fullContent || 'Нет ответа от модели',
          isStreaming: false,
          ...usageData,
        });

        // Auto-generate title from first AI response
        const conv = useChatStore.getState().conversations.find((c) => c.id === conversationId);
        if (conv && conv.title === 'Новый чат' && fullContent) {
          const firstLine = fullContent.split('\n').find((l) => l.trim().length > 0) || '';
          const autoTitle = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
          if (autoTitle.trim()) {
            updateConversationTitle(conversationId, autoTitle.replace(/^#+\s*/, '').trim());
          }
        }

        // Play notification sound if enabled
        const state = useChatStore.getState();
        if (state.notificationEnabled && typeof Audio !== 'undefined') {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.1;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.stop(ctx.currentTime + 0.15);
          } catch { /* ignore */ }
        }

        // Save to DB in background
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            role: 'assistant',
            content: fullContent,
            provider,
            model: modelId,
            ...usageData,
          }),
        }).catch(() => {});
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          updateMessage(conversationId, assistantMessageId, {
            isStreaming: false,
          });
        } else {
          updateMessage(conversationId, assistantMessageId, {
            content: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            isStreaming: false,
            isError: true,
          });
        }
      }
    },
    [addMessage, updateMessage]
  );

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const content = inputText.trim();
    if (!content || isStreaming) return;

    setInputText('');
    setIsStreaming(true);

    let conversationId = useChatStore.getState().currentConversationId;
    if (!conversationId) {
      conversationId = createConversation();
    }

    // Update title based on first message
    const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId);
    if (conversation && conversation.messages.length === 0) {
      const title = content.length > 40 ? content.substring(0, 40) + '...' : content;
      updateConversationTitle(conversationId, title);
    }

    // Add user message
    const userMessageId = `user_${Date.now()}`;
    addMessage(conversationId, {
      id: userMessageId,
      role: 'user',
      content,
    });

    // Save user message to DB
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        role: 'user',
        content,
      }),
    }).catch(() => {});

    if (isCompareMode) {
      for (const modelId of selectedModels) {
        sendMessage(content, modelId, conversationId, `asst_${modelId}_${Date.now()}`);
      }
    } else {
      await sendMessage(content, selectedModel, conversationId, `asst_${Date.now()}`);
    }

    setIsStreaming(false);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentModel = getModelById(selectedModel);

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end rounded-xl border border-border bg-muted/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isCompareMode
                ? `Напишите сообщение для сравнения (${selectedModels.length} моделей)...`
                : `Напишите сообщение для ${currentModel?.name || 'AI'}...`
            }
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground min-h-[48px] max-h-[200px]"
            disabled={isStreaming}
          />

          <div className="flex items-center gap-1 px-2 pb-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                title="Остановить генерацию"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Отправить (Enter)"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isCompareMode ? (
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Сравнение: {selectedModels.map((id) => getModelById(id)?.name).join(', ')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>{currentModel?.name || 'Модель не выбрана'}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>Enter — отправить, Shift+Enter — новая строка</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
