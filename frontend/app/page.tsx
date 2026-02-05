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
import { Bot, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-background">
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

        {/* Features section */}
        <div className="py-16 border-t">
          <h2 className="text-2xl font-bold text-center mb-10">
            为什么选择 AIFriend？
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-none bg-muted/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">自然对话</CardTitle>
                <CardDescription>
                  流畅自然的对话体验，就像与真人朋友交流一样轻松愉快
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-none bg-muted/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">智能理解</CardTitle>
                <CardDescription>
                  强大的语义理解能力，准确把握你的需求和意图
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-none bg-muted/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                  <Bot className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">个性定制</CardTitle>
                <CardDescription>
                  打造专属于你的 AI 伙伴，满足个性化需求
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA section */}
        <div className="py-16 border-t text-center">
          <h2 className="text-2xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-muted-foreground mb-6">
            立即注册，开启你的 AI 伙伴之旅
          </p>
          <Button size="lg" asChild className="text-lg px-8">
            <Link href="/register">
              免费开始
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
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
