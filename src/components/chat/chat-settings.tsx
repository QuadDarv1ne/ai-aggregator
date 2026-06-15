'use client';

import { useChatStore } from '@/lib/chat-store';
import { X, Save, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const DEFAULT_SYSTEM_PROMPTS = [
  { label: 'По умолчанию', value: '' },
  { label: 'Программист', value: 'Ты — опытный программист. Пиши чистый, эффективный код с комментариями. Объясняй свои решения.' },
  { label: 'Аналитик данных', value: 'Ты — аналитик данных. Помогай с анализом данных, визуализацией и статистикой. Используй конкретные примеры и числа.' },
  { label: 'Писатель', value: 'Ты — профессиональный писатель и редактор. Помогай с текстами, улучшай стиль, структуру и грамматику.' },
  { label: 'Учитель', value: 'Ты — терпеливый учитель. Объясняй концепции простым языком, используй аналогии и примеры. Задавай проверочные вопросы.' },
  { label: 'Бизнес-консультант', value: 'Ты — бизнес-консультант с опытом в стратегическом планировании, маркетинге и финансах. Давай практические рекомендации.' },
];

export function ChatSettings() {
  const { showSettings, setShowSettings, getCurrentConversation, updateConversationSystemPrompt } = useChatStore();
  const conversation = getCurrentConversation();
  const [localPrompt, setLocalPrompt] = useState(conversation?.systemPrompt || '');

  if (!showSettings) return null;

  const handleSave = () => {
    if (conversation) {
      updateConversationSystemPrompt(conversation.id, localPrompt);
    }
    setShowSettings(false);
  };

  const handleReset = () => {
    setLocalPrompt('');
    if (conversation) {
      updateConversationSystemPrompt(conversation.id, '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Настройки чата</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Системный промпт
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Задаёт поведение и роль ИИ-ассистента в этом чате
            </p>
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Например: Ты — опытный программист, который помогает писать чистый код..."
              rows={4}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>

          {/* Preset system prompts */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Готовые роли
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SYSTEM_PROMPTS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setLocalPrompt(preset.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    localPrompt === preset.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Сбросить
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              Отмена
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Сохранить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
