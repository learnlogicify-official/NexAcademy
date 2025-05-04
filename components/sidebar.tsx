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
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
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
      icon: LayoutDashboard,
      iconRight: ChevronRight,
    },
    {
      name: "Problem Set",
      href: "/nexpractice/problems",
      icon: FileText,
    },
    {
      name: "Trending Company",
      href: "/nexpractice/companies",
      icon: Briefcase,
    },
    {
      name: "CodeIDE",
      href: "/nexpractice/ide",
      icon: Code,
    },
  ]

  // Default menu items for other pages
  const defaultMenuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
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
      icon: Shield,
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

  // Theme-based styling - Updated for black glassy appearance
  const themeStyles = {
    light: {
      sidebar: "from-white/80 via-white/90 to-white/80 border-black/10",
      overlay: "from-white/10 via-white/5 to-transparent",
      glow: "from-black/5 via-black/5 to-black/5",
      header: "border-black/10 bg-white/60",
      text: "text-gray-700",
      textMuted: "text-gray-400",
      textActive: "text-black",
      sectionHeader: "text-gray-500",
      hoverBg: "bg-black/5",
      activeBg: "bg-black/10",
      activeIndicator: "from-sky-400 to-sky-600",
      activeGlow: "rgba(14, 165, 233, 0.15)",
      iconBg: "bg-white/80 border-black/10",
      expandButton: "bg-white/80 border-black/10 hover:bg-white/90",
      premiumBadge: {
        bg: "bg-gradient-to-r from-sky-500 to-sky-600",
        text: "text-white",
        shadow: "shadow-sm shadow-sky-900/20",
      },
    },
    dark: {
      sidebar: "from-black/100 via-black/100 to-black/100 border-white/10",
      overlay: "from-black/20 via-black/10 to-transparent",
      glow: "from-white/5 via-white/5 to-white/5",
      header: "border-white/5 bg-black/70",
      text: "text-gray-400",
      textMuted: "text-gray-600",
      textActive: "text-white",
      sectionHeader: "text-gray-300",
      hoverBg: "bg-white/5",
      activeBg: "bg-white/10",
      activeIndicator: "from-sky-400 to-sky-600",
      activeGlow: "rgba(14, 165, 233, 0.3)",
      iconBg: "bg-black/80 border-white/5",
      expandButton: "bg-black/80 border-white/5 hover:bg-black/90",
      premiumBadge: {
        bg: "bg-gradient-to-r from-sky-500 to-sky-600",
        text: "text-white",
        shadow: "shadow-sm shadow-sky-900/50",
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
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-sky-500/20"
                  style={{
                    width: `${Math.random() * 8 + 3}px`,
                    height: `${Math.random() * 8 + 3}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Simplified Code-themed NexAcademy Logo */}
            <div className="flex flex-col items-center mb-6 relative z-10">
              <span className="text-2xl font-bold tracking-tight mb-1">
                <span className="text-sky-400">nex</span>
                <span className="text-white">practice</span>
                <span className="animate-blink text-sky-400">_</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-xs text-sky-300">Premium Coding Platform</span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-black/40 rounded-lg p-4 w-full font-mono mb-5 border border-sky-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 to-sky-400"></div>
              <div className="flex items-center w-full">
                <span className="text-gray-400">$</span>
                <span
                  className="ml-2 text-white animate-typewriter overflow-hidden whitespace-nowrap"
                  style={{ maxWidth: "100%" }}
                >
                  loading coding arena...
                </span>
                <span className="animate-blink text-sky-400">█</span>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full animate-loading-bar"></div>
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
          className={`absolute inset-0 rounded-xl backdrop-blur-2xl bg-gradient-to-br ${currentTheme.sidebar} border shadow-[0_0_25px_rgba(0,0,0,0.4)]`}
        ></div>

        {/* Gradient overlay with theme-based accent */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${currentTheme.overlay} opacity-50`}></div>

        {/* Animated glow effect with theme-based accent */}
        <div
          className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r ${currentTheme.glow} animate-glow-slow`}
        ></div>

        {/* Content container */}
        <div className="h-full w-full rounded-xl relative z-10 overflow-hidden flex flex-col">
          {/* App Logo and Name section */}
          <div
            className={cn(
              `flex items-center gap-3 px-4 py-3 border-b ${currentTheme.header} backdrop-blur-md`,
              collapsed && "justify-center",
            )}
          >
            <div className="relative">
              <div className="h-10 w-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-600/20 animate-pulse-slow"></div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                  <Code className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col">
                  <span className={`text-lg font-semibold ${currentTheme.textActive} tracking-wide font-sans`}>
                    NexAcademy
                  </span>
                  <span className={`text-xs ${theme === "light" ? "text-sky-600/80" : "text-sky-400/80"} font-light`}>
                    Learning Platform
                  </span>
                </div>
                <button
                  onClick={toggleCollapse}
                  className={`ml-auto h-8 w-8 rounded-md flex items-center justify-center ${currentTheme.text} hover:${currentTheme.textActive} transition-colors overflow-hidden backdrop-blur-md ${currentTheme.expandButton}`}
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          <ScrollArea className="flex-1 [&_.scrollbar]:hidden [&_.thumb]:hidden">
            {/* Menu section */}
            <div className="py-3">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className={`text-sm ${currentTheme.sectionHeader} font-medium tracking-wide uppercase text-xs`}>
                    Menu
                  </span>
                </div>
              )}
              <nav>
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
                        `hover:${currentTheme.textActive} transition-colors`,
                        isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                      )}
                      onMouseEnter={() => setHoverItem(item.href)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      {/* Active indicator with glow */}
                      {isActive && (
                        <>
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                            style={{
                              boxShadow: `0 0 12px ${currentTheme.activeGlow}`,
                            }}
                          ></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                          ></div>
                        </>
                      )}

                      {/* Hover effect */}
                      {!isActive && (
                        <div
                          className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity`}
                        ></div>
                      )}

                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                        <div
                          className={cn(
                            "relative flex items-center justify-center transition-transform",
                            isActive || isHovered ? `${currentTheme.textActive} scale-110` : currentTheme.text,
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {(isActive || isHovered) && (
                            <div className="absolute inset-0 blur-sm bg-sky-400/20 rounded-full -z-10"></div>
                          )}
                        </div>
                        {!collapsed && <span className={isActive ? currentTheme.textActive : ""}>{item.name}</span>}
                      </div>
                      {!collapsed && item.iconRight && (
                        <div className="flex items-center">
                          <item.iconRight className={`h-4 w-4 ${currentTheme.textMuted}`} />
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
                  <span className={`text-sm ${currentTheme.sectionHeader} font-medium tracking-wide uppercase text-xs`}>
                    Explore Nex
                  </span>
                </div>
              )}
              <nav>
                {serviceItems.map((item) => {
                  const isActive = pathname === item.href
                  const isHovered = hoverItem === item.href

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
                          `hover:${currentTheme.textActive} transition-colors`,
                          isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                        )}
                        style={{ outline: "none" }}
                        onMouseEnter={() => setHoverItem(item.href)}
                        onMouseLeave={() => setHoverItem(null)}
                      >
                        {/* Active indicator with glow */}
                        {isActive && (
                          <>
                            <div
                              className={`absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                              style={{
                                boxShadow: `0 0 12px ${currentTheme.activeGlow}`,
                              }}
                            ></div>
                            <div
                              className={`absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                            ></div>
                          </>
                        )}

                        {/* Hover effect */}
                        {!isActive && (
                          <div
                            className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity`}
                          ></div>
                        )}

                        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                          <div
                            className={cn(
                              "rounded-md flex items-center justify-center relative overflow-hidden transition-transform",
                              isActive || isHovered ? "scale-110" : "",
                              collapsed ? "h-10 w-10" : "h-8 w-8",
                            )}
                          >
                            {/* Glass effect for icon background */}
                            <div
                              className={`absolute inset-0 backdrop-blur-md bg-black/30 border border-white/10 -z-10`}
                            ></div>

                            {/* Gradient background */}
                            <div className={cn("absolute inset-0 -z-10", item.iconBg)}></div>

                            {/* Glow effect on hover/active */}
                            {(isActive || isHovered) && (
                              <div className="absolute inset-0 blur-md bg-white/30 -z-10"></div>
                            )}

                            <item.icon className="h-4 w-4 text-white drop-shadow-md" />

                            {/* Premium indicator on the icon for collapsed state */}
                            {item.premium && collapsed && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500 border border-white flex items-center justify-center">
                                <Sparkles className="h-1.5 w-1.5 text-white" />
                              </div>
                            )}
                          </div>

                          {!collapsed && (
                            <div className="flex items-center">
                              <span className={cn(isActive ? currentTheme.textActive : "", "relative")}>
                                {item.name}
                              </span>
                              {/* Premium badge for expanded state */}
                              {item.premium && (
                                <div
                                  className={`ml-2 flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded-md ${currentTheme.premiumBadge.bg} ${currentTheme.premiumBadge.text} ${currentTheme.premiumBadge.shadow}`}
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
                        `hover:${currentTheme.textActive} transition-colors`,
                        isActive && `${currentTheme.textActive} ${currentTheme.activeBg} backdrop-blur-sm`,
                      )}
                      onMouseEnter={() => setHoverItem(item.href)}
                      onMouseLeave={() => setHoverItem(null)}
                    >
                      {/* Active indicator with glow */}
                      {isActive && (
                        <>
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-gradient-to-b ${currentTheme.activeIndicator} rounded-r-full`}
                            style={{
                              boxShadow: `0 0 12px ${currentTheme.activeGlow}`,
                            }}
                          ></div>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                          ></div>
                        </>
                      )}

                      {/* Hover effect */}
                      {!isActive && (
                        <div
                          className={`absolute inset-0 ${currentTheme.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity`}
                        ></div>
                      )}

                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                        <div
                          className={cn(
                            "rounded-md flex items-center justify-center relative overflow-hidden transition-transform",
                            isActive || isHovered ? "scale-110" : "",
                            collapsed ? "h-10 w-10" : "h-8 w-8",
                          )}
                        >
                          {/* Glass effect for icon background */}
                          <div
                            className={`absolute inset-0 backdrop-blur-md bg-black/30 border border-white/10 -z-10`}
                          ></div>

                          {/* Gradient background */}
                          <div className={cn("absolute inset-0 -z-10", item.iconBg)}></div>

                          {/* Glow effect on hover/active */}
                          {(isActive || isHovered) && (
                            <div className="absolute inset-0 blur-md bg-white/30 -z-10"></div>
                          )}

                          <item.icon className="h-4 w-4 text-white drop-shadow-md" />

                          {/* Premium indicator on the icon for collapsed state */}
                          {item.premium && collapsed && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500 border border-white flex items-center justify-center">
                              <Sparkles className="h-1.5 w-1.5 text-white" />
                            </div>
                          )}
                        </div>

                        {!collapsed && (
                          <div className="flex items-center">
                            <span className={isActive ? currentTheme.textActive : ""}>{item.name}</span>
                            {/* Premium badge for expanded state */}
                            {item.premium && (
                              <div
                                className={`ml-2 flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded-md ${currentTheme.premiumBadge.bg} ${currentTheme.premiumBadge.text} ${currentTheme.premiumBadge.shadow}`}
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
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${currentTheme.text} hover:${currentTheme.textActive} transition-colors overflow-hidden backdrop-blur-md ${currentTheme.expandButton} relative`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-sky-500/10 to-sky-500/10 opacity-0 hover:opacity-100 transition-opacity`}
                ></div>
                <ChevronRightIcon size={16} />
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`}</style>
    </>
  )
}
