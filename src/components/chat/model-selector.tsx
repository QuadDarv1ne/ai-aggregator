'use client';

import { AI_PROVIDERS, type AIModel, recommendModel } from '@/lib/ai-providers';
import { useChatStore } from '@/lib/chat-store';
import { Check, ChevronDown, Sparkles, Zap, Star, Coins, Wand2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function RatingBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-1.5 w-3 rounded-full"
          style={{
            backgroundColor: i <= value ? color : 'var(--muted)',
            opacity: i <= value ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export function ModelSelector() {
  const { selectedModel, setSelectedModel, isCompareMode, selectedModels, setSelectedModels, inputText } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allModels = AI_PROVIDERS.flatMap((p) =>
    p.models.map((m) => ({ ...m, providerName: p.name, providerColor: p.color, providerIcon: p.icon }))
  );

  const currentModel = allModels.find((m) => m.id === selectedModel);
  const recommendation = inputText.trim() ? recommendModel(inputText) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(model: AIModel & { providerName: string; providerColor: string; providerIcon: string }) {
    if (isCompareMode) {
      const newModels = selectedModels.includes(model.id)
        ? selectedModels.filter((id) => id !== model.id)
        : [...selectedModels, model.id];
      if (newModels.length > 0) setSelectedModels(newModels);
    } else {
      setSelectedModel(model.id);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="max-w-[200px] truncate">
          {isCompareMode
            ? `${selectedModels.length} модели`
            : currentModel?.name || 'Выберите модель'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-96 rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isCompareMode && (
            <div className="mb-2 px-2 py-1.5 text-xs text-muted-foreground">
              Выберите модели для сравнения (мин. 1)
            </div>
          )}

          {/* Recommendation */}
          {!isCompareMode && recommendation && recommendation.id !== selectedModel && inputText.trim() && (
            <div className="mb-2">
              <button
                onClick={() => { setSelectedModel(recommendation.id); setIsOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-left transition-colors hover:bg-amber-500/20"
              >
                <Wand2 className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Рекомендация</div>
                  <div className="text-sm font-semibold">{recommendation.name}</div>
                </div>
                <span className="text-xs text-amber-600/70">{recommendation.tags[0]}</span>
              </button>
            </div>
          )}

          {AI_PROVIDERS.map((provider) => (
            <div key={provider.id}>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{provider.icon}</span>
                <span>{provider.name}</span>
              </div>
              {provider.models.map((model) => {
                const isSelected = isCompareMode
                  ? selectedModels.includes(model.id)
                  : selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() =>
                      handleSelect({
                        ...model,
                        providerName: provider.name,
                        providerColor: provider.color,
                        providerIcon: provider.icon,
                      })
                    }
                    className={`flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{model.name}</span>
                        {model.supportsVision && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded px-1.5 py-0.5">👁</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {model.description}
                      </div>
                      {/* Ratings */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1" title="Скорость">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <RatingBar value={model.speed} color="#eab308" />
                        </div>
                        <div className="flex items-center gap-1" title="Качество">
                          <Star className="h-3 w-3 text-blue-500" />
                          <RatingBar value={model.quality} color="#3b82f6" />
                        </div>
                        <div className="flex items-center gap-1" title="Стоимость">
                          <Coins className="h-3 w-3 text-green-500" />
                          <RatingBar value={model.cost} color="#22c55e" />
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {model.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        <span className="text-[10px] text-muted-foreground/60">
                          {model.maxTokens >= 1000000 ? `${model.maxTokens / 1000000}M` : `${model.maxTokens / 1000}K`} контекст
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
