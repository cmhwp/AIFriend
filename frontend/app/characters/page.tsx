"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CharacterInfo } from "@/lib/types";
import { MainLayout } from "@/components/layout/MainLayout";
import { CharacterCard } from "@/components/character/CharacterCard";
import { CharacterForm } from "@/components/character/CharacterForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, Users } from "lucide-react";

interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  created_at: string;
}

export default function CharactersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterInfo | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<CharacterInfo | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, charRes] = await Promise.all([
        api.getUserInfo(),
        api.getCharacterList(),
      ]);
      setUser(userRes);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCharacters((charRes as any).data || []);
    } catch (error) {
      console.error("获取数据失败:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  const handleCreate = async (data: {
    name: string;
    profile: string;
    photo?: File;
    background_image?: File;
  }) => {
    setFormLoading(true);
    try {
      await api.createCharacter(data);
      setShowCreateDialog(false);
      fetchData();
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: {
    name: string;
    profile: string;
    photo?: File;
    background_image?: File;
  }) => {
    if (!editingCharacter) return;
    setFormLoading(true);
    try {
      await api.updateCharacter(editingCharacter.id, data);
      setEditingCharacter(null);
      fetchData();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCharacter) return;
    try {
      await api.removeCharacter(deletingCharacter.id);
      setDeletingCharacter(null);
      fetchData();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleChat = (character: CharacterInfo) => {
    // TODO: 跳转到对话页面
    console.log("开始与角色对话:", character);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">我的角色</h1>
            <p className="mt-1 text-muted-foreground">
              创建和管理你的 AI 伙伴
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建角色
          </Button>
        </div>

        {/* 角色列表 */}
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-16">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">还没有角色</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              创建你的第一个 AI 伙伴吧
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建角色
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={setEditingCharacter}
                onDelete={setDeletingCharacter}
                onChat={handleChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* 创建角色对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
          </DialogHeader>
          <CharacterForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog
        open={!!editingCharacter}
        onOpenChange={(open) => !open && setEditingCharacter(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
          </DialogHeader>
          {editingCharacter && (
            <CharacterForm
              character={editingCharacter}
              onSubmit={handleEdit}
              onCancel={() => setEditingCharacter(null)}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deletingCharacter}
        onOpenChange={(open) => !open && setDeletingCharacter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除角色「{deletingCharacter?.name}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
