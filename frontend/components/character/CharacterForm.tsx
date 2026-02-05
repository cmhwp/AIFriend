"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { CharacterInfo } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ImagePlus, Loader2 } from "lucide-react";

interface CharacterFormProps {
  character?: CharacterInfo;
  onSubmit: (data: {
    name: string;
    profile: string;
    photo?: File;
    background_image?: File;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function CharacterForm({
  character,
  onSubmit,
  onCancel,
  isLoading,
}: CharacterFormProps) {
  const [name, setName] = useState(character?.name || "");
  const [profile, setProfile] = useState(character?.profile || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    character?.photo ? `${API_BASE_URL}${character.photo}` : null
  );
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(
    character?.background_image ? `${API_BASE_URL}${character.background_image}` : null
  );
  const [error, setError] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("图片大小不能超过5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("图片大小不能超过5MB");
        return;
      }
      setBgFile(file);
      setBgPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("请输入角色名称");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        profile: profile.trim(),
        photo: photoFile || undefined,
        background_image: bgFile || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 背景图上传 */}
      <div>
        <Label className="mb-2 block">背景图</Label>
        <div
          className="relative h-32 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
          onClick={() => bgInputRef.current?.click()}
        >
          {bgPreview ? (
            <Image
              src={bgPreview}
              alt="背景预览"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <ImagePlus className="mb-2 h-8 w-8" />
              <span className="text-sm">点击上传背景图</span>
            </div>
          )}
          <input
            ref={bgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleBgChange}
          />
        </div>
      </div>

      {/* 头像上传 */}
      <div>
        <Label className="mb-2 block">头像</Label>
        <div className="flex items-center gap-4">
          <div
            className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="头像预览"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Camera className="h-6 w-6" />
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            点击上传角色头像
            <br />
            支持 JPG、PNG、GIF、WEBP，最大 5MB
          </p>
        </div>
      </div>

      {/* 角色名称 */}
      <div>
        <Label htmlFor="name">角色名称 *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="给角色起个名字"
          maxLength={50}
          className="mt-1.5"
        />
      </div>

      {/* 角色简介 */}
      <div>
        <Label htmlFor="profile">角色简介</Label>
        <Textarea
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="描述一下这个角色的性格、背景等..."
          rows={4}
          className="mt-1.5 resize-none"
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {character ? "保存修改" : "创建角色"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
