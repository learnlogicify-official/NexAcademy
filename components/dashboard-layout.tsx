"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

/**
 * @deprecated Use the DashboardShell in app/dashboard-shell.tsx instead
 * This component is kept for backward compatibility but new pages should use
 * the persistent shell structure under app/(dashboard)
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  
  // Check if we're on the NexConnect page or Explore page
  const isNexConnectPage = pathname === '/nexconnect' || pathname.includes('/nexconnect/explore')

  // On mobile, sidebar is hidden by default (controlled by sidebarOpen)
  // On desktop, sidebar is always shown but can be collapsed
  const effectiveSidebarOpen = isMobile ? sidebarOpen : true

  return (
    <div className="flex h-screen w-full bg-background relative">
      {/* Sidebar - Note that it's already equipped with a hamburger menu on mobile via TopBar */}
      <Sidebar
        className={`z-50 ${isMobile ? "" : `transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-72"}`}`}
        open={effectiveSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={resolvedTheme as "light" | "dark"}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* TopBar already includes hamburger menu for mobile */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 overflow-y-auto ${isNexConnectPage ? 'p-0' : 'p-4 md:p-6'}`}>{children}</main>
      </div>
    </div>
  )
}

