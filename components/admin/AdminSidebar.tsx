"use client";

import { usePathname, useRouter } from "next/navigation";
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
  ClipboardCheck,
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
  const router = useRouter();

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
        { name: "Question Bank", href: "/admin/questions", icon: FileText },
        { name: "Assessments", href: "/admin/assessments", icon: ClipboardCheck },
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-gradient-to-b from-card via-card/95 to-card/95 backdrop-blur-sm shadow-md lg:relative lg:z-0",
          !open && "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-in-out will-change-transform",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6 bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
            <BookOpenCheck className="h-5 w-5 text-primary-foreground drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NexAcademy</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
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
        <ScrollArea className="flex-1 py-5">
          <nav className="space-y-8 px-4">
            {navigation.map((group) => (
              <div key={group.name} className="space-y-3 relative">
                <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                  <span className="w-6 h-[1px] bg-gradient-to-r from-primary/40 to-transparent mr-2"></span>
                  {group.name}
                  <span className="w-full h-[1px] bg-gradient-to-l from-primary/30 to-transparent ml-2"></span>
                </h4>
                <div className="space-y-1.5 pl-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          if (onClose) onClose();
                        }}
                        className={cn(
                          "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium relative overflow-hidden transition-all duration-150 ease-in-out hover:pl-4 focus:outline-none focus:ring-1 focus:ring-primary/40",
                          isActive
                            ? "bg-gradient-to-r from-primary/10 to-transparent text-primary before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                        aria-current={isActive ? "page" : undefined}
                        tabIndex={0}
                      >
                        <item.icon className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary" 
                        )} />
                        <span className="transition-all duration-200">
                          {item.name}
                        </span>
                        {isActive && (
                          <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/80"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-auto border-t p-4 bg-gradient-to-t from-primary/5 via-background/80 to-background/20">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="w-full justify-start shadow-sm border bg-background/70 backdrop-blur-sm transition-all duration-150 hover:bg-primary/10 hover:border-primary/50">
              <Settings className="mr-2 h-4 w-4 text-primary/80" />
              <span className="font-medium">Admin Settings</span>
            </Button>
          </div>
          <div className="mt-3 text-xs text-center text-muted-foreground/70">
            <p>NexAcademy Admin v2.0</p>
          </div>
        </div>
      </aside>
    </>
  );
} 