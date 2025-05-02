"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Trophy,
  BookMarked,
  Calendar,
  Plus,
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
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import nexacademyLogo from "@/public/images/nexacademy-logo-new.png"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  hamburgerMenu?: React.ReactNode
}

export function Sidebar({
  className,
  open = true,
  onClose,
  collapsed: propCollapsed,
  onToggleCollapse: propToggleCollapse,
  hamburgerMenu,
  ...props
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(propCollapsed || false)
  const { data: session } = useSession();
  const [showNexPracticeModal, setShowNexPracticeModal] = useState(false);
  const [blurBody, setBlurBody] = useState(false);

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

  const menuItems = [
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
      iconRight: Plus,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
  ]

  const serviceItems = [
    {
      name: "NexLearn",
      href: "/nexlearn",
      icon: BookOpen,
      iconBg: "bg-blue-500",
    },
    {
      name: "NexForum",
      href: "/nexforum",
      icon: MessageSquare,
      iconBg: "bg-purple-500",
    },
    {
      name: "NexPlay",
      href: "/nexplay",
      icon: Gamepad2,
      iconBg: "bg-green-500",
    },
    {
      name: "NexPath",
      href: "/nexpath",
      icon: Map,
      iconBg: "bg-amber-500",
    },
    {
      name: "NexLive",
      href: "/nexlive",
      icon: Video,
      iconBg: "bg-red-500",
    },
    {
      name: "NexPractice",
      href: "/nexpractice",
      icon: Code,
      iconBg: "bg-cyan-500",
    },
    {
      name: "NexCompete",
      href: "/nexcompete",
      icon: FileText,
      iconBg: "bg-pink-500",
    },
  ]

  // Add admin item to menuItems if user is admin
  const adminMenuItem = session?.user?.role === "ADMIN"
    ? [{
        name: "Site Administration",
        href: "/admin",
        icon: Shield,
        iconRight: undefined,
      }]
    : [];
  const allMenuItems = [
    ...menuItems,
    ...adminMenuItem,
  ];

  // Common glossy button style
  const glossyButtonStyle = {
    background: "rgba(10, 10, 10, 0.5)", // More transparent background
    boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.05), inset 0 0 4px rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)", // Lighter border
    position: "relative" as const,
  }

  // Handler for NexPractice click
  const handleNexPracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBlurBody(true);
    setShowNexPracticeModal(true);
    setTimeout(() => {
      setShowNexPracticeModal(false);
      setBlurBody(false);
      window.location.replace("/nexpractice"); // full page reload
    }, 5000);
  };

  // For mobile: create an overlay when sidebar is open
  const mobileOverlay = isMobile && open && (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
  )

  return (
    <>
      {mobileOverlay}
      {/* Blur overlay and loader modal for NexPractice, rendered at root level for highest z-index */}
      {blurBody && (
        <div className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[8px] transition-all"></div>
      )}
      {showNexPracticeModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 animate-fade-in backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-slate-900/80 border border-cyan-500/30 p-8 flex flex-col items-center animate-fade-in shadow-xl rounded-lg w-[360px]" 
               style={{ 
                 boxShadow: '0 0 80px 0 rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.05)', 
                 animation: 'fadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
               }}>
            {/* Simplified Code-themed NexAcademy Logo */}
            <div className="flex flex-col items-center mb-6">
              <span className="text-2xl font-bold tracking-tight mb-1">
                <span className="text-cyan-400">nex</span>
                <span className="text-white">practice</span>
                <span className="animate-blink text-white">_</span>
              </span>
            </div>
            <div className="flex items-center justify-center bg-black/40 rounded p-4 w-full font-mono mb-5 border border-gray-700/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-500"></div>
              <div className="flex items-center w-full">
                <span className="text-gray-400">$</span>
                <span className="ml-2 text-white animate-typewriter overflow-hidden whitespace-nowrap" style={{ maxWidth: '100%' }}>
                  loading coding arena...
                </span>
                <span className="animate-blink text-cyan-400">█</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <aside
        className={cn(
          "h-[calc(100vh-2rem)] my-4 ml-4 rounded-xl transition-all duration-300 ease-in-out shadow-lg relative p-[1px] overflow-hidden",
          collapsed ? "w-[80px]" : "w-[280px]",
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative",
          isMobile && !open && "-translate-x-full",
          className,
        )}
        {...props}
      >
        {/* Gradient border using pseudo-element */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gray-600 to-black -z-10"></div>

        {/* Content container with background */}
        <div
          className="h-full w-full rounded-xl relative z-10 overflow-hidden flex flex-col"
          style={{
            background: "#050505", // Very dark, almost black background
            boxShadow: "inset 0 0 80px rgba(255, 255, 255, 0.05), inset 0 0 30px rgba(255, 255, 255, 0.03)",
          }}
        >
          {/* Enhanced glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none"></div>

          {/* App Logo and Name section */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 border-b border-gray-800/50",
              collapsed && "justify-center",
            )}
          >
            <div className="relative">
              <div className="h-10 w-10 flex items-center justify-center">
                <Image
                  src="/images/nexacademy-logo-new.png"
                  alt="App Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">NexAcademy</span>
                  <span className="text-xs text-gray-400">Learning Platform</span>
                </div>
                <button
                  onClick={toggleCollapse}
                  className="ml-auto h-8 w-8 rounded-md flex items-center justify-center text-gray-400 hover:text-white transition-colors overflow-hidden"
                  style={glossyButtonStyle}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
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
                  <span className="text-sm text-gray-500">Menu</span>
                </div>
              )}
              <nav>
                {allMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between py-2 relative",
                        collapsed ? "px-0 justify-center" : "px-4",
                        "text-gray-400 hover:bg-gray-800/40",
                      )}
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-blue-500"
                          style={{
                            borderTopRightRadius: "4px",
                            borderBottomRightRadius: "4px",
                            boxShadow: "0 0 6px rgba(59, 130, 246, 0.5)",
                          }}
                        ></div>
                      )}
                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                        <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                        {!collapsed && <span className={isActive ? "text-white" : ""}>{item.name}</span>}
                      </div>
                      {!collapsed && item.iconRight && (
                        <div className="flex items-center">
                          <item.iconRight className="h-4 w-4 text-gray-500" />
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
                  <span className="text-sm text-gray-500">Explore Nex</span>
                </div>
              )}
              <nav>
                {serviceItems.map((item) => {
                  const isActive = pathname === item.href
                  // Special handler for NexPractice
                  if (item.name === "NexPractice") {
                    return (
                      <button
                        key={item.href}
                        onClick={handleNexPracticeClick}
                        className={cn(
                          "flex items-center justify-between py-2 relative w-full bg-transparent border-0 cursor-pointer",
                          collapsed ? "px-0 justify-center" : "px-4",
                          "text-gray-400 hover:bg-gray-800/40",
                        )}
                        style={{ outline: "none" }}
                      >
                        {isActive && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-blue-500"
                            style={{
                              borderTopRightRadius: "4px",
                              borderBottomRightRadius: "4px",
                              boxShadow: "0 0 6px rgba(59, 130, 246, 0.5)",
                            }}
                          ></div>
                        )}
                        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}> 
                          <div
                            className={cn(
                              "rounded-md flex items-center justify-center",
                              item.iconBg,
                              collapsed ? "h-10 w-10" : "h-8 w-8",
                            )}
                          >
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          {!collapsed && <span className={isActive ? "text-white" : ""}>{item.name}</span>}
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
                        "flex items-center justify-between py-2 relative",
                        collapsed ? "px-0 justify-center" : "px-4",
                        "text-gray-400 hover:bg-gray-800/40",
                      )}
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-blue-500"
                          style={{
                            borderTopRightRadius: "4px",
                            borderBottomRightRadius: "4px",
                            boxShadow: "0 0 6px rgba(59, 130, 246, 0.5)",
                          }}
                        ></div>
                      )}
                      <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}> 
                        <div
                          className={cn(
                            "rounded-md flex items-center justify-center",
                            item.iconBg,
                            collapsed ? "h-10 w-10" : "h-8 w-8",
                          )}
                        >
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        {!collapsed && <span className={isActive ? "text-white" : ""}>{item.name}</span>}
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
                className="h-10 w-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors overflow-hidden"
                style={{
                  ...glossyButtonStyle,
                  borderRadius: "0.5rem",
                  aspectRatio: "1/1",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
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
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        .animate-typewriter {
          animation: typewriter 2.5s steps(30, end) forwards;
          width: 28ch;
        }
      `}</style>
    </>
  )
}