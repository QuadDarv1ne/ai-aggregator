'use client';

import { useChatStore } from '@/lib/chat-store';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Enter'], description: 'Отправить сообщение' },
  { keys: ['Shift', 'Enter'], description: 'Новая строка' },
  { keys: ['Ctrl', 'N'], description: 'Новый чат' },
  { keys: ['Ctrl', 'K'], description: 'Веб-поиск' },
  { keys: ['Ctrl', 'Shift', 'I'], description: 'Генерация изображения' },
  { keys: ['Ctrl', 'Shift', 'P'], description: 'Шаблоны промптов' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Настройки чата' },
  { keys: ['Ctrl', 'B'], description: 'Панель навигации' },
  { keys: ['Ctrl', 'D'], description: 'Тёмная/светлая тема' },
];

export function ShortcutsPanel() {
  const { showShortcuts, setShowShortcuts } = useChatStore();

  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Горячие клавиши
          </h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-4 space-y-1">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
            >
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono font-medium min-w-[28px] text-center">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
