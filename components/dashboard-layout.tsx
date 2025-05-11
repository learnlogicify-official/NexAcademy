"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()

  // On mobile, sidebar is hidden by default (controlled by sidebarOpen)
  // On desktop, sidebar is always shown but can be collapsed
  const effectiveSidebarOpen = isMobile ? sidebarOpen : true

  return (
    <div className="flex h-screen w-screen fixed inset-0 overflow-hidden bg-background">
      {/* Sidebar - Note that it's already equipped with a hamburger menu on mobile via TopBar */}
      <Sidebar
        className={isMobile ? "" : `transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-72"}`}
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

