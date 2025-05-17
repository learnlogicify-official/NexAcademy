"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useMobile } from "@/hooks/use-mobile"

export default function CodingPortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()

  // On mobile, sidebar is hidden by default (controlled by sidebarOpen)
  // On desktop, sidebar is always shown but can be collapsed
  const effectiveSidebarOpen = isMobile ? sidebarOpen : true

  return (
    <div className="flex h-screen w-full bg-background relative" style={{ pointerEvents: "auto" }}>
      {/* Sidebar - higher z-index to ensure it's above content */}
      <div className="relative z-50">
        <Sidebar
          className={isMobile ? "" : `transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-72"}`}
          open={effectiveSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={isMobile ? false : sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={resolvedTheme as "light" | "dark"}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col transition-all duration-300 z-40 relative" style={{ pointerEvents: "auto" }}>
        {/* TopBar already includes hamburger menu for mobile */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto" style={{ pointerEvents: "auto" }}>{children}</main>
      </div>
    </div>
  )
}