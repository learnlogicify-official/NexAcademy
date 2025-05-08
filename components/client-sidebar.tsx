"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Trophy,
  BookMarked,
  Calendar,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Map,
  Video,
  ChevronLeft,
  ChevronRightIcon,
  Code,
  Shield,
  FileText,
  Briefcase,
  Sparkles,
  Home,
  LayoutGrid,
  Monitor,
  Building2,
  Terminal,
  ShieldCheck,
  Settings,
  Compass,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"

// Client-only component for decorative blur elements 
// This prevents hydration errors from random styling
const DecorativeElements = ({ theme }: { theme: "light" | "dark" }) => {
  return (
    <>
      <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-indigo-200/10 to-purple-300/5 dark:from-indigo-500/5 dark:to-purple-600/5 blur-2xl"></div>
      <div className="absolute bottom-[15%] right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-purple-200/10 to-pink-300/5 dark:from-purple-500/5 dark:to-pink-600/5 blur-2xl"></div>
      <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-200/10 to-blue-300/5 dark:from-indigo-500/5 dark:to-blue-600/5 blur-xl"></div>
    </>
  );
};

// Client-side only wrapper to prevent hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Add empty divs with the same structure but no visible styling for server-side
  if (!mounted) {
    return (
      <>
        <div className="absolute opacity-0"></div>
        <div className="absolute opacity-0"></div>
        <div className="absolute opacity-0"></div>
      </>
    );
  }
  
  return <>{children}</>;
}

// Client-side only effect for hover handling
function ClientEffect({ children, onMount }: { children: React.ReactNode, onMount?: () => void }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (onMount) onMount();
  }, [onMount]);
  
  if (!mounted) {
    return null;
  }
  
  return <>{children}</>;
}

// Export the type for use by the main sidebar component
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  hamburgerMenu?: React.ReactNode
  theme?: "light" | "dark"
}

