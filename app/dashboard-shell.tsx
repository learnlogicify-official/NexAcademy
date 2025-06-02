"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

/**
 * Persistent Dashboard Shell that doesn't refresh during page navigation
 * This component contains the sidebar and topbar that stay consistent
 * while only the main content area updates
 */
export default function DashboardShell({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  
  // Random ID to demonstrate persistence across page navigations 
  // (this value will stay the same when navigating between pages)
  const [shellId] = useState(Math.floor(Math.random() * 10000))

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage for sidebar collapsed state
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed")
    if (storedCollapsedState !== null) {
      setSidebarCollapsed(storedCollapsedState === "true")
    }
    
    // Log the shell ID to console to demonstrate that it persists
    console.log(`Dashboard Shell mounted with ID: ${shellId}`)
  }, [shellId])

  if (!mounted) return null

  // On mobile, sidebar is hidden by default (controlled by sidebarOpen)
  // On desktop, sidebar is always shown but can be collapsed
  const effectiveSidebarOpen = isMobile ? sidebarOpen : true

  // Handle sidebar collapse toggle
  const handleToggleCollapse = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
    // Dispatch event for other components that need to know about sidebar state
    window.dispatchEvent(new Event("sidebarStateChange"))
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar - Note that it's already equipped with a hamburger menu on mobile via TopBar */}
      <Sidebar
        className={isMobile ? "" : `transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-16" : "w-72"}`}
        open={effectiveSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        theme={resolvedTheme as "light" | "dark"}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* TopBar already includes hamburger menu for mobile */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Hidden debug info to verify shell persistence */}
        <div className="text-[8px] text-gray-400 absolute top-0 right-0 opacity-50">
          Shell ID: {shellId}
        </div>
        
        <main className={`flex-1 overflow-y-auto ${pathname?.includes('/nexpractice') || pathname?.includes('/nexPortfolio') ? '' : 'p-4 md:p-6'}`}>{children}</main>
      </div>
    </div>
  )
} 