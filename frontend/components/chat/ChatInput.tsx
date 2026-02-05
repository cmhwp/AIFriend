'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = '给 AIFriend 发送消息...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 4 + 16; // 4 lines + padding
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl border bg-background p-3 shadow-sm',
          'focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring/50',
          'transition-all'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm leading-6 placeholder:text-muted-foreground',
            'focus:outline-none disabled:opacity-50',
            'min-h-[24px] max-h-[112px] py-0.5'
          )}
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={!canSend}
          className="h-8 w-8 shrink-0 rounded-lg"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        AIFriend 可能会犯错，请核实重要信息。
      </p>
    </div>
  );
}