export function Sidebar({
  className,
  open = true,
  onClose,
  collapsed: propCollapsed,
  onToggleCollapse: propToggleCollapse,
  hamburgerMenu,
  theme = "light", // Default to light theme to match NexAcademy
  ...props
}: SidebarProps) {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(propCollapsed || false)
  const [showNexPracticeModal, setShowNexPracticeModal] = useState(false)
  const [blurBody, setBlurBody] = useState(false)
  const [hoverItem, setHoverItem] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration mismatch by only enabling hover effects after client mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update localStorage and dispatch event when sidebar state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", collapsed.toString())
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("sidebarStateChange"))
    }
    // If propCollapsed changes, update our local state
    if (propCollapsed !== undefined && propCollapsed !== collapsed) {
      setCollapsed(propCollapsed)
    }
  }, [collapsed, propCollapsed])

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed
    setCollapsed(newCollapsedState)
    if (propToggleCollapse) {
      propToggleCollapse()
    }
  }

  // Check if current path is a NexPractice route
  const isNexPracticePath = pathname?.startsWith("/nexpractice")

  // NexPractice-specific menu items
  const nexPracticeMenuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutGrid,
      iconRight: ChevronRight,
    },
    {
      name: "Problem Set",
      href: "/nexpractice/problems",
      icon: Terminal,
    },
    {
      name: "Trending Company",
      href: "/nexpractice/companies",
      icon: Building2,
    },
    {
      name: "CodeIDE",
      href: "/nexpractice/ide",
      icon: Monitor,
    },
  ]

  // Default menu items for other pages
  const defaultMenuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutGrid,
      iconRight: ChevronRight,
    },
    {
      name: "My Learning",
      href: "/my-learning",
      icon: BookMarked,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
  ]

  // Choose menu items based on current path
  const menuItems = isNexPracticePath ? nexPracticeMenuItems : defaultMenuItems

  const serviceItems = [
    {
      name: "NexLearn",
      href: "/nexlearn",
      icon: BookOpen,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      premium: false,
    },
    {
      name: "NexForum",
      href: "/nexforum",
      icon: MessageSquare,
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      premium: false,
    },
    {
      name: "NexPlay",
      href: "/nexplay",
      icon: Gamepad2,
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      premium: false,
    },
    {
      name: "NexPath",
      href: "/nexpath",
      icon: Map,
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      premium: false,
    },
    {
      name: "NexLive",
      href: "/nexlive",
      icon: Video,
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
      premium: false,
    },
    {
      name: "NexPractice",
      href: "/nexpractice",
      icon: Code,
      iconBg: "bg-gradient-to-br from-sky-500 to-indigo-600",
      premium: true,
    },
    {
      name: "NexCompete",
      href: "/nexcompete",
      icon: FileText,
      iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
      premium: false,
    },
  ]

  // Add admin item to menuItems if user is admin
  const adminMenuItem = [
    {
      name: "Site Administration",
      href: "/admin",
      icon: ShieldCheck,
      iconRight: undefined,
    },
  ]
  const allMenuItems = [...menuItems, ...adminMenuItem]

  // Handler for NexPractice click
  const handleNexPracticeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setBlurBody(true)
    setShowNexPracticeModal(true)
    setTimeout(() => {
      setShowNexPracticeModal(false)
      setBlurBody(false)
      router.push("/nexpractice")
    }, 5000)
  }

  // For mobile: create an overlay when sidebar is open
  const mobileOverlay = isMobile && open && (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
  )

  // Theme-based styling - Updated to match NexPractice UI
  const themeStyles = {
    light: {
      sidebar: "from-white/80 via-white/90 to-white/80 border-indigo-100/30",
      overlay: "from-white/10 via-white/5 to-transparent",
      glow: "from-indigo-200/10 via-purple-200/10 to-pink-200/10",
      header: "border-indigo-100/30 bg-white/60",
      text: "text-slate-700",
      textMuted: "text-slate-400",
      textActive: "text-indigo-600",
      sectionHeader: "text-indigo-700/80",
      hoverBg: "bg-indigo-50/30",
      activeBg: "bg-indigo-50/50",
      activeIndicator: "from-indigo-500 via-purple-500 to-pink-500",
      activeGlow: "rgba(99, 102, 241, 0.25)",
      iconBg: "bg-white/80 border-indigo-100/30",
      expandButton: "bg-white/80 border-indigo-100/30 hover:bg-white/90",
      premiumBadge: {
        bg: "bg-gradient-to-r from-indigo-500 to-purple-500",
        text: "text-white",
        shadow: "shadow-sm shadow-indigo-900/20",
      },
    },
    dark: {
      sidebar: "from-slate-950/95 via-slate-950/95 to-slate-950/95 border-indigo-900/20",
      overlay: "from-indigo-950/10 via-slate-950/5 to-transparent",
      glow: "from-indigo-400/5 via-purple-400/5 to-pink-400/5",
      header: "border-indigo-900/20 bg-slate-950/70",
      text: "text-slate-400",
      textMuted: "text-slate-500",
      textActive: "text-indigo-400",
      sectionHeader: "text-indigo-400/80",
      hoverBg: "bg-indigo-900/10",
      activeBg: "bg-indigo-900/20",
      activeIndicator: "from-indigo-500 via-purple-500 to-pink-500",
      activeGlow: "rgba(99, 102, 241, 0.3)",
      iconBg: "bg-slate-900/80 border-indigo-800/20",
      expandButton: "bg-slate-900/80 border-indigo-800/20 hover:bg-slate-900/90",
      premiumBadge: {
        bg: "bg-gradient-to-r from-indigo-500 to-purple-500",
        text: "text-white",
        shadow: "shadow-sm shadow-indigo-900/50",
      },
    },
  }

  const currentTheme = themeStyles[theme]

  return (
    <>
      {mobileOverlay}
      {/* Blur overlay and loader modal for NexPractice, rendered at root level for highest z-index */}
      {blurBody && <div className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[8px] transition-all"></div>}
      {showNexPracticeModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 animate-fade-in backdrop-blur-sm">
          <div
            className="backdrop-blur-2xl bg-black/80 border border-white/10 p-8 flex flex-col items-center animate-fade-in shadow-xl rounded-lg w-[360px]"
            style={{
              boxShadow: "0 0 80px 0 rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05)",
              animation: "fadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Animated particles - Client-side only rendering to avoid hydration mismatch */}
            {typeof window !== 'undefined' && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                {Array.from({ length: 15 }).map((_, i) => {
                  // Pre-compute these values once for consistent rendering
                  const width = 3 + (i % 8);
                  const height = 3 + (i % 8);
                  const top = (i * 6) % 100;
                  const left = (i * 7) % 100;
                  const animationDuration = 10 + (i % 10);
                  const animationDelay = i % 5;
                  
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full bg-indigo-500/20"
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        top: `${top}%`,
                        left: `${left}%`,
                        animation: `float ${animationDuration}s linear infinite`,
                        animationDelay: `${animationDelay}s`,
                      }}
                    ></div>
                  );
                })}
              </div>
            )}

            {/* Simplified Code-themed NexAcademy Logo */}
            <div className="flex flex-col items-center mb-6 relative z-10">
              <span className="text-2xl font-bold tracking-tight mb-1">
                <span className="text-indigo-400">nex</span>
                <span className="text-white">practice</span>
                <span className="animate-blink text-indigo-400">_</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-xs text-indigo-300">Premium Coding Platform</span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-black/40 rounded-lg p-4 w-full font-mono mb-5 border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="flex items-center w-full">
                <span className="text-gray-400">$</span>
                <span
                  className="ml-2 text-white animate-typewriter overflow-hidden whitespace-nowrap"
                  style={{ maxWidth: "100%" }}
                >
                  loading coding arena...
                </span>
                <span className="animate-blink text-indigo-400">█</span>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
      )}
      <aside
        className={cn(
          "h-[calc(100vh-2rem)] my-4 ml-4 rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden",
          collapsed ? "w-[80px]" : "w-[280px]",
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative",
          isMobile && !open && "-translate-x-full",
          className,
        )}
        {...props}
      >
        {/* Glass morphism container with theme-based gradient */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl backdrop-blur-2xl bg-gradient-to-br border shadow-[0_4px_24px_rgba(0,0,0,0.1)]",
            currentTheme.sidebar
          )}
        ></div>

        {/* Decorative elements - using ClientOnly wrapper to prevent hydration mismatch */}
        <ClientOnly>
          <DecorativeElements theme={theme} />
        </ClientOnly>

        {/* Gradient overlay with theme-based accent */}
        <div 
          className={cn(
            "absolute inset-0 rounded-xl bg-gradient-to-b opacity-50",
            currentTheme.overlay
          )}
        ></div>

        {/* Animated glow effect with theme-based accent */}
        <div
          className={cn(
            "absolute -inset-[1px] rounded-xl bg-gradient-to-r animate-glow-slow",
            currentTheme.glow
          )}
        ></div>

        {/* Content container */}
        <div className="h-full w-full rounded-xl relative z-10 overflow-hidden flex flex-col">
          {/* App Logo and Name section */}
          <div
            className={cn(
              `flex items-center gap-2.5 px-4 py-3 border-b ${currentTheme.header} backdrop-blur-md`,
              collapsed && "justify-center",
            )}
          >
            <div className="relative">
              <div className="h-9 w-9 flex items-center justify-center">
                {/* Matching NexPractice 3D effect for logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl transform rotate-3 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl transform -rotate-3 opacity-80"></div>
                <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                  <Code className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 tracking-tight leading-none">
                    NexAcademy
                  </span>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mt-1"></div>
                </div>
                <button
                  onClick={toggleCollapse}
                  className={`ml-auto h-7 w-7 rounded-md flex items-center justify-center ${currentTheme.text} hover:${currentTheme.textActive} transition-all duration-200 overflow-hidden backdrop-blur-md border border-indigo-100/30 dark:border-indigo-900/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 hover:shadow-sm`}
                >
                  <ChevronLeft size={15} />
                </button>
              </>
            )}
          </div>

          <ScrollArea className="flex-1 [&_.scrollbar]:hidden [&_.thumb]:hidden">
            {/* Menu section */}
            <div className="py-3">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className={`text-xs ${currentTheme.sectionHeader} font-semibold tracking-wide uppercase leading-none`}>
                    Menu
                  </span>
                </div>
              )}
              <nav className="space-y-0.5">
                {allMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  const isHovered = hoverItem === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between py-2 relative group",
                        collapsed ? "px-0 justify-center" : "px-4",
                        currentTheme.text,
                        `hover:${currentTheme.textActive} transition-all duration-200`,
                        isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                      )}
                      onMouseEnter={isMounted ? () => setHoverItem(item.href) : undefined}
                      onMouseLeave={isMounted ? () => setHoverItem(null) : undefined}
                    >
                      {/* Active indicator with gradient matching NexPractice */}
                      {isActive && (
                        <>
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[65%] w-[2.5px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                            style={{
                              boxShadow: `0 0 10px ${currentTheme.activeGlow}`,
                            }}
                          ></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                          ></div>
                        </>
                      )}

                      {/* Hover effect - using ClientEffect to prevent hydration issues */}
                      <ClientEffect>
                        {!isActive && (
                          <div
                            className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                          ></div>
                        )}
                      </ClientEffect>

                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                        <div
                          className={cn(
                            "relative flex items-center justify-center transition-transform duration-200",
                            isActive || isHovered ? `${currentTheme.textActive} scale-110` : currentTheme.text,
                          )}
                        >
                          <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                          {/* Glow effect on hover/active - using ClientEffect */}
                          <ClientEffect>
                            {(isActive || isHovered) && (
                              <div className="absolute inset-0 blur-md bg-white/30 -z-10"></div>
                            )}
                          </ClientEffect>
                        </div>
                        {!collapsed && <span className={`text-[14px] font-medium tracking-tight ${isActive ? currentTheme.textActive : ""} transform group-hover:translate-x-0.5 transition-transform duration-200`}>{item.name}</span>}
                      </div>
                      {!collapsed && item.iconRight && (
                        <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                          <item.iconRight className={`h-3.5 w-3.5 ${currentTheme.textMuted}`} />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Explore Nex section */}
            <div className="py-3">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className={`text-xs ${currentTheme.sectionHeader} font-semibold tracking-wide uppercase leading-none`}>
                    Explore Nex
                  </span>
                </div>
              )}
              <nav className="space-y-0.5">
                {serviceItems.map((item) => {
                  const isActive = pathname === item.href
                  const isHovered = hoverItem === item.href

                  // Updated colors for service items to match NexPractice style
                  let updatedIconBg = item.iconBg;
                  if (item.name === "NexPractice") {
                    updatedIconBg = "bg-gradient-to-br from-indigo-500 to-purple-600";
                  }

                  // Special handler for NexPractice
                  if (item.name === "NexPractice") {
                    return (
                      <button
                        key={item.href}
                        onClick={handleNexPracticeClick}
                        className={cn(
                          "flex items-center justify-between py-2 relative w-full bg-transparent border-0 cursor-pointer group",
                          collapsed ? "px-0 justify-center" : "px-4",
                          currentTheme.text,
                          `hover:${currentTheme.textActive} transition-all duration-200`,
                          isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                        )}
                        style={{ outline: "none" }}
                        onMouseEnter={isMounted ? () => setHoverItem(item.href) : undefined}
                        onMouseLeave={isMounted ? () => setHoverItem(null) : undefined}
                      >
                        {/* Active indicator with glow */}
                        {isActive && (
                          <>
                            <div
                              className={`absolute left-0 top-1/2 -translate-y-1/2 h-[65%] w-[2.5px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                              style={{
                                boxShadow: `0 0 10px ${currentTheme.activeGlow}`,
                              }}
                            ></div>
                            <div
                              className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                            ></div>
                          </>
                        )}

                        {/* Hover effect - using ClientEffect to prevent hydration issues */}
                        <ClientEffect>
                          {!isActive && (
                            <div
                              className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                            ></div>
                          )}
                        </ClientEffect>

                        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                          <div
                            className={cn(
                              "rounded-md flex items-center justify-center relative overflow-hidden transition-transform duration-200",
                              isActive || isHovered ? "scale-110" : "",
                              collapsed ? "h-9 w-9" : "h-7 w-7",
                            )}
                          >
                            {/* Glass effect for icon background */}
                            <div
                              className={`absolute inset-0 backdrop-blur-md bg-black/30 border border-white/10 -z-10`}
                            ></div>

                            {/* Gradient background */}
                            <div className={cn("absolute inset-0 -z-10", updatedIconBg)}></div>

                            {/* Glow effect on hover/active - using ClientEffect */}
                            <ClientEffect>
                              {(isActive || isHovered) && (
                                <div className="absolute inset-0 blur-md bg-white/30 -z-10"></div>
                              )}
                            </ClientEffect>

                            <item.icon className="h-3.5 w-3.5 text-white drop-shadow-md" />

                            {/* Premium indicator on the icon for collapsed state */}
                            {item.premium && collapsed && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border border-white flex items-center justify-center">
                                <Sparkles className="h-1.5 w-1.5 text-white" />
                              </div>
                            )}
                          </div>

                          {!collapsed && (
                            <div className="flex items-center">
                              <span className={cn(isActive ? currentTheme.textActive : "", "relative text-[14px] font-medium tracking-tight transform group-hover:translate-x-0.5 transition-transform duration-200")}>
                                {item.name}
                              </span>
                              {/* Premium badge for expanded state */}
                              {item.premium && (
                                <div
                                  className={`ml-2 flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium rounded-md ${currentTheme.premiumBadge.bg} ${currentTheme.premiumBadge.text} ${currentTheme.premiumBadge.shadow}`}
                                >
                                  <Sparkles className="h-2 w-2 mr-0.5" />
                                  PRO
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  }

                  // Default link for other items
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between py-2 relative group",
                        collapsed ? "px-0 justify-center" : "px-4",
                        currentTheme.text,
                        `hover:${currentTheme.textActive} transition-all duration-200`,
                        isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                      )}
                      onMouseEnter={isMounted ? () => setHoverItem(item.href) : undefined}
                      onMouseLeave={isMounted ? () => setHoverItem(null) : undefined}
                    >
                      {/* Active indicator with glow */}
                      {isActive && (
                        <>
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[65%] w-[2.5px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                            style={{
                              boxShadow: `0 0 10px ${currentTheme.activeGlow}`,
                            }}
                          ></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                          ></div>
                        </>
                      )}

                      {/* Hover effect - using ClientEffect to prevent hydration issues */}
                      <ClientEffect>
                        {!isActive && (
                          <div
                            className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                          ></div>
                        )}
                      </ClientEffect>

                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
                        <div
                          className={cn(
                            "rounded-md flex items-center justify-center relative overflow-hidden transition-transform duration-200",
                            isActive || isHovered ? "scale-110" : "",
                            collapsed ? "h-9 w-9" : "h-7 w-7",
                          )}
                        >
                          {/* Glass effect for icon background */}
                          <div
                            className={`absolute inset-0 backdrop-blur-md bg-black/30 border border-white/10 -z-10`}
                          ></div>

                          {/* Gradient background */}
                          <div className={cn("absolute inset-0 -z-10", updatedIconBg)}></div>

                          {/* Glow effect on hover/active - using ClientEffect */}
                          <ClientEffect>
                            {(isActive || isHovered) && (
                              <div className="absolute inset-0 blur-md bg-white/30 -z-10"></div>
                            )}
                          </ClientEffect>

                          <item.icon className="h-3.5 w-3.5 text-white drop-shadow-md" />

                          {/* Premium indicator on the icon for collapsed state */}
                          {item.premium && collapsed && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border border-white flex items-center justify-center">
                              <Sparkles className="h-1.5 w-1.5 text-white" />
                            </div>
                          )}
                        </div>

                        {!collapsed && (
                          <div className="flex items-center">
                            <span className={`text-[14px] font-medium tracking-tight ${isActive ? currentTheme.textActive : ""} transform group-hover:translate-x-0.5 transition-transform duration-200`}>{item.name}</span>
                            {/* Premium badge for expanded state */}
                            {item.premium && (
                              <div
                                className={`ml-2 flex items-center justify-center px-1.5 py-0.5 text-[9px] font-medium rounded-md ${currentTheme.premiumBadge.bg} ${currentTheme.premiumBadge.text} ${currentTheme.premiumBadge.shadow}`}
                              >
                                <Sparkles className="h-2 w-2 mr-0.5" />
                                PRO
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </ScrollArea>

          {/* Expand button at bottom when collapsed */}
          {collapsed && (
            <div className="mt-auto p-4 flex justify-center">
              <button
                onClick={toggleCollapse}
                className="h-9 w-9 rounded-lg flex items-center justify-center border border-indigo-100/30 dark:border-indigo-900/20 text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 overflow-hidden backdrop-blur-md bg-white/80 dark:bg-slate-900/80 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 hover:shadow-sm relative"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200"
                ></div>
                <ChevronRightIcon size={16} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          )}
        </div>
      </aside>
      <style jsx global>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        .animate-typewriter {
          animation: typewriter 2.5s steps(30, end) forwards;
          width: 28ch;
        }
        
        .animate-glow-slow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-loading-bar {
          animation: loading-bar 4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      <style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`}</style>
    </>
  )
}
