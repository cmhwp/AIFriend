"use client";

import Image from "next/image";
import { CharacterInfo } from "@/lib/types";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageCircle, Pencil, Trash2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CharacterCardProps {
  character: CharacterInfo;
  onEdit?: (character: CharacterInfo) => void;
  onDelete?: (character: CharacterInfo) => void;
  onChat?: (character: CharacterInfo) => void;
}

export function CharacterCard({ character, onEdit, onDelete, onChat }: CharacterCardProps) {
  const photoUrl = character.photo
    ? `${API_BASE_URL}${character.photo}`
    : null;

  const bgUrl = character.background_image
    ? `${API_BASE_URL}${character.background_image}`
    : null;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* 背景图区域 */}
      <div
        className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5"
        style={
          bgUrl
            ? {
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {/* 操作菜单 */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(character)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(character)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="relative pt-0">
        {/* 头像 */}
        <div className="-mt-10 mb-3 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={character.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* 角色信息 */}
        <div className="text-center">
          <h3 className="mb-1 text-lg font-semibold">{character.name}</h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {character.profile || "这个角色还没有简介"}
          </p>
        </div>

        {/* 开始对话按钮 */}
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onChat?.(character)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          开始对话
        </Button>
      </CardContent>
    </Card>
  );
}
