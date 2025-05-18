"use client"

import { useState, useEffect } from "react"
import { Compass, Home, MessageCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    active: true,
    notifications: 0,
    customIcon: (isActive: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? "#EFF6FF" : "none"}
        />
        {isActive && (
          <path d="M9 22V12H15V22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    ),
  },
  {
    id: "discover",
    label: "Explore",
    icon: Compass,
    active: false,
    notifications: 0,
    customIcon: (isActive: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          fill={isActive ? "#EFF6FF" : "none"}
        />
        <path
          d="M14.5 9.5L9.5 14.5M9.5 9.5L14.5 14.5"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          transform="rotate(45 12 12)"
        />
      </svg>
    ),
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    active: false,
    notifications: 2,
    customIcon: (isActive: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? "#EFF6FF" : "none"}
        />
        <path
          d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageCircle,
    active: false,
    notifications: 5,
    customIcon: (isActive: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
          stroke={isActive ? "#2563EB" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? "#EFF6FF" : "none"}
        />
      </svg>
    ),
  },
]

export default function SocialTabs() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-white/95 border-b border-gray-200 rounded-xl my-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <nav className="flex justify-around" aria-label="Tabs">
            {tabs.map((tab) => {
              // Determine if tab is active based on the current path
              const isActive =
                (tab.id === "home" && (pathname === "/nexconnect" || pathname === "/")) ||
                (tab.id === "discover" && (pathname === "/explore" || pathname.includes("/nexconnect/explore"))) ||
                (tab.id === "events" && pathname === "/events") ||
                (tab.id === "messages" && pathname === "/messages")

              // Determine the href for each tab
              const href =
                tab.id === "home"
                  ? "/nexconnect"
                  : tab.id === "discover"
                    ? "/nexconnect/explore"
                    : tab.id === "events"
                      ? "/events"
                      : tab.id === "messages"
                        ? "/messages"
                        : "/nexconnect"

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center py-3 px-1 relative group transition-all duration-300",
                    isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    {/* Custom SVG icon with shadow effect */}
                    <div className={`${isActive ? "drop-shadow-md" : ""}`}>
                    {tab.customIcon(isActive)}
                    </div>

                    {/* Notification badge */}
                    {tab.notifications > 0 && (
                      <Badge className="absolute -top-1 -right-2 h-4 min-w-[1rem] px-0.5 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] border-[1.5px] border-white shadow-sm">
                        {tab.notifications}
                      </Badge>
                    )}
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="mt-0.5 text-[10px] font-medium text-blue-600"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 mx-auto w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Hover glow effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-md transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-b from-blue-50 to-transparent" 
                        : "group-hover:bg-blue-50/50"
                    )}
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
