"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { StreakModal } from "./streak-modal"
import { useStreakModal } from "@/hooks/use-streak-modal"
import { useSession } from "next-auth/react"

interface StreakIntegrationProps {
  streakEstablished?: boolean
  currentStreak?: number
  highestStreak?: number
  sampleActiveDays?: boolean[]
  onCheckStreak?: (showModal: boolean) => void
  timezoneOffset?: number
}

/**
 * Component that handles streak modal display logic
 * 
 * Can be used in two ways:
 * 1. Automatic: When streakEstablished is true, it shows the streak modal
 *    Note: streakEstablished is now only true for first correct submissions
 * 2. Manual: Call the onCheckStreak callback to check and potentially show the modal
 */
export function StreakIntegration({
  streakEstablished = false,
  currentStreak,
  highestStreak,
  sampleActiveDays,
  onCheckStreak,
  timezoneOffset
}: StreakIntegrationProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  
  // Add client hydration safety
  const [isClient, setIsClient] = useState(false)
  
  // Track whether we've handled the streak established event
  const hasHandledStreak = useRef(false)
  
  // Initialize client state
  useEffect(() => {
    setIsClient(true)
    console.log("[StreakIntegration] Component mounted, isClient set to true")
  }, [])
  
  const {
    isStreakModalOpen,
    streakData,
    showStreakModal,
    closeStreakModal
  } = useStreakModal(userId, timezoneOffset)
  
  // Log when streak modal state changes
  useEffect(() => {
    if (isClient) {
      console.log("[StreakIntegration] Modal state:", { isStreakModalOpen, streakData })
    }
  }, [isStreakModalOpen, streakData, isClient])
  
  // Handle modal closure properly
  const handleCloseModal = useCallback(() => {
    console.log("[StreakIntegration] Closing modal")
    // Close the modal
    closeStreakModal()
    
    // Notify parent if callback is provided
    if (onCheckStreak) {
      console.log("[StreakIntegration] Notifying parent of modal close")
      onCheckStreak(false)
    }
  }, [closeStreakModal, onCheckStreak])
  
  // Show streak modal when streak is established - ONLY ON SUCCESSFUL SUBMISSION
  useEffect(() => {
    console.log("[StreakIntegration] Checking streak established:", { 
      streakEstablished, 
      userId, 
      isClient, 
      hasHandled: hasHandledStreak.current,
      currentStreak,
      highestStreak,
      timezoneOffset
    })
    
    // Only show the streak modal when streakEstablished is explicitly set to true
    // This happens after a correct submission, not on initial page load
    if (streakEstablished && isClient && !hasHandledStreak.current) {
      console.log('[StreakIntegration] Streak established, showing modal with:', { 
        currentStreak, 
        highestStreak,
        timezoneOffset
      })
      
      // Debug the actual currentStreak value
      if (typeof currentStreak === 'number') {
        console.log(`[StreakIntegration] Current streak is ${currentStreak} days (from props)`);
      } else {
        console.log(`[StreakIntegration] Warning: currentStreak is not a number: ${currentStreak}`);
      }
      
      // Force show the modal - pass timezoneOffset as second parameter
      showStreakModal(true, timezoneOffset)
      
      // Mark as handled to prevent infinite loops
      hasHandledStreak.current = true
    }
    
    // Reset the handled flag when streakEstablished changes to false
    if (!streakEstablished) {
      console.log('[StreakIntegration] Resetting hasHandledStreak flag')
      hasHandledStreak.current = false
    }
  }, [streakEstablished, userId, currentStreak, highestStreak, showStreakModal, isClient, timezoneOffset])
  
  // Provide a callback for manual streak checking
  useEffect(() => {
    if (onCheckStreak && userId && isClient) {
      onCheckStreak(isStreakModalOpen)
    }
  }, [onCheckStreak, isStreakModalOpen, userId, isClient])
  
  // Don't render anything during SSR to prevent hydration issues
  if (!isClient) return null
  
  return (
    <StreakModal
      isOpen={isStreakModalOpen}
      onClose={handleCloseModal}
      userId={userId || ""}
      currentStreak={currentStreak ?? streakData.currentStreak}
      highestStreak={highestStreak ?? streakData.highestStreak}
      sampleActiveDays={sampleActiveDays}
    />
  )
} 