'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { API_BASE_URL } from '@/lib/api';
import { UserInfo } from '@/lib/types';
import {
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock conversation history
const mockConversations = [
  { id: '1', title: '关于 React 的问题', group: 'today' },
  { id: '2', title: '帮我写一篇文章', group: 'today' },
  { id: '3', title: 'Python 代码调试', group: 'week' },
  { id: '4', title: '旅行计划建议', group: 'week' },
  { id: '5', title: '学习英语的方法', group: 'month' },
];

interface SidebarProps {
  user: UserInfo;
  collapsed: boolean;
  onCollapse: () => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export function Sidebar({
  user,
  collapsed,
  onCollapse,
  onNewChat,
  onLogout,
}: SidebarProps) {
  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${API_BASE_URL}${user.avatar}`
    : '';

  const fallbackInitial = user?.username?.charAt(0).toUpperCase() || '?';

  const todayConversations = mockConversations.filter((c) => c.group === 'today');
  const weekConversations = mockConversations.filter((c) => c.group === 'week');
  const monthConversations = mockConversations.filter((c) => c.group === 'month');

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'h-full bg-sidebar flex flex-col border-r transition-all duration-300',
          collapsed ? 'w-[60px]' : 'w-[260px]'
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-2 border-b shrink-0">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="w-full"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">新对话</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={onNewChat}
                className="flex-1 justify-start gap-2"
              >
                <Plus className="h-5 w-5" />
                新对话
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onCollapse}>
                    <PanelLeftClose className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">收起侧边栏</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="px-2 py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCollapse}
                  className="w-full"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">展开侧边栏</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Conversation list */}
        {!collapsed && (
          <ScrollArea className="flex-1 px-2">
            <div className="py-2 space-y-4">
              {/* Today */}
              {todayConversations.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    今天
                  </p>
                  <div className="space-y-0.5">
                    {todayConversations.map((conv) => (
                      <ConversationItem key={conv.id} title={conv.title} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past 7 days */}
              {weekConversations.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    过去 7 天
                  </p>
                  <div className="space-y-0.5">
                    {weekConversations.map((conv) => (
                      <ConversationItem key={conv.id} title={conv.title} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past 30 days */}
              {monthConversations.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    过去 30 天
                  </p>
                  <div className="space-y-0.5">
                    {monthConversations.map((conv) => (
                      <ConversationItem key={conv.id} title={conv.title} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* User section */}
        <div className="border-t p-2 shrink-0">
          {collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full">
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={user.username} />}
                    <AvatarFallback>{fallbackInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <UserDropdownContent user={user} onLogout={onLogout} />
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-12 px-2"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={user.username} />}
                    <AvatarFallback>{fallbackInitial}</AvatarFallback>
                  </Avatar>
                  <span className="truncate flex-1 text-left">{user.username}</span>
                  <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <UserDropdownContent user={user} onLogout={onLogout} />
            </DropdownMenu>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function ConversationItem({ title }: { title: string }) {
  return (
    <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left hover:bg-sidebar-accent transition-colors group">
      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{title}</span>
    </button>
  );
}

function UserDropdownContent({
  user,
  onLogout,
}: {
  user: UserInfo;
  onLogout: () => void;
}) {
  return (
    <DropdownMenuContent align="end" side="top" className="w-56">
      <div className="px-2 py-1.5">
        <p className="text-sm font-medium">{user.username}</p>
        {user.email && (
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        )}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/profile" className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          个人资料
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={onLogout}
        className="cursor-pointer text-red-600 focus:text-red-600"
      >
        <LogOut className="mr-2 h-4 w-4" />
        退出登录
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
