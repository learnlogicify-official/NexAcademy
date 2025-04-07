"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  BarChart,
  MessageSquare,
  FileText,
  Tag,
  ChevronLeft,
  BookOpenCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  className?: string;
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ className, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart },
      ],
    },
    {
      name: "Content",
      items: [
        { name: "Categories", href: "/admin/categories", icon: Tag },
        { name: "Courses", href: "/admin/courses", icon: BookOpen },
      ],
    },
    {
      name: "Management",
      items: [
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Messages", href: "/admin/messages", icon: MessageSquare },
        { name: "Reports", href: "/admin/reports", icon: FileText },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card/50 backdrop-blur-sm lg:relative lg:z-0",
          !open && "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-in-out",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpenCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">NexAcademy</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 lg:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-6 px-4">
            {navigation.map((group) => (
              <div key={group.name} className="space-y-3">
                <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.name}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
} 