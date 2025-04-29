import { useState } from "react"
import Link from "next/link";
import { LayoutDashboard, BookOpen, HelpCircle, Users, Settings, ArrowLeft, Folder, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn("h-full flex flex-col border-r transition-all duration-200 bg-background", collapsed ? "w-16" : "w-64")}> 
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-semibold">Admin Panel</h2>}
        <button
          className="ml-auto p-1 rounded hover:bg-muted"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className={cn("p-4 space-y-1", collapsed && "p-2")}> 
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-sm",
              pathname === "/admin/dashboard"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted",
              collapsed && "justify-center"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            {!collapsed && "Dashboard"}
          </Link>

          <div className={cn("pt-4", collapsed && "pt-2")}> 
            {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Content
            </h3>
            )}
            <div className="space-y-1">
              <Link
                href="/admin/categories"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/categories"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <Folder className="h-4 w-4" />
                {!collapsed && "Categories"}
              </Link>

              <Link
                href="/admin/courses"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/courses"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <BookOpen className="h-4 w-4" />
                {!collapsed && "Courses"}
              </Link>

              <Link
                href="/admin/questions"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/questions"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <HelpCircle className="h-4 w-4" />
                {!collapsed && "Question Bank"}
              </Link>
            </div>
          </div>

          <div className={cn("pt-4", collapsed && "pt-2")}> 
            {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Management
            </h3>
            )}
            <div className="space-y-1">
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/users"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <Users className="h-4 w-4" />
                {!collapsed && "Users"}
              </Link>

              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/settings"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <Settings className="h-4 w-4" />
                {!collapsed && "Settings"}
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-muted",
            collapsed && "justify-center"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && "Back to Site"}
        </Link>
      </div>
    </div>
  );
} 