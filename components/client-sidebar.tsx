"use client"

import {
  Award,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Code,
  Gamepad2,
  LayoutGrid,
  Map,
  MessageSquare,
  Video,
  X,
  Menu,
  type LucideIcon,
  Briefcase,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { useProfilePic } from "@/components/ProfilePicContext"

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
  badge?: number
  onClick?: () => void
  collapsed?: boolean
  iconBg?: string
  premium?: boolean
}

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  theme?: "light" | "dark";
}

function NavItemComponent({ icon: Icon, label, href, isActive, badge, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white",
        collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5",
      )}
      onClick={onClick}
    >
      <div className="relative">
        {isActive && <div className="absolute -inset-1 bg-blue-500/5 dark:bg-blue-400/5"></div>}
        <div className="relative">
          <Icon
            className={cn(
              "transition-all duration-200",
              collapsed ? "h-5 w-5" : "h-5 w-5",
              isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
              "group-hover:text-blue-600 dark:group-hover:text-blue-400",
              isActive && "scale-105",
            )}
            strokeWidth={isActive ? 2.2 : 2}
          />
        </div>
        {badge && (
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white",
              collapsed && "-right-1",
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {!collapsed && (
        <span
          className={cn(
            "text-sm transition-transform duration-200",
            isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300",
          )}
        >
          {label}
        </span>
      )}
      {isActive && !collapsed && (
        <div className="ml-auto h-1 w-1 rounded-full bg-blue-500/70 dark:bg-blue-400/70"></div>
      )}
    </Link>
  )
}

