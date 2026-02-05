'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { SuggestionChips } from './SuggestionChips';

interface WelcomeScreenProps {
  username?: string;
  onSendMessage: (message: string) => void;
}

export function WelcomeScreen({ username, onSendMessage }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionSelect = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-center">
          {username ? `你好，${username}` : 'AIFriend'}
        </h1>
        <p className="text-muted-foreground text-center mt-1">
          有什么可以帮你的？
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="给 AIFriend 发送消息..."
        />

        <div className="pt-2">
          <SuggestionChips onSelect={handleSuggestionSelect} />
        </div>
      </div>
    </div>
  );
}
