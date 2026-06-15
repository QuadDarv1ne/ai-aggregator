'use client';

import { useChatStore } from '@/lib/chat-store';
import {
  Plus, MessageSquare, Trash2, ChevronLeft, Bot, Sparkles,
  LayoutGrid, Download, BarChart3, Settings2, ImagePlus,
  Search, Keyboard, Pin, Tag, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const TAG_OPTIONS = [
  { value: '', label: 'Без тега', color: '' },
  { value: 'work', label: 'Работа', color: '#3b82f6' },
  { value: 'personal', label: 'Личное', color: '#8b5cf6' },
  { value: 'code', label: 'Код', color: '#10b981' },
  { value: 'study', label: 'Учёба', color: '#f59e0b' },
  { value: 'creative', label: 'Творчество', color: '#ec4899' },
];

export function ChatSidebar() {
  const {
    conversations, currentConversationId, createConversation, deleteConversation,
    setCurrentConversation, isSidebarOpen, toggleSidebar, isCompareMode, toggleCompareMode,
    setShowSettings, setShowUsageStats, setShowImageGen, setShowWebSearch, setShowShortcuts,
    exportConversationAsMarkdown, searchQuery, setSearchQuery,
    getFilteredConversations, toggleConversationPin, updateConversationTag,
  } = useChatStore();

  const [tagMenuId, setTagMenuId] = useState<string | null>(null);

  const filteredConversations = getFilteredConversations();
  const pinnedConvs = filteredConversations.filter((c) => c.pinned);
  const regularConvs = filteredConversations.filter((c) => !c.pinned);

  const handleExport = (id: string) => {
    const md = exportConversationAsMarkdown(id);
    if (!md) return;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${id.substring(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTagColor = (tag?: string) => {
    const found = TAG_OPTIONS.find((t) => t.value === tag);
    return found?.color || '';
  };

  const renderConversation = (conv: typeof conversations[0]) => (
    <div
      key={conv.id}
      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
        conv.id === currentConversationId ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground'
      }`}
      onClick={() => setCurrentConversation(conv.id)}
    >
      {conv.pinned && <Pin className="h-3 w-3 shrink-0 text-amber-500" />}
      <MessageSquare className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{conv.title}</span>
      {conv.tag && getTagColor(conv.tag) && (
        <span className="shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: getTagColor(conv.tag) }} />
      )}

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setTagMenuId(tagMenuId === conv.id ? null : conv.id); }}
          className="shrink-0 rounded p-1 hover:bg-primary/10 hover:text-primary transition-all"
          title="Тег"
        >
          <Tag className="h-3 w-3" />
        </button>
        {conv.messages.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleExport(conv.id); }}
            className="shrink-0 rounded p-1 hover:bg-primary/10 hover:text-primary transition-all"
            title="Экспорт"
          >
            <Download className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleConversationPin(conv.id); }}
          className="shrink-0 rounded p-1 hover:bg-amber-500/10 hover:text-amber-500 transition-all"
          title={conv.pinned ? 'Открепить' : 'Закрепить'}
        >
          <Pin className={`h-3 w-3 ${conv.pinned ? 'text-amber-500' : ''}`} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
          className="shrink-0 rounded p-1 hover:bg-destructive/10 hover:text-destructive transition-all"
          title="Удалить"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {tagMenuId === conv.id && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {TAG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { updateConversationTag(conv.id, opt.value); setTagMenuId(null); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors text-left"
            >
              {opt.color ? (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border border-muted-foreground/30" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!isSidebarOpen) {
    return (
      <div className="flex flex-col items-center gap-1.5 border-r border-border bg-muted/20 p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9" title="Открыть панель">
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
        <Separator className="my-1" />
        <Button variant="ghost" size="icon" onClick={() => createConversation()} className="h-9 w-9" title="Новый чат">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant={isCompareMode ? 'default' : 'ghost'} size="icon" onClick={toggleCompareMode} className="h-9 w-9">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowWebSearch(true)} className="h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowImageGen(true)} className="h-9 w-9">
          <ImagePlus className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(true)} className="h-9 w-9">
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-72 flex-col border-r border-border bg-muted/20">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">AI Агрегатор</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => createConversation()}>
          <Plus className="h-4 w-4" /> Новый чат
        </Button>
      </div>

      <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
        <Button variant={isCompareMode ? 'default' : 'outline'} size="sm" className="justify-start gap-1.5 text-xs" onClick={toggleCompareMode}>
          <LayoutGrid className="h-3.5 w-3.5" />{isCompareMode ? 'Сравнение' : 'Сравнить'}
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => setShowWebSearch(true)}>
          <Search className="h-3.5 w-3.5" />Поиск
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => setShowImageGen(true)}>
          <ImagePlus className="h-3.5 w-3.5" />Картинки
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => setShowUsageStats(true)}>
          <BarChart3 className="h-3.5 w-3.5" />Статистика
        </Button>
      </div>

      <Separator />

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск диалогов..."
            className="w-full rounded-md border border-border bg-background pl-8 pr-7 py-1.5 text-xs outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-30" />
              <p>Нет диалогов</p>
              <p className="text-xs mt-1">Ctrl+N — новый чат</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">Ничего не найдено</div>
          ) : (
            <>
              {pinnedConvs.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Pin className="h-3 w-3" /> Закреплённые
                  </div>
                  {pinnedConvs.map(renderConversation)}
                  <Separator className="my-1" />
                </>
              )}
              {regularConvs.map(renderConversation)}
            </>
          )}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>{conversations.length} чатов</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="h-7 w-7">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(true)} className="h-7 w-7">
            <Keyboard className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
