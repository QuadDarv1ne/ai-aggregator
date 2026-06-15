'use client';

import { useChatStore } from '@/lib/chat-store';
import { AI_PROVIDERS, getModelById } from '@/lib/ai-providers';
import { X, BarChart3, Zap, MessageSquare, TrendingUp } from 'lucide-react';

export function UsageStats() {
  const { showUsageStats, setShowUsageStats, getUsageSummary, conversations } = useChatStore();

  if (!showUsageStats) return null;

  const summary = getUsageSummary();
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.filter((m) => m.role === 'user').length, 0);

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const sortedModels = Object.entries(summary.byModel)
    .sort((a, b) => b[1].totalTokens - a[1].totalTokens);

  const sortedProviders = Object.entries(summary.byProvider)
    .sort((a, b) => b[1].totalTokens - a[1].totalTokens);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Статистика использования
          </h2>
          <button
            onClick={() => setShowUsageStats(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats cards */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Диалогов</span>
              </div>
              <div className="text-2xl font-bold">{totalConversations}</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs">Сообщений</span>
              </div>
              <div className="text-2xl font-bold">{totalMessages}</div>
            </div>
            <div className="rounded-lg border border-border p-3 col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Всего токенов</span>
              </div>
              <div className="text-2xl font-bold">{formatTokens(summary.totalTokens)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Prompt: {formatTokens(summary.promptTokens)} / Completion: {formatTokens(summary.completionTokens)}
              </div>
            </div>
          </div>

          {/* By model */}
          {sortedModels.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">По моделям</h3>
              <div className="space-y-2">
                {sortedModels.map(([modelId, data]) => {
                  const model = getModelById(modelId);
                  const provider = model ? AI_PROVIDERS.find((p) => p.id === model.provider) : undefined;
                  const maxTokens = Math.max(...sortedModels.map(([, d]) => d.totalTokens), 1);
                  const percentage = (data.totalTokens / maxTokens) * 100;

                  return (
                    <div key={modelId} className="flex items-center gap-3">
                      <div className="w-28 shrink-0">
                        <div className="text-xs font-medium truncate">{model?.name || modelId}</div>
                        <div className="text-xs text-muted-foreground">{data.requestCount} запр.</div>
                      </div>
                      <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: provider?.color || '#7c3aed',
                            minWidth: data.totalTokens > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground w-16 text-right">
                        {formatTokens(data.totalTokens)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By provider */}
          {sortedProviders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">По провайдерам</h3>
              <div className="space-y-2">
                {sortedProviders.map(([providerId, data]) => {
                  const provider = AI_PROVIDERS.find((p) => p.id === providerId);
                  return (
                    <div key={providerId} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{provider?.icon}</span>
                        <span className="text-sm font-medium">{provider?.name || providerId}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatTokens(data.totalTokens)}</div>
                        <div className="text-xs text-muted-foreground">{data.requestCount} запросов</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sortedModels.length === 0 && sortedProviders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Пока нет данных об использовании</p>
              <p className="text-xs mt-1">Начните диалог, чтобы увидеть статистику</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
