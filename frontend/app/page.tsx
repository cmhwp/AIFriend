'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">AIFriend</CardTitle>
          <CardDescription>
            {user ? `欢迎回来，${user.username}` : '您的AI伙伴'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-6">
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">用户名</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">邮箱</span>
                  <span className="font-medium">{user.email || '未设置'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">注册时间</span>
                  <span className="font-medium">{user.created_at}</span>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                退出登录
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                登录或注册以开始使用
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/login">登录</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">注册</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
