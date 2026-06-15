import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  isStreaming?: boolean;
  isError?: boolean;
  editedAt?: string;
  images?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  systemPrompt: string;
  tag?: string;
  pinned?: boolean;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface UsageSummary {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  byProvider: Record<string, { totalTokens: number; requestCount: number }>;
  byModel: Record<string, { totalTokens: number; requestCount: number }>;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  inputText: string;
  selectedModel: string;
  selectedModels: string[];
  isCompareMode: boolean;
  isSidebarOpen: boolean;
  isStreaming: boolean;
  showTemplates: boolean;
  showSettings: boolean;
  showUsageStats: boolean;
  showImageGen: boolean;
  showWebSearch: boolean;
  showShortcuts: boolean;
  searchQuery: string;
  notificationEnabled: boolean;

  // Actions
  setSelectedModel: (model: string) => void;
  setSelectedModels: (models: string[]) => void;
  toggleCompareMode: () => void;
  toggleSidebar: () => void;
  setShowTemplates: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowUsageStats: (show: boolean) => void;
  setShowImageGen: (show: boolean) => void;
  setShowWebSearch: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setInputText: (text: string) => void;
  setSearchQuery: (q: string) => void;
  toggleNotification: () => void;

  createConversation: (systemPrompt?: string) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  updateConversationSystemPrompt: (id: string, systemPrompt: string) => void;
  toggleConversationPin: (id: string) => void;
  updateConversationTag: (id: string, tag: string) => void;
  getCurrentConversation: () => Conversation | undefined;
  getUsageSummary: () => UsageSummary;
  exportConversationAsMarkdown: (id: string) => string;
  getFilteredConversations: () => Conversation[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// localStorage persistence
const STORAGE_KEY = 'ai-aggregator-state';

function loadState(): Partial<ChatState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw);
    return {
      conversations: saved.conversations || [],
      currentConversationId: saved.currentConversationId || null,
      selectedModel: saved.selectedModel || 'glm-4-plus',
      selectedModels: saved.selectedModels || ['glm-4-plus', 'gpt-4o'],
      notificationEnabled: saved.notificationEnabled ?? true,
    };
  } catch {
    return {};
  }
}

function saveState(state: ChatState) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      conversations: state.conversations.map((c) => ({
        ...c,
        messages: c.messages.filter((m) => !m.isStreaming),
      })),
      currentConversationId: state.currentConversationId,
      selectedModel: state.selectedModel,
      selectedModels: state.selectedModels,
      notificationEnabled: state.notificationEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage might be full
  }
}

const loaded = loadState();

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: (loaded.conversations as Conversation[]) || [],
  currentConversationId: (loaded.currentConversationId as string | null) || null,
  inputText: '',
  selectedModel: (loaded.selectedModel as string) || 'glm-4-plus',
  selectedModels: (loaded.selectedModels as string[]) || ['glm-4-plus', 'gpt-4o'],
  isCompareMode: false,
  isSidebarOpen: true,
  isStreaming: false,
  showTemplates: false,
  showSettings: false,
  showUsageStats: false,
  showImageGen: false,
  showWebSearch: false,
  showShortcuts: false,
  searchQuery: '',
  notificationEnabled: (loaded.notificationEnabled as boolean) ?? true,

  setSelectedModel: (model) => { set({ selectedModel: model }); saveState(get()); },
  setSelectedModels: (models) => { set({ selectedModels: models }); saveState(get()); },
  toggleCompareMode: () => set((s) => ({ isCompareMode: !s.isCompareMode })),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setShowTemplates: (show) => set({ showTemplates: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowUsageStats: (show) => set({ showUsageStats: show }),
  setShowImageGen: (show) => set({ showImageGen: show }),
  setShowWebSearch: (show) => set({ showWebSearch: show }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setInputText: (text) => set({ inputText: text }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleNotification: () => {
    set((s) => ({ notificationEnabled: !s.notificationEnabled }));
    saveState(get());
  },

  createConversation: (systemPrompt?: string) => {
    const id = generateId();
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id,
      title: 'Новый чат',
      systemPrompt: systemPrompt || '',
      tag: '',
      pinned: false,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      currentConversationId: id,
    }));
    saveState(get());
    return id;
  },

  deleteConversation: (id) => {
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      currentConversationId:
        s.currentConversationId === id
          ? s.conversations.find((c) => c.id !== id)?.id || null
          : s.currentConversationId,
    }));
    saveState(get());
  },

  setCurrentConversation: (id) => { set({ currentConversationId: id }); saveState(get()); },

  addMessage: (conversationId, message) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    saveState(get());
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            }
          : c
      ),
    }));
    // Save only when streaming ends
    if (!updates.isStreaming) {
      saveState(get());
    }
  },

  deleteMessage: (conversationId, messageId) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
          : c
      ),
    }));
    saveState(get());
  },

  updateConversationTitle: (id, title) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
    saveState(get());
  },

  updateConversationSystemPrompt: (id, systemPrompt) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, systemPrompt } : c
      ),
    }));
    saveState(get());
  },

  toggleConversationPin: (id) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      ),
    }));
    saveState(get());
  },

  updateConversationTag: (id, tag) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, tag } : c
      ),
    }));
    saveState(get());
  },

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return conversations.find((c) => c.id === currentConversationId);
  },

  getUsageSummary: () => {
    const { conversations } = get();
    const summary: UsageSummary = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      byProvider: {},
      byModel: {},
    };
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.role === 'assistant' && msg.totalTokens) {
          summary.totalTokens += msg.totalTokens;
          summary.promptTokens += msg.promptTokens || 0;
          summary.completionTokens += msg.completionTokens || 0;
          if (msg.provider) {
            if (!summary.byProvider[msg.provider]) summary.byProvider[msg.provider] = { totalTokens: 0, requestCount: 0 };
            summary.byProvider[msg.provider].totalTokens += msg.totalTokens;
            summary.byProvider[msg.provider].requestCount += 1;
          }
          if (msg.model) {
            if (!summary.byModel[msg.model]) summary.byModel[msg.model] = { totalTokens: 0, requestCount: 0 };
            summary.byModel[msg.model].totalTokens += msg.totalTokens;
            summary.byModel[msg.model].requestCount += 1;
          }
        }
      }
    }
    return summary;
  },

  getFilteredConversations: () => {
    const { conversations, searchQuery } = get();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return conversations;

    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q)) ||
      (c.tag && c.tag.toLowerCase().includes(q))
    );
  },

  exportConversationAsMarkdown: (id) => {
    const { conversations } = get();
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return '';
    let md = `# ${conv.title}\n\n`;
    md += `_Создано: ${new Date(conv.createdAt).toLocaleString('ru-RU')}_\n\n`;
    if (conv.systemPrompt) md += `## Системный промпт\n\n${conv.systemPrompt}\n\n---\n\n`;
    for (const msg of conv.messages) {
      if (msg.role === 'user') {
        md += `## 👤 Пользователь\n\n${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        const modelInfo = msg.model ? ` (${msg.model})` : '';
        md += `## 🤖 Ассистент${modelInfo}\n\n${msg.content}\n\n`;
        if (msg.totalTokens) md += `> Токенов: ${msg.totalTokens} (prompt: ${msg.promptTokens}, completion: ${msg.completionTokens})\n\n`;
      }
    }
    return md;
  },
}));
