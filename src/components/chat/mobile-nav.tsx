'use client';

import { useChatStore } from '@/lib/chat-store';
import { MessageSquare, Plus, Search, ImagePlus, BarChart3, Keyboard } from 'lucide-react';

export function MobileNav() {
  const {
    createConversation, setShowWebSearch, setShowImageGen,
    setShowUsageStats, setShowShortcuts, conversations,
  } = useChatStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around py-2 px-2">
        <button
          onClick={() => {
            const store = useChatStore.getState();
            store.toggleSidebar();
          }}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px]">Чаты</span>
        </button>
        <button
          onClick={() => createConversation()}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px]">Новый</span>
        </button>
        <button
          onClick={() => setShowWebSearch(true)}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px]">Поиск</span>
        </button>
        <button
          onClick={() => setShowImageGen(true)}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px]">Картинки</span>
        </button>
        <button
          onClick={() => setShowUsageStats(true)}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px]">Стат.</span>
        </button>
      </div>
    </div>
  );
}
