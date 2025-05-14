"use client"

import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserStreak } from '@/app/actions/streak-actions'

/**
 * Custom hook to manage streak modal display logic
 * 
 * Shows the streak modal when a new streak is established or maintained
 * Modal now only appears on first correct submission of the day, not on page visit
 */
export function useStreakModal(userId?: string) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    highestStreak: 0
  })
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false)
  
  // Log initial state and prop changes
  useEffect(() => {
    console.log("[useStreakModal] Hook initialized with userId:", userId)
  }, [userId])
  
  // Log state changes
  useEffect(() => {
    console.log("[useStreakModal] State changed:", { isModalOpen, streakData, hasCheckedInitial })
  }, [isModalOpen, streakData, hasCheckedInitial])
  
  // Function to check if the streak modal should be shown - no longer runs automatically,
  // will only be triggered by a correct submission via the showStreakModal function
  const checkAndShowStreakModal = useCallback(async () => {
    console.log("[useStreakModal] checkAndShowStreakModal is now a no-op - only shows on successful submission")
    setHasCheckedInitial(true)
  }, [])
  
  // Function to manually trigger the streak modal (used after streak updates)
  const showStreakModal = useCallback(async (forceShow = false) => {
    console.log("[useStreakModal] showStreakModal called with forceShow:", forceShow)
    
    // Force show can work without userId for special cases like after submission
    if (!userId && !forceShow) {
      console.log("[useStreakModal] No userId and not force showing, skipping modal display")
      return
    }
    
    try {
      // Get streak data from API unless we're force showing
      if (!forceShow) {
        console.log("[useStreakModal] Fetching streak data from API")
        const userStreak = await getCurrentUserStreak()
        
        if (userStreak) {
          console.log("[useStreakModal] Setting streak data from API:", userStreak)
          setStreakData({
            currentStreak: userStreak.currentStreak,
            highestStreak: userStreak.longestStreak
          })
        }
      }
      
      // Always show the modal when requested explicitly
      console.log("[useStreakModal] Setting modal to open")
      setIsModalOpen(true)
      
      // Ensure modal is visible in DOM after state update
      setTimeout(() => {
        try {
          // Force modal to be visible after React has had time to update DOM
          const dialog = document.querySelector('[data-dialog-name="streak-modal"]');
          if (dialog) {
            console.log('[useStreakModal] Found streak modal, ensuring it is visible');
            dialog.setAttribute('data-state', 'open');
            dialog.setAttribute('aria-hidden', 'false');
          }
        } catch (e) {
          console.error('[useStreakModal] Error ensuring modal visibility:', e);
        }
      }, 100);
      
     
    } catch (error) {
      console.error('[useStreakModal] Error showing streak modal:', error)
      // Show modal anyway in case of error
      setIsModalOpen(true)
    }
  }, [userId])
  
  // Close the modal
  const closeStreakModal = useCallback(() => {
    console.log("[useStreakModal] Closing streak modal")
    setIsModalOpen(false)
  }, [])
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Mark as checked, but no longer automatically show the modal on page load
    if (userId && !hasCheckedInitial) {
      setHasCheckedInitial(true)
    }
  }, [userId, hasCheckedInitial, checkAndShowStreakModal])
  
  return {
    isStreakModalOpen: isModalOpen,
    streakData,
    showStreakModal,
    closeStreakModal
  }
} 