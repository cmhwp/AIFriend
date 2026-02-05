'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestionChips } from '@/components/chat/SuggestionChips';
import { api } from '@/lib/api';
import { UserInfo } from '@/lib/types';
import { Bot, MessageSquare, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!api.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await api.getUserInfo();
        setUser(userInfo);
      } catch {
        api.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    router.refresh();
  };

  const handleSendMessage = (message: string) => {
    // TODO: Implement chat functionality
    console.log('Send message:', message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          加载中...
        </div>
      </div>
    );
  }

  // Logged in user - ChatGPT style layout
  if (user) {
    return (
      <MainLayout user={user} onLogout={handleLogout}>
        <WelcomeScreen username={user.username} onSendMessage={handleSendMessage} />
      </MainLayout>
    );
  }

  // Logged out user - Landing page
  return (
    <div className="relative min-h-screen bg-background">
      <Header user={null} onLogout={handleLogout} />

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4">
        <div className="py-16 md:py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            遇见你的 <span className="text-primary">AI 伙伴</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-10">
            AIFriend 是你的智能对话伙伴，随时为你提供帮助、陪伴和创意灵感。
          </p>

          {/* Chat input (redirects to login) */}
          <LandingChatInput />

          {/* Quick action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/login">
                <MessageSquare className="h-4 w-4" />
                开始对话
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/register">
                <Sparkles className="h-4 w-4" />
                免费注册
              </Link>
            </Button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4">
        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; 2025 AIFriend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Landing page chat input that redirects to login
function LandingChatInput() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleFocus = () => {
    router.push('/login');
  };

  const handleSuggestionSelect = () => {
    router.push('/login');
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div
        onClick={handleFocus}
        className="cursor-pointer"
      >
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => router.push('/login')}
          placeholder="给 AIFriend 发送消息..."
        />
      </div>
      <SuggestionChips onSelect={handleSuggestionSelect} />
    </div>
  );
}
