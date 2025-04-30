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
  BookMarked,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  hamburgerMenu?: React.ReactNode
}

// Navigation config types and arrays
interface NavRoute {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainRoutes: NavRoute[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Learning", href: "/my-learning", icon: BookMarked },
  { name: "Course Hub", href: "/course-hub", icon: ShoppingBag },
  { name: "Assignments", href: "/assignments", icon: GraduationCap },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

const bottomRoutes: NavRoute[] = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  className,
  open = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
  hamburgerMenu,
  ...props
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  // Update localStorage and dispatch event when sidebar state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", collapsed.toString())
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("sidebarStateChange"))
    }
  }, [collapsed])

  // For mobile: create an overlay when sidebar is open
  const mobileOverlay = isMobile && open && (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
  )

  return (
    <>
      {mobileOverlay}
      <aside
        className={cn(
          "h-screen border-r border-border bg-card transition-all duration-300 ease-in-out",
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative",
          isMobile && !open && "-translate-x-full",
          className,
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="Go to dashboard"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            {!collapsed && <span className="text-lg font-semibold">Nexacademy</span>}
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden lg:flex">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Collapse sidebar</span>
              </Button>
              {isMobile && (
                <>
                  {hamburgerMenu}
                  <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close sidebar</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col h-[calc(100%-8rem)]">
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2" role="navigation" aria-label="Main">
              <TooltipProvider>
                {mainRoutes.map((route) => {
                  const isActive = pathname === route.href
                  const content = (
                    <button
                      key={route.href}
                      onClick={() => router.push(route.href)}
                      className={cn(
                        "flex h-10 w-full items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                        isActive && "bg-accent text-accent-foreground",
                        collapsed && "justify-center px-0",
                      )}
                      aria-current={isActive ? "page" : undefined}
                      tabIndex={0}
                    >
                      <route.icon className="h-5 w-5" />
                      {!collapsed && <span>{route.name}</span>}
                    </button>
                  )
                  return collapsed ? (
                    <Tooltip key={route.href}>
                      <TooltipTrigger asChild>{content}</TooltipTrigger>
                      <TooltipContent side="right" align="center">{route.name}</TooltipContent>
                    </Tooltip>
                  ) : content
                })}
              </TooltipProvider>
            </nav>
          </ScrollArea>

          <div className="mt-auto border-t border-border py-4">
            <nav className="flex flex-col gap-1 px-2" role="navigation" aria-label="Account">
              <TooltipProvider>
                {bottomRoutes.map((route) => {
                  const isActive = pathname === route.href
                  const content = (
                    <button
                      key={route.href}
                      onClick={() => router.push(route.href)}
                      className={cn(
                        "flex h-10 w-full items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                        isActive && "bg-accent text-accent-foreground",
                        collapsed && "justify-center px-0",
                      )}
                      aria-current={isActive ? "page" : undefined}
                      tabIndex={0}
                    >
                      <route.icon className="h-5 w-5" />
                      {!collapsed && <span>{route.name}</span>}
                    </button>
                  )
                  return collapsed ? (
                    <Tooltip key={route.href}>
                      <TooltipTrigger asChild>{content}</TooltipTrigger>
                      <TooltipContent side="right" align="center">{route.name}</TooltipContent>
                    </Tooltip>
                  ) : content
                })}
                {isAdmin && (
                  <button
                    onClick={() => router.push("/admin")}
                    className={cn(
                      "flex h-10 w-full items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                      pathname === "/admin" && "bg-accent text-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                    aria-current={pathname === "/admin" ? "page" : undefined}
                    tabIndex={0}
                  >
                    <Settings className="h-5 w-5" />
                    {!collapsed && <span>Site Administration</span>}
                  </button>
                )}
                {collapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="flex h-10 w-full items-center justify-center rounded-md mt-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Expand sidebar</span>
                  </Button>
                )}
              </TooltipProvider>
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
