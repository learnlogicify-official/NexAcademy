"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  Settings,
  User,
  X,
  LogOut,
  Users,
  BarChart,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useSession } from "next-auth/react"
import { Role } from "@/lib/validations/role"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  className,
  open = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isMobile = useMobile()
  const isAdmin = session?.user?.role === "ADMIN"

  const mainRoutes = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Courses",
      href: "/courses",
      icon: BookOpen,
    },
    {
      name: "Assignments",
      href: "/assignments",
      icon: GraduationCap,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
  ]

  const bottomRoutes = [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  // For mobile: create an overlay when sidebar is open
  const mobileOverlay = isMobile && open && (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
  )

  return (
    <>
      {mobileOverlay}
      <aside
        className={cn(
          "h-screen border-r bg-card transition-all duration-300 ease-in-out",
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative",
          isMobile && !open && "-translate-x-full",
          className,
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            {!collapsed && <span className="text-lg font-semibold">Nexacademy</span>}
          </Link>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden lg:flex">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Collapse sidebar</span>
              </Button>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close sidebar</span>
                </Button>
              )}
            </div>
          )}
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {mainRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href && "bg-accent text-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <route.icon className="h-5 w-5" />
                {!collapsed && <span>{route.name}</span>}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === "/admin" && "bg-accent text-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Site Administration</span>}
              </Link>
            )}
          </nav>
        </ScrollArea>
        <div className="border-t py-4">
          <nav className="flex flex-col gap-1 px-2">
            {bottomRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href && "bg-accent text-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <route.icon className="h-5 w-5" />
                {!collapsed && <span>{route.name}</span>}
              </Link>
            ))}
            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="flex h-10 w-full items-center justify-center rounded-md"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Expand sidebar</span>
              </Button>
            )}
          </nav>
        </div>
      </aside>
    </>
  )
}

