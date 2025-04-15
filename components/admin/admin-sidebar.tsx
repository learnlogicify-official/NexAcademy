import Link from "next/link";
import { LayoutDashboard, BookOpen, HelpCircle, Users, Settings, ArrowLeft, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-sm",
              pathname === "/admin/dashboard"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Content
            </h3>
            <div className="space-y-1">
              <Link
                href="/admin/categories"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/categories"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <Folder className="h-4 w-4" />
                Categories
              </Link>

              <Link
                href="/admin/courses"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/courses"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>

              <Link
                href="/admin/questions"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/questions"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <HelpCircle className="h-4 w-4" />
                Question Bank
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Management
            </h3>
            <div className="space-y-1">
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/users"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <Users className="h-4 w-4" />
                Users
              </Link>

              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  pathname === "/admin/settings"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </div>
  );
} 