"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useMobile } from "@/hooks/use-mobile"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMobile()

  // On mobile, sidebar is hidden by default
  const effectiveSidebarOpen = isMobile ? sidebarOpen : true

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-72"}`}
        open={effectiveSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

