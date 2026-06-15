'use client';

import { useChatStore, type ChatMessage } from '@/lib/chat-store';
import { getModelById, AI_PROVIDERS } from '@/lib/ai-providers';
import { Bot, User, Copy, Check, AlertCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3">
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 text-xs text-zinc-400">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 hover:bg-zinc-800 transition-colors"
        >
          {copied ? (
            <><Check className="h-3 w-3 text-green-400" /> Скопировано</>
          ) : (
            <><Copy className="h-3 w-3" /> Копировать</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '13px',
          padding: '16px',
        }}
        showLineNumbers={true}
        lineNumberStyle={{ color: '#555', minWidth: '2.5em' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words
      prose-p:leading-relaxed prose-p:my-2
      prose-headings:mt-4 prose-headings:mb-2
      prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
      prose-blockquote:border-l-primary prose-blockquote:my-2
      prose-img:rounded-lg prose-img:max-w-full">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match) {
              return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
            }

            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

export function ChatMessageComponent({ message, conversationId }: { message: ChatMessage; conversationId: string }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const { updateMessage, deleteMessage, setInputText, selectedModel, isStreaming } = useChatStore();

  const isUser = message.role === 'user';
  const model = message.model ? getModelById(message.model) : undefined;
  const provider = model ? AI_PROVIDERS.find((p) => p.id === model.provider) : undefined;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    // Find the user message before this assistant message
    const conv = useChatStore.getState().conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const msgIndex = conv.messages.findIndex((m) => m.id === message.id);
    if (msgIndex <= 0) return;

    // Delete this assistant message and re-trigger
    deleteMessage(conversationId, message.id);
    // The user can send again or we auto-resend
    const userMsg = conv.messages[msgIndex - 1];
    if (userMsg && userMsg.role === 'user') {
      setInputText(userMsg.content);
    }
  };

  const handleEditSave = () => {
    if (editText.trim()) {
      updateMessage(conversationId, message.id, {
        content: editText.trim(),
        editedAt: new Date(),
      });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex gap-3 px-4 py-4 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-muted/30'
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">
            {isUser ? 'Вы' : model?.name || 'AI'}
          </span>
          {!isUser && provider && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: provider.color + '20',
                color: provider.color,
              }}
            >
              <span className="text-[10px]">{provider.icon}</span>
              {provider.name}
            </span>
          )}
          {message.isStreaming && <StreamingDots />}
          {message.isError && (
            <span className="inline-flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> Ошибка
            </span>
          )}
          {message.editedAt && (
            <span className="text-xs text-muted-foreground/60 italic">ред.</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={handleEditCancel}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MessageContent content={message.content} />
            )}
          </div>
        )}

        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Generated ${i + 1}`}
                className="rounded-lg max-w-xs max-h-48 object-cover border border-border"
              />
            ))}
          </div>
        )}

        {/* Message actions */}
        {!isEditing && !message.isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 mt-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Скопировано' : 'Копировать'}
            </button>

            {isUser && (
              <button
                onClick={() => { setEditText(message.content); setIsEditing(true); }}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" /> Редактировать
              </button>
            )}

            {!isUser && !message.isError && (
              <button
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Повторить
              </button>
            )}

            {message.isError && (
              <button
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Повторить
              </button>
            )}

            {message.totalTokens ? (
              <span className="text-xs text-muted-foreground ml-2">
                {message.totalTokens} токенов
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  { text: 'Объясни квантовые вычисления простым языком', icon: '🔬' },
  { text: 'Напиши функцию сортировки на Python', icon: '💻' },
  { text: 'Переведи текст на английский', icon: '🌍' },
  { text: 'Помоги с бизнес-планом стартапа', icon: '🚀' },
  { text: 'Составь план изучения программирования', icon: '📚' },
  { text: 'Сгенерируй идеи для мобильного приложения', icon: '💡' },
];

export function ChatMessages() {
  const { getCurrentConversation, setInputText } = useChatStore();
  const conversation = getCurrentConversation();

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-2xl shadow-purple-500/25">
            <Bot className="h-12 w-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-background shadow">
            <span className="text-sm">🟣</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            AI Агрегатор
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">
            Общайтесь с разными ИИ-моделями в одном месте. Переключайте провайдеры, сравнивайте ответы, генерируйте изображения.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {AI_PROVIDERS.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
              style={{ borderColor: p.color + '40', color: p.color }}
            >
              {p.icon} {p.name}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 max-w-lg w-full">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => setInputText(prompt.text)}
              className="rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left flex items-start gap-2"
            >
              <span className="shrink-0 text-base">{prompt.icon}</span>
              <span className="line-clamp-2 text-xs">{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (conversation.messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bot className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Начните диалог</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Выберите модель и задайте вопрос
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 max-w-lg w-full">
          {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => setInputText(prompt.text)}
              className="rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left flex items-start gap-2"
            >
              <span className="shrink-0">{prompt.icon}</span>
              <span className="line-clamp-2 text-xs">{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto chat-scroll">
      {conversation.messages.map((message) => (
        <ChatMessageComponent
          key={message.id}
          message={message}
          conversationId={conversation.id}
        />
      ))}
    </div>
  );
}
