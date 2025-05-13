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
  onCheckStreak
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
  } = useStreakModal(userId)
  
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
  
  // Show streak modal when streak is established
  useEffect(() => {
    console.log("[StreakIntegration] Checking streak established:", { 
      streakEstablished, 
      userId, 
      isClient, 
      hasHandled: hasHandledStreak.current,
      currentStreak,
      highestStreak
    })
    
    // IMPORTANT: Allow the modal to show even if userId is not available yet
    // This happens when streak is established before session is loaded
    if (streakEstablished && isClient && !hasHandledStreak.current) {
      console.log('[StreakIntegration] Streak established, showing modal with:', { currentStreak, highestStreak })
      
      // Debug the actual currentStreak value
      if (typeof currentStreak === 'number') {
        console.log(`[StreakIntegration] Current streak is ${currentStreak} days (from props)`);
      } else {
        console.log(`[StreakIntegration] Warning: currentStreak is not a number: ${currentStreak}`);
      }
      
      // Force show the modal
      showStreakModal(true)
      
      // Mark as handled to prevent infinite loops
      hasHandledStreak.current = true
      
      // Force update the DOM immediately to ensure modal shows
      setTimeout(() => {
        try {
          // Note: This is a faster way to ensure the streak modal appears promptly
          const dialog = document.querySelector('[data-dialog-name="streak-modal"]');
          if (dialog) {
            console.log('[StreakIntegration] Found streak modal dialog, ensuring visibility');
            dialog.setAttribute('data-state', 'open');
            dialog.setAttribute('aria-hidden', 'false');
            (dialog as HTMLElement).style.display = 'flex';
            (dialog as HTMLElement).style.opacity = '1';
            (dialog as HTMLElement).style.pointerEvents = 'auto';
            
            // Also ensure the background overlay is visible
            const overlay = document.querySelector('.fixed.inset-0.z-50.bg-black.bg-opacity-80');
            if (overlay) {
              (overlay as HTMLElement).style.opacity = '1';
              (overlay as HTMLElement).style.pointerEvents = 'auto';
            }
          }
        } catch (e) {
          console.error('[StreakIntegration] Error forcing dialog visibility:', e);
        }
      }, 50);
      
      // DEVELOPMENT ONLY: Force the dialog to be visible by directly manipulating DOM
      // This is a last resort to ensure modal appears
      if (process.env.NODE_ENV === 'development') {
        try {
          // Give the state change time to apply, then check if the modal is actually visible
          setTimeout(() => {
            console.log('[StreakIntegration] Development-only check for modal visibility');
            // Access dialog element and force it to be visible if needed
            const dialog = document.querySelector('[role="dialog"]');
            if (dialog) {
              // @ts-ignore - Force the modal to be visible
              dialog.setAttribute('data-state', 'open');
              dialog.setAttribute('aria-hidden', 'false');
              dialog.setAttribute('style', 'pointer-events: auto; opacity: 1;');
              console.log('[StreakIntegration] Forced dialog to be visible');
            } else {
              console.log('[StreakIntegration] Could not find dialog element');
            }
          }, 100);
        } catch (e) {
          console.error('[StreakIntegration] Error forcing dialog visibility:', e);
        }
      }
    }
    
    // Reset the handled flag when streakEstablished changes to false
    if (!streakEstablished) {
      console.log('[StreakIntegration] Resetting hasHandledStreak flag')
      hasHandledStreak.current = false
    }
  }, [streakEstablished, userId, currentStreak, highestStreak, showStreakModal, isClient])
  
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