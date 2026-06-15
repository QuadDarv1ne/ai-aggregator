'use client';

import { useChatStore } from '@/lib/chat-store';
import { X, ImagePlus, Loader2, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const SIZE_OPTIONS = [
  { label: '1024×1024', value: '1024x1024' },
  { label: '768×1344', value: '768x1344' },
  { label: '1344×768', value: '1344x768' },
  { label: '1152×864', value: '1152x864' },
] as const;

export function ImageGenerator() {
  const { showImageGen, setShowImageGen } = useChatStore();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ image: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!showImageGen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), size }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.image) return;
    const a = document.createElement('a');
    a.href = result.image;
    a.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-violet-500" />
            Генерация изображений
          </h2>
          <button
            onClick={() => setShowImageGen(false)}
            className="rounded-lg p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Описание изображения</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите изображение, которое хотите создать..."
              rows={3}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Размер</label>
            <div className="flex gap-2 flex-wrap">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSize(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    size === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                Сгенерировать
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {result?.image && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border overflow-hidden">
                <img
                  src={result.image}
                  alt="Generated"
                  className="w-full object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Скачать PNG
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
