"use client"

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { usePathname } from "next/navigation"

type PlatformHandle = {
  id: string
  userId: string
  platform: string
  handle: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

type PlatformDataContextType = {
  platformHandles: PlatformHandle[]
  lastUpdated: string
  isLoading: boolean
  fetchPlatformHandles: () => Promise<void>
}

const PlatformDataContext = createContext<PlatformDataContextType | undefined>(undefined)

export function usePlatformData() {
  const context = useContext(PlatformDataContext)
  if (context === undefined) {
    throw new Error('usePlatformData must be used within a PlatformDataProvider')
  }
  return context
}

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Skip loading platform handles on pages that don't need them
  const isNexPracticePage = pathname?.includes('/nexpractice');
  const isDashboardPage = pathname === '/' || pathname === '/dashboard';
  const isAuthPage = pathname?.startsWith('/auth/');
  const shouldSkipFetching = isNexPracticePage || isDashboardPage || isAuthPage;
  
  const [platformHandles, setPlatformHandles] = useState<PlatformHandle[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Refs to prevent duplicate API calls
  const lastFetchTimeRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)
  
  const fetchPlatformHandles = async () => {
    // Skip fetching on pages that don't need this data
    if (shouldSkipFetching) {
      return;
    }
    
    // Debounce mechanism to prevent multiple rapid calls
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 3000 || isFetchingRef.current) {
      console.log("Debouncing fetchPlatformHandles call in context - too frequent")
      return
    }
    
    lastFetchTimeRef.current = now
    isFetchingRef.current = true
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/user/platform-handles", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) throw new Error("Failed to fetch platform handles")
      
      const data = await response.json()
      
      if (data.handles) {
        setPlatformHandles(data.handles)
        
        // Find the most recent updatedAt timestamp from handles
        if (Array.isArray(data.handles) && data.handles.length > 0) {
          const mostRecentUpdate = data.handles.reduce((latest: Date, handle: any) => {
            if (handle.updatedAt) {
              const updateDate = new Date(handle.updatedAt)
              return updateDate > latest ? updateDate : latest
            }
            return latest
          }, new Date(0)) // Start with epoch time
          
          if (mostRecentUpdate.getTime() > 0) {
            // Format the date nicely
            const now = new Date()
            if (mostRecentUpdate.toDateString() === now.toDateString()) {
              // Today, show time
              setLastUpdated(`Today, ${mostRecentUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
            } else {
              // Not today, show date
              setLastUpdated(mostRecentUpdate.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: mostRecentUpdate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
              }))
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching platform handles:", error)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }
  
  // Fetch platform handles when the context is first mounted, except on pages that don't need it
  useEffect(() => {
    if (!shouldSkipFetching) {
      fetchPlatformHandles()
    }
  }, [shouldSkipFetching])
  
  const value = {
    platformHandles,
    lastUpdated,
    isLoading,
    fetchPlatformHandles
  }
  
  return (
    <PlatformDataContext.Provider value={value}>
      {children}
    </PlatformDataContext.Provider>
  )
} 