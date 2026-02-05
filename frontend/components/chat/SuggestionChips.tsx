'use client';

import { Lightbulb, Pen, Code, Globe } from 'lucide-react';

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const defaultSuggestions: Suggestion[] = [
  {
    icon: <Pen className="h-4 w-4 text-purple-500" />,
    title: '帮我写一篇文章',
    description: '关于任何话题',
  },
  {
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    title: '给我一些创意灵感',
    description: '头脑风暴助手',
  },
  {
    icon: <Code className="h-4 w-4 text-blue-500" />,
    title: '帮我写代码',
    description: '编程问题解答',
  },
  {
    icon: <Globe className="h-4 w-4 text-green-500" />,
    title: '帮我翻译内容',
    description: '多语言翻译',
  },
];

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-3xl mx-auto">
      {defaultSuggestions.map((suggestion) => (
        <button
          key={suggestion.title}
          onClick={() => onSelect(suggestion.title)}
          className="flex items-start gap-3 rounded-xl border bg-background p-3 text-left hover:bg-accent transition-colors"
        >
          <span className="mt-0.5 shrink-0">{suggestion.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{suggestion.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {suggestion.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