function NexProductItemComponent({
  icon: Icon,
  label,
  href,
  isActive,
  collapsed,
  iconBg,
  premium,
  onClick,
}: NavItemProps) {
  const isNexPractice = href === "/nexpractice";
  const isPracticeActive = isActive && isNexPractice;
  
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white",
        collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5",
        isPracticeActive && "nexpractice-active"
      )}
      onClick={onClick}
    >
      {/* Product icon */}
      <div
        className={cn(
          "rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm",
          collapsed ? "h-8 w-8" : "h-8 w-8",
          isNexPractice && "nexpractice-icon-container"
        )}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/30 border border-white/20 -z-10"></div>
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${iconBg}`}></div>
        <Icon className="h-4 w-4 text-white drop-shadow-md" />
      </div>

      {!collapsed && (
        <>
          <span
            className={cn(
              "text-sm transition-transform duration-200",
              isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300",
            )}
          >
            {label}
          </span>
        </>
      )}

      {isActive && !collapsed && (
        <div className="ml-auto h-1 w-1 rounded-full bg-blue-500/70 dark:bg-blue-400/70"></div>
      )}
    </Link>
  )
}

export function ClientSidebar({ 
  open, 
  onClose, 
  collapsed: propCollapsed, 
  onToggleCollapse,
  className,
  theme 
}: SidebarProps) {
  const { data: session } = useSession();
  const { profilePic } = useProfilePic();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed');
      return propCollapsed !== undefined ? propCollapsed : (stored === null ? true : stored === 'true');
    }
    return propCollapsed !== undefined ? propCollapsed : true;
  });
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(open || false)
  const isMobile = useMobile()

  // Update mobileMenuOpen when open prop changes
  useEffect(() => {
    if (isMobile && open !== undefined) {
      setMobileMenuOpen(open);
    }
  }, [open, isMobile]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    if (pathname.startsWith("/nexpractice")) {
      setActiveSection("nexpractice");
    } else if (pathname === "/" || pathname.startsWith("/dashboard")) {
      setActiveSection("dashboard");
    } else if (pathname.startsWith("/my-learning")) {
      setActiveSection("my-learning");
    } else if (pathname.startsWith("/calendar")) {
      setActiveSection("calendar");
    } else if (pathname.startsWith("/leaderboard")) {
      setActiveSection("leaderboard");
    } else if (pathname.startsWith("/nexlearn")) {
      setActiveSection("nexlearn");
    } else if (pathname.startsWith("/nexforum")) {
      setActiveSection("nexforum");
    } else if (pathname.startsWith("/nexplay")) {
      setActiveSection("nexplay");
    } else if (pathname.startsWith("/nexpath")) {
      setActiveSection("nexpath");
    } else if (pathname.startsWith("/nexlive")) {
      setActiveSection("nexlive");
    }
  }, [pathname]);

  // Sync collapsed state with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  }, [collapsed]);

  const toggleSidebar = () => {
    if (isMobile) {
      const newState = !mobileMenuOpen;
      setMobileMenuOpen(newState);
      // Notify parent component of close
      if (!newState && onClose) {
        onClose();
      }
    } else {
      setCollapsed((prev) => !prev);
      if (onToggleCollapse) {
        onToggleCollapse();
      }
    }
  }

  // Main menu items
  const mainMenuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutGrid,
      isActive: activeSection === "dashboard",
    },
    {
      name: "My Learning",
      href: "/my-learning",
      icon: BookOpen,
      isActive: activeSection === "my-learning",
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
      isActive: activeSection === "calendar",
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Award,
      isActive: activeSection === "leaderboard",
    },
  ]

  // Nex products
  const nexProducts = [
    {
      name: "NexLearn",
      href: "/nexlearn",
      icon: BookOpen,
      iconBg: "from-blue-500 to-blue-600",
      isActive: activeSection === "nexlearn",
      premium: false,
    },
    {
      name: "NexForum",
      href: "/nexforum",
      icon: MessageSquare,
      iconBg: "from-purple-500 to-purple-600",
      isActive: activeSection === "nexforum",
      premium: false,
    },
    {
      name: "NexPlay",
      href: "/nexplay",
      icon: Gamepad2,
      iconBg: "from-green-500 to-green-600",
      isActive: activeSection === "nexplay",
      premium: false,
    },
    {
      name: "NexPath",
      href: "/nexpath",
      icon: Map,
      iconBg: "from-amber-500 to-amber-600",
      isActive: activeSection === "nexpath",
      premium: false,
    },
    {
      name: "NexLive",
      href: "/nexlive",
      icon: Video,
      iconBg: "from-red-500 to-red-600",
      isActive: activeSection === "nexlive",
      premium: false,
    },
    {
      name: "NexPractice",
      href: "/nexpractice",
      icon: Code,
      iconBg: "from-sky-500 to-indigo-600",
      isActive: activeSection === "nexpractice",
      premium: true,
    },
    {
      name: "NexPortfolio",
      href: "/nexPortfolio/dashboard",
      icon: Briefcase,
      iconBg: "from-pink-500 to-pink-600",
      isActive: activeSection === "nexPortfolio",
      premium: false,
    },
  ]

  // Render different UI based on device type
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        {/* Mobile slide-out menu */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => {
            setMobileMenuOpen(false);
            if (onClose) onClose();
          }}
        />

        <aside
          className={cn(
            "fixed top-0 left-0 bottom-0 w-[280px] bg-white/95 dark:bg-black backdrop-blur-xl shadow-2xl border-r border-slate-200/50 dark:border-slate-700/30 z-50 transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
        >
          <div className="h-full flex flex-col">
            {/* Header with logo and close button */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 rounded-xl transform rotate-3 opacity-80 shadow-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl transform -rotate-3 opacity-80 shadow-lg"></div>
                  <div className="relative z-10 flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                    <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300 tracking-tight leading-none">
                    NexAcademy
                  </span>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 rounded-full mt-1"></div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onClose) onClose();
                }}
                className="h-8 w-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User profile */}
            <div className="mt-4 mb-4 px-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-blue-500/30 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-blue-400/30 rounded-full blur-sm"></div>
                  <Avatar className="border-2 border-white dark:border-slate-800 relative shadow-md h-10 w-10">
                    <AvatarImage src={profilePic || session?.user?.image || "/student-avatar.png"} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {session?.user?.name ? session.user.name[0] : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user?.name || "User"}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{session?.user?.username || "username"}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-2 flex flex-col overflow-y-auto">
              {/* Main Menu */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">
                  Menu
                </h4>
                <nav className="space-y-2.5">
                  {mainMenuItems.map((item) => (
                    <NavItemComponent
                      key={item.href}
                      icon={item.icon}
                      label={item.name}
                      href={item.href}
                      isActive={item.isActive}
                      collapsed={false}
                      onClick={() => {
                        setActiveSection(item.href.replace("/", "") || "dashboard")
                        setMobileMenuOpen(false)
                      }}
                    />
                  ))}
                </nav>
              </div>

              {/* Nex Products */}
              <div className="mt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">
                  Explore Nex
                </h4>
                <nav className="space-y-2.5">
                  {nexProducts.map((product) => (
                    <NexProductItemComponent
                      key={product.href}
                      icon={product.icon}
                      label={product.name}
                      href={product.href}
                      isActive={product.isActive}
                      collapsed={false}
                      iconBg={product.iconBg}
                      premium={product.premium}
                      onClick={() => {
                        setActiveSection(product.href.replace("/", ""))
                        setMobileMenuOpen(false)
                      }}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>
    )
  }

  // Desktop version (original sidebar)
  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full">
        {/* Floating Island Sidebar */}
        <aside
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            collapsed ? "w-[80px]" : "w-[280px]",
          )}
        >
          <div className="h-full w-full rounded-2xl bg-card backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/30 flex flex-col">
            {/* Header with logo */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/30">
              {!collapsed && (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Logo with 3D effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 rounded-xl transform rotate-3 opacity-80 shadow-lg"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl transform -rotate-3 opacity-80 shadow-lg"></div>
                    <div className="relative z-10 flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                      <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300 tracking-tight leading-none">
                      NexAcademy
                    </span>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 rounded-full mt-1"></div>
                  </div>
                </div>
              )}

              {collapsed && (
                <div className="relative w-10 h-10 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-400 rounded-xl transform rotate-3 opacity-80 shadow-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl transform -rotate-3 opacity-80 shadow-lg"></div>
                  <div className="relative z-10 flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                    <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50",
                  collapsed ? "absolute top-4 right-4" : "ml-auto",
                  collapsed && mounted && "hidden",
                )}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {/* Collapse button for collapsed state */}
            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 z-20"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}

            {/* User profile */}
            <div className={cn("mt-4 mb-4 px-4", collapsed && "flex flex-col items-center")}>
              <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-blue-500/30 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-blue-400/30 rounded-full blur-sm"></div>
                  <Avatar
                    className={cn(
                      "border-2 border-white dark:border-slate-800 relative shadow-md",
                      collapsed ? "h-12 w-12" : "h-10 w-10",
                    )}
                  >
                    <AvatarImage src={profilePic || session?.user?.image || "/student-avatar.png"} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {session?.user?.name ? session.user.name[0] : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user?.name || "User"}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{session?.user?.username || "username"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-2 flex flex-col overflow-y-auto">
              {/* Main Menu */}
              <div className={cn("mb-6", collapsed && "text-center")}>
                <h4
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2",
                  )}
                >
                  {collapsed ? "Menu" : "Menu"}
                </h4>
                <nav className="space-y-2.5">
                  {mainMenuItems.map((item) => (
                    <NavItemComponent
                      key={item.href}
                      icon={item.icon}
                      label={item.name}
                      href={item.href}
                      isActive={item.isActive}
                      collapsed={collapsed}
                      onClick={() => setActiveSection(item.href.replace("/", "") || "dashboard")}
                    />
                  ))}
                </nav>
              </div>

              {/* Nex Products */}
              <div className={cn("mt-2", collapsed && "text-center")}>
                <h4
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2",
                  )}
                >
                  {collapsed ? "Nex" : "Explore Nex"}
                </h4>
                <nav className="space-y-2.5">
                  {nexProducts.map((product) => (
                    <NexProductItemComponent
                      key={product.href}
                      icon={product.icon}
                      label={product.name}
                      href={product.href}
                      isActive={product.isActive}
                      collapsed={collapsed}
                      iconBg={product.iconBg}
                      premium={product.premium}
                      onClick={() => setActiveSection(product.href.replace("/", ""))}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </TooltipProvider>
  )
}
