'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Bot, MessageSquare, Sparkles, User, Mail, Calendar, LogOut, Settings, ChevronRight } from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  created_at: string;
}

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          加载中...
        </div>
      </div>
    );
  }

  // 已登录用户界面
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* 顶部导航 */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">AIFriend</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                欢迎，{user.username}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* 用户信息卡片 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                个人信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <User className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">用户名</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">邮箱</p>
                    <p className="font-medium">{user.email || '未设置'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="w-10 h-10 p-2 rounded-full bg-primary/10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">注册时间</p>
                    <p className="font-medium">{user.created_at}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 功能卡片 */}
          <h2 className="text-xl font-semibold mb-4">快速开始</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  开始对话
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  与你的 AI 伙伴开始一段新的对话
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  探索功能
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  发现 AIFriend 的更多精彩功能
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                  <Settings className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  个人设置
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  自定义你的 AI 伙伴体验
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // 未登录用户界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* 顶部导航 */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">AIFriend</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/register">注册</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <main className="max-w-6xl mx-auto px-4">
        <div className="py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI 驱动的智能伙伴
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            遇见你的
            <span className="text-primary"> AI 伙伴</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AIFriend 是你的智能对话伙伴，随时为你提供帮助、陪伴和创意灵感。
            开启与 AI 的全新交互体验。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/register">
                免费开始
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/login">已有账号？登录</Link>
            </Button>
          </div>
        </div>

        {/* 特性介绍 */}
        <div className="py-16 border-t">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            为什么选择 AIFriend？
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle>自然对话</CardTitle>
                <CardDescription className="text-base">
                  流畅自然的对话体验，就像与真人朋友交流一样轻松愉快
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <CardTitle>智能理解</CardTitle>
                <CardDescription className="text-base">
                  强大的语义理解能力，准确把握你的需求和意图
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>个性定制</CardTitle>
                <CardDescription className="text-base">
                  打造专属于你的 AI 伙伴，满足个性化需求
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="border-t py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AIFriend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
