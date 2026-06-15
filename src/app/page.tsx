'use client';

import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatMessages } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { ModelSelector } from '@/components/chat/model-selector';
import { CompareView } from '@/components/chat/compare-view';
import { PromptTemplates } from '@/components/chat/prompt-templates';
import { ChatSettings } from '@/components/chat/chat-settings';
import { UsageStats } from '@/components/chat/usage-stats';
import { ImageGenerator } from '@/components/chat/image-generator';
import { WebSearch } from '@/components/chat/web-search';
import { ShortcutsPanel } from '@/components/chat/shortcuts-panel';
import { MobileNav } from '@/components/chat/mobile-nav';
import { useChatStore } from '@/lib/chat-store';
import { BookOpen, Moon, Sun, Settings2, BarChart3, ImagePlus, Search, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function Home() {
  const {
    isCompareMode,
    showTemplates,
    setShowTemplates,
    setShowSettings,
    setShowUsageStats,
    setShowImageGen,
    setShowWebSearch,
    setShowShortcuts,
    createConversation,
    toggleSidebar,
    selectedModel,
    setSelectedModel,
  } = useChatStore();

  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+N: New chat
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createConversation();
      }

      // Ctrl+K: Web search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowWebSearch(true);
      }

      // Ctrl+Shift+I: Image generation
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setShowImageGen(true);
      }

      // Ctrl+Shift+P: Prompt templates
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowTemplates(true);
      }

      // Ctrl+Shift+S: Chat settings
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettings(true);
      }

      // Ctrl+B: Toggle sidebar
      if (e.ctrlKey && e.key === 'b' && !isTyping) {
        e.preventDefault();
        toggleSidebar();
      }

      // Ctrl+D: Toggle theme
      if (e.ctrlKey && e.key === 'd' && !isTyping) {
        e.preventDefault();
        toggleTheme();
      }

      // Ctrl+/: Shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createConversation, toggleSidebar, setShowWebSearch, setShowImageGen, setShowTemplates, setShowSettings, setShowShortcuts]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-3">
            <ModelSelector />
            {isCompareMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                Режим сравнения
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWebSearch(true)}
              className="h-9 w-9"
              title="Веб-поиск (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageGen(true)}
              className="h-9 w-9"
              title="Генерация изображений (Ctrl+Shift+I)"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUsageStats(true)}
              className="h-9 w-9"
              title="Статистика"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="h-9 w-9"
              title="Настройки (Ctrl+Shift+S)"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTemplates(true)}
              className="h-9 w-9"
              title="Шаблоны (Ctrl+Shift+P)"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              title="Тема (Ctrl+D)"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              className="h-9 w-9"
              title="Горячие клавиши (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat content */}
        {isCompareMode ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <CompareView />
            <ChatInput />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatMessages />
            <ChatInput />
          </div>
        )}
      </div>

      {/* Modals */}
      {showTemplates && <PromptTemplates />}
      <ChatSettings />
      <UsageStats />
      <ImageGenerator />
      <WebSearch />
      <ShortcutsPanel />

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
