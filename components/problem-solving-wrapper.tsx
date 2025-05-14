"use client"

import { useState, useEffect, useCallback } from "react"
import { StreakIntegration } from "./streak-integration"

interface ProblemSolvingWrapperProps {
  children: React.ReactNode
}

// Create a global handler object to store the callback function
type StreakHandler = {
  showModal?: (data: {
    streakEstablished?: boolean;
    currentStreak?: number;
    highestStreak?: number;
  }) => void;
};

// Global object to store the streak handler function
export const streakHandler: StreakHandler = {};

// Store pending streak data to show when a handler becomes available
let pendingStreakData: { 
  streakEstablished?: boolean; 
  currentStreak?: number; 
  highestStreak?: number;
} | null = null;

/**
 * A wrapper component for problem solving pages that handles streak modal display
 * 
 * This component listens for submission success events and triggers the streak modal
 * when a streak is established. It's designed to work with GraphQL-based submissions.
 * 
 * IMPORTANT: The streak modal is ONLY shown when a user makes a correct submission,
 * not on initial page load. This is controlled by the streakEstablished flag.
 */
export function ProblemSolvingWrapper({ children }: ProblemSolvingWrapperProps) {
  const [streakData, setStreakData] = useState({
    streakEstablished: false,
    currentStreak: 0,
    highestStreak: 0
  })
  const [isClient, setIsClient] = useState(false)
  
  // Function to set streak data and show modal
  const handleShowModal = useCallback((data: {
    streakEstablished?: boolean;
    currentStreak?: number;
    highestStreak?: number;
  }) => {
    console.log("[ProblemSolvingWrapper] Direct show modal call with data:", data);
    const { streakEstablished, currentStreak, highestStreak } = data || {};
    
    // Only show the modal if streakEstablished is true (after a successful submission)
    if (streakEstablished) {
      setStreakData({
        streakEstablished: true,
        currentStreak: currentStreak || 0,
        highestStreak: highestStreak || 0
      });
    }
  }, []);
  
  // Initialize client state
  useEffect(() => {
    setIsClient(true)
    console.log("[ProblemSolvingWrapper] Component mounted, registering global handler")
    
    // Register the global handler when the component mounts
    streakHandler.showModal = handleShowModal;
    
    // Check if there's pending streak data to show
    if (pendingStreakData) {
      console.log("[ProblemSolvingWrapper] Found pending streak data:", pendingStreakData);
      handleShowModal(pendingStreakData);
      pendingStreakData = null;
    }
    
    // Cleanup function
    return () => {
      console.log("[ProblemSolvingWrapper] Component unmounting, removing global handler")
      streakHandler.showModal = undefined;
    }
  }, [handleShowModal])
  
  // Reset streak state when modal is closed
  const handleStreakModalClosed = useCallback(() => {
    console.log("[ProblemSolvingWrapper] Modal closed, resetting streak established flag")
    setStreakData(prev => ({
      ...prev,
      streakEstablished: false
    }))
  }, [])
  
  // Log streak data changes
  useEffect(() => {
    if (isClient) {
      console.log("[ProblemSolvingWrapper] Current streak data:", streakData)
    }
  }, [streakData, isClient])
  
  if (!isClient) return <>{children}</>
  
  return (
    <>
      {children}
      
      {/* Streak Modal Integration */}
      <StreakIntegration 
        streakEstablished={streakData.streakEstablished}
        currentStreak={streakData.currentStreak}
        highestStreak={streakData.highestStreak}
        onCheckStreak={handleStreakModalClosed}
      />
    </>
  )
}

/**
 * Helper function to trigger streak modal display from anywhere in the application
 * 
 * Uses a direct callback instead of custom events
 * Note: The streak modal is now only shown for the first correct submission
 * as controlled by the streakEstablished flag in GraphQL responses
 */
export function triggerStreakModal(data: { 
  streakEstablished?: boolean, 
  currentStreak?: number, 
  highestStreak?: number 
}) {
  console.log("[triggerStreakModal] Called with data:", data);
  
  // Don't proceed if streakEstablished is not true
  if (!data.streakEstablished) {
    console.log("[triggerStreakModal] streakEstablished is not true, not showing modal");
    return false;
  }
  
  // Store the data for later use if handler isn't available
  pendingStreakData = data;
  
  // Call the global handler directly if it exists
  if (streakHandler.showModal) {
    console.log("[triggerStreakModal] Calling registered handler");
    streakHandler.showModal(data);
    pendingStreakData = null; // Clear pending data since we've used it
    return true;
  } else {
    console.log("[triggerStreakModal] No handler registered yet, storing data for later");
    
    // Try again after a short delay - try multiple times with increasing delays
    const retryIntervals = [500, 1000, 2000, 3000]; // Multiple retries with increasing delays
    
    retryIntervals.forEach((delay, index) => {
      setTimeout(() => {
        if (streakHandler.showModal && pendingStreakData) {
          console.log(`[triggerStreakModal] Calling handler after ${delay}ms delay (attempt ${index + 1})`);
          streakHandler.showModal(pendingStreakData);
          pendingStreakData = null; // Clear pending data since we've used it
        } else if (index === retryIntervals.length - 1 && !streakHandler.showModal) {
          console.log(`[triggerStreakModal] Handler still not available after all retry attempts`);
        }
      }, delay);
    });
    
    return false;
  }
} 