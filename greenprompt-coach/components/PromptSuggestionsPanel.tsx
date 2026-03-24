'use client';

import { useMemo } from 'react';
import { X, Copy } from 'lucide-react';
import { generatePromptVariants, OptimizedPromptVariant } from '@/lib/promptOptimizer';

interface PromptSuggestionsPanelProps {
  input: string;                   // current coach input
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt?: (prompt: string) => void; // when user clicks on one
}

export default function PromptSuggestionsPanel({
  input,
  isOpen,
  onClose,
  onUsePrompt,
}: PromptSuggestionsPanelProps) {
  const variants: OptimizedPromptVariant[] = useMemo(
    () =>
      isOpen && input.trim()
        ? generatePromptVariants(input, { maxLength: 300, includeExamples: true, structured: true })
        : [],
    [input, isOpen],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[hsl(var(--color-card))] border-l border-[hsl(var(--color-border))] shadow-2xl flex flex-col">
      <div className="px-4 py-3 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">Optimized prompts</h2>
          <p className="text-xs text-gray-500 truncate">
            Based on: {input.slice(0, 60) || 'current request'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/5 text-gray-400 hover:text-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {variants.length === 0 && (
          <p className="text-xs text-gray-500 px-1">Type something to see optimized prompts.</p>
        )}

        {variants.map((v) => (
          <div
            key={v.id}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-black/30 p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-100">{v.label}</p>
                <p className="text-[11px] text-gray-500">{v.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(v.prompt).catch(() => {});
                  }}
                  className="p-1 rounded-md hover:bg-white/5 text-gray-400 hover:text-gray-100"
                  title="Copy prompt"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {onUsePrompt && (
                  <button
                    type="button"
                    onClick={() => onUsePrompt(v.prompt)}
                    className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-[11px] text-white"
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] text-gray-200 bg-black/20 rounded-md p-2 max-h-40 overflow-y-auto">
              {v.prompt}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
