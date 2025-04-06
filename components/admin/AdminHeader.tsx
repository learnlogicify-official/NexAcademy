"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Bell, User } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-bold">NexAcademy Admin</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:block">{session?.user?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 