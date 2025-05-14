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
    timezoneOffset?: number;
  }) => void;
};

// Global object to store the streak handler function
export const streakHandler: StreakHandler = {};

// Store pending streak data to show when a handler becomes available
let pendingStreakData: { 
  streakEstablished?: boolean; 
  currentStreak?: number; 
  highestStreak?: number;
  timezoneOffset?: number;
} | null = null;

/**
 * Trigger the streak modal from anywhere in the code
 * 
 * @param data Streak data to show in the modal
 */
export function triggerStreakModal(data: {
  streakEstablished?: boolean;
  currentStreak?: number;
  highestStreak?: number;
  timezoneOffset?: number;
}) {
  console.log("[triggerStreakModal] Called with data:", data);
  
  // If we have a registered handler, call it
  if (streakHandler.showModal) {
    console.log("[triggerStreakModal] Handler found, calling it");
    streakHandler.showModal(data);
  } else {
    // Store pending streak data
    console.log("[triggerStreakModal] No handler found, storing data");
    pendingStreakData = data;
  }
}

/**
 * Component that wraps problem solving pages and provides streak functionality
 */
export function ProblemSolvingWrapper({ children }: ProblemSolvingWrapperProps) {
  // Track streak state
  const [streakEstablished, setStreakEstablished] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number | undefined>(undefined);
  const [highestStreak, setHighestStreak] = useState<number | undefined>(undefined);
  const [timezoneOffset, setTimezoneOffset] = useState<number | undefined>(undefined);
  
  // Get the current timezone offset on client
  useEffect(() => {
    setTimezoneOffset(new Date().getTimezoneOffset());
  }, []);
  
  // Register our handler with the global handler object
  useEffect(() => {
    // Define the handler function
    streakHandler.showModal = (data) => {
      console.log("[ProblemSolvingWrapper] Show modal handler called with:", data);
      setStreakEstablished(!!data.streakEstablished);
      setCurrentStreak(data.currentStreak);
      setHighestStreak(data.highestStreak);
      
      // Use provided timezone offset or fall back to our own
      if (data.timezoneOffset !== undefined) {
        setTimezoneOffset(data.timezoneOffset);
      }
    };
    
    // Check for pending streak data
    if (pendingStreakData) {
      console.log("[ProblemSolvingWrapper] Processing pending streak data:", pendingStreakData);
      streakHandler.showModal(pendingStreakData);
      pendingStreakData = null;
    }
    
    // Clean up
    return () => {
      console.log("[ProblemSolvingWrapper] Unregistering streak handler");
      delete streakHandler.showModal;
    };
  }, []);
  
  // Reset streak established state after modal is shown
  const handleCheckStreak = useCallback((showModal: boolean) => {
    if (!showModal && streakEstablished) {
      console.log("[ProblemSolvingWrapper] Resetting streak established state");
      setStreakEstablished(false);
    }
  }, [streakEstablished]);
  
  return (
    <>
      {children}
      <StreakIntegration
        streakEstablished={streakEstablished}
        currentStreak={currentStreak}
        highestStreak={highestStreak}
        onCheckStreak={handleCheckStreak}
        timezoneOffset={timezoneOffset}
      />
    </>
  );
} 