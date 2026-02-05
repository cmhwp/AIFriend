'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserInfo } from '@/lib/types';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  user: UserInfo;
  onLogout: () => void;
  children: React.ReactNode;
}

export function MainLayout({ user, onLogout, children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNewChat = () => {
    // TODO: Create new chat
    console.log('New chat');
  };

  const handleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onCollapse={handleCollapse}
          onNewChat={handleNewChat}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px]" showCloseButton={false}>
          <SheetTitle className="sr-only">导航菜单</SheetTitle>
          <Sidebar
            user={user}
            collapsed={false}
            onCollapse={() => setMobileOpen(false)}
            onNewChat={() => {
              handleNewChat();
              setMobileOpen(false);
            }}
            onLogout={() => {
              onLogout();
              setMobileOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with hamburger */}
        <div className="md:hidden h-14 border-b flex items-center px-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
