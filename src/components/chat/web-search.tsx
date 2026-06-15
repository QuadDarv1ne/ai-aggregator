'use client';

import { useChatStore } from '@/lib/chat-store';
import { X, Search, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

export function WebSearch() {
  const { showWebSearch, setShowWebSearch, setInputText } = useChatStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!showWebSearch) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch('/api/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), num: 8 }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseResult = (result: SearchResult) => {
    const context = `На основе поиска: ${result.name}\n${result.snippet}\nИсточник: ${result.url}\n\nПроанализируй эту информацию и ответь на мой вопрос: ${query}`;
    setInputText(context);
    setShowWebSearch(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Веб-поиск
          </h2>
          <button
            onClick={() => setShowWebSearch(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 pb-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Поиск в интернете..."
                className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              size="sm"
              className="gap-1.5"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Найти
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto max-h-[55vh] p-4 pt-2 space-y-2">
          {results.length === 0 && !isSearching && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Введите запрос для поиска</p>
              <p className="text-xs mt-1">Результаты можно использовать как контекст для ИИ</p>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Поиск...</p>
            </div>
          )}

          {results.map((result, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors group cursor-pointer"
              onClick={() => handleUseResult(result)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {result.favicon ? (
                    <img src={result.favicon} alt="" className="h-4 w-4 rounded" />
                  ) : (
                    <div className="h-4 w-4 rounded bg-muted flex items-center justify-center text-[8px] font-bold">
                      {result.host_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover:underline">
                      {result.name}
                    </h3>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{result.host_name}</p>
                  <p className="text-xs mt-1 line-clamp-2">{result.snippet}</p>
                </div>
              </div>
            </div>
          ))}

          {results.length > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Нажмите на результат, чтобы использовать его как контекст для ИИ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
