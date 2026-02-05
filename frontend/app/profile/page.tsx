'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MainLayout } from '@/components/layout/MainLayout';
import { api, API_BASE_URL } from '@/lib/api';
import { UserInfo } from '@/lib/types';
import { Calendar, Eye, EyeOff, User } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Basic info state
  const [basicForm, setBasicForm] = useState({ username: '', email: '' });
  const [basicError, setBasicError] = useState('');
  const [basicSuccess, setBasicSuccess] = useState('');
  const [basicSaving, setBasicSaving] = useState(false);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!api.isAuthenticated()) {
        router.replace('/login');
        return;
      }

      try {
        const userInfo = await api.getUserInfo();
        setUser(userInfo);
      } catch {
        api.clearTokens();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      setBasicForm({ username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleLogout = () => {
    api.logout();
    router.push('/');
  };

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`
    : '';

  // --- Basic Info ---
  const handleBasicSave = async () => {
    if (!user) return;
    setBasicError('');
    setBasicSuccess('');

    const username = basicForm.username.trim();
    const email = basicForm.email.trim();

    if (!username) {
      setBasicError('用户名不能为空');
      return;
    }

    const updates: { username?: string; email?: string } = {};
    if (username !== user.username) updates.username = username;
    if (email !== (user.email || '')) updates.email = email;

    if (Object.keys(updates).length === 0) {
      setBasicError('没有需要更新的数据');
      return;
    }

    setBasicSaving(true);
    try {
      const response = await api.updateUserInfo(updates);
      if (typeof response.code === 'number' && response.code !== 0) {
        setBasicError(response.message || '更新失败');
        return;
      }
      try {
        const userInfo = await api.getUserInfo();
        setUser(userInfo);
      } catch {
        setUser((prev) => prev ? { ...prev, ...updates, email: updates.email ?? prev.email } : prev);
      }
      setBasicSuccess('保存成功');
    } catch (err) {
      setBasicError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setBasicSaving(false);
    }
  };

  // --- Avatar ---
  const maxAvatarSize = 2 * 1024 * 1024;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }
    if (file.size > maxAvatarSize) {
      setAvatarError('头像大小不能超过 2MB');
      event.target.value = '';
      return;
    }
    setAvatarError('');
    setAvatarSuccess('');
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarError('');
    setAvatarSuccess('');
    setAvatarUploading(true);

    try {
      const resp = await api.uploadAvatar(avatarFile);
      if (typeof resp.code === 'number' && resp.code !== 0) {
        setAvatarError(resp.message || '上传失败');
        return;
      }
      try {
        const userInfo = await api.getUserInfo();
        setUser(userInfo);
      } catch { /* ignore */ }
      setAvatarSuccess('头像上传成功');
      setAvatarFile(null);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  // --- Password ---
  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.oldPassword) {
      setPasswordError('请输入当前密码');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('请输入新密码');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度不能少于 6 位');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await api.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      if (typeof response.code === 'number' && response.code !== 0) {
        setPasswordError(response.message || '修改失败');
        return;
      }
      setPasswordSuccess('密码修改成功');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '修改失败');
    } finally {
      setPasswordSaving(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">个人资料</h1>

        <Tabs defaultValue="basic-info">
          <TabsList className="mb-6">
            <TabsTrigger value="basic-info">基本信息</TabsTrigger>
            <TabsTrigger value="avatar">头像</TabsTrigger>
            <TabsTrigger value="password">修改密码</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {basicError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
                    {basicError}
                  </div>
                )}
                {basicSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-900">
                    {basicSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="profile-username">用户名</Label>
                  <Input
                    id="profile-username"
                    type="text"
                    placeholder="请输入用户名"
                    value={basicForm.username}
                    onChange={(e) => {
                      setBasicForm((prev) => ({ ...prev, username: e.target.value }));
                      setBasicError('');
                      setBasicSuccess('');
                    }}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">邮箱</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={basicForm.email}
                    onChange={(e) => {
                      setBasicForm((prev) => ({ ...prev, email: e.target.value }));
                      setBasicError('');
                      setBasicSuccess('');
                    }}
                    className="h-11"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  注册时间：{user?.created_at}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleBasicSave} disabled={basicSaving} className="h-11">
                  {basicSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      保存中...
                    </div>
                  ) : (
                    '保存修改'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Avatar Tab */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle>头像设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {avatarError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
                    {avatarError}
                  </div>
                )}
                {avatarSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-900">
                    {avatarSuccess}
                  </div>
                )}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-30 w-30">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="头像预览" />
                    ) : avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user?.username} />
                    ) : null}
                    <AvatarFallback className="text-3xl">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full max-w-sm space-y-2">
                    <Label htmlFor="avatar-upload">选择头像文件</Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleAvatarChange}
                    />
                    <p className="text-xs text-muted-foreground">支持 JPG/PNG/GIF/WEBP，最大 2MB</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleAvatarUpload} disabled={!avatarFile || avatarUploading} className="h-11">
                  {avatarUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      上传中...
                    </div>
                  ) : (
                    '上传头像'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-900">
                    {passwordSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="old-password">当前密码</Label>
                  <div className="relative">
                    <Input
                      id="old-password"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="请输入当前密码"
                      value={passwordForm.oldPassword}
                      onChange={(e) => {
                        setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }));
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="请输入新密码（至少 6 位）"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="请再次输入新密码"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => {
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handlePasswordChange} disabled={passwordSaving} className="h-11">
                  {passwordSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      修改中...
                    </div>
                  ) : (
                    '修改密码'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
