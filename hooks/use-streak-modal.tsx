"use client"

import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserStreak } from '@/app/actions/streak-actions'

/**
 * Custom hook to manage streak modal display logic
 * 
 * Shows the streak modal when a new streak is established or maintained
 * Uses local storage to avoid showing the modal multiple times on the same day
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
  
  // Function to check if the streak modal should be shown
  const checkAndShowStreakModal = useCallback(async () => {
    console.log("[useStreakModal] Checking if modal should be shown for user:", userId)
    if (!userId) return
    
    // Skip if we've already performed the initial check
    if (hasCheckedInitial) {
      console.log("[useStreakModal] Initial check already performed, skipping")
      return
    }
    
    // Create a key specific to this user and today's date
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const storageKey = `streak-modal-shown-${userId}-${today}`
    
    // Check if we've already shown the modal today
    const alreadyShown = localStorage.getItem(storageKey)
    if (alreadyShown) return
    
    try {
      // Get the user's current streak information using server action
      const userStreak = await getCurrentUserStreak()
      
      // If user has an active streak (at least 1 day), show the modal
      if (userStreak && userStreak.currentStreak > 0) {
        setStreakData({
          currentStreak: userStreak.currentStreak,
          highestStreak: userStreak.longestStreak
        })
        setIsModalOpen(true)
        
        // Mark that we've shown the modal today
        localStorage.setItem(storageKey, 'true')
      }
    } catch (error) {
      console.error('Error checking streak for modal:', error)
    } finally {
      // Mark that we've performed the initial check
      setHasCheckedInitial(true)
    }
  }, [userId, hasCheckedInitial])
  
  // Function to manually trigger the streak modal (useful after streak updates)
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
    
    // Check if we should show the modal on initial load
    if (userId && !hasCheckedInitial) {
      // Add a slight delay to ensure DOM is fully loaded
      const timer = setTimeout(() => {
        checkAndShowStreakModal()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [userId, hasCheckedInitial, checkAndShowStreakModal])
  
  return {
    isStreakModalOpen: isModalOpen,
    streakData,
    showStreakModal,
    closeStreakModal
  }
} 