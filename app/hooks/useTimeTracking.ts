"use client";

import { useEffect, useRef, useCallback } from 'react';

// Increase heartbeat interval to 5 minutes for less frequent updates
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
// Only update if more than 30 seconds of active time
const MIN_UPDATE_THRESHOLD = 30 * 1000; // 30 seconds
// Consider user inactive after 30 seconds of no interaction
const INACTIVITY_THRESHOLD = 30 * 1000; // 30 seconds

interface TimeTrackingOptions {
  problemId: string;
  onTimeUpdate?: (timeSpent: number) => void;
}

export function useTimeTracking({ problemId, onTimeUpdate }: TimeTrackingOptions) {
  const activeTimeRef = useRef<number>(0); // Total active time accumulated
  const lastActivityRef = useRef<number>(Date.now()); // Last user activity
  const sessionStartRef = useRef<number>(Date.now()); // Current session start
  const isActiveRef = useRef<boolean>(true); // Is user currently active
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  const isUpdatingRef = useRef<boolean>(false); // Prevent concurrent updates
  const hasFlushedRef = useRef<boolean>(false); // NEW: To deduplicate final update

  // Function to send time update to the server (with deduplication)
  const sendTimeUpdate = useCallback(async (activeTimeMs: number, isHeartbeat = false) => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      return;
    }

    // Only update if enough active time has passed
    if (activeTimeMs < MIN_UPDATE_THRESHOLD && isHeartbeat) {
      return;
    }

    isUpdatingRef.current = true;

    try {
      const response = await fetch('/api/problem/time-spent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId,
          timeSpentMs: activeTimeMs,
          isHeartbeat,
        }),
      });

      if (response.ok) {
        lastUpdateRef.current = Date.now();
        // Reset active time after successful update
        activeTimeRef.current = 0;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to update time spent:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error updating time spent:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [problemId]);

  // Update active time when user becomes inactive
  const updateActiveTime = useCallback(() => {
    if (isActiveRef.current) {
      const now = Date.now();
      const sessionTime = now - sessionStartRef.current;
      activeTimeRef.current += sessionTime;
      sessionStartRef.current = now;
    }
  }, []);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    
    if (!isActiveRef.current) {
      // User became active again
      isActiveRef.current = true;
      sessionStartRef.current = now;
    }
    
    lastActivityRef.current = now;
  }, []);

  // Check for inactivity
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    if (isActiveRef.current && timeSinceLastActivity > INACTIVITY_THRESHOLD) {
      // User became inactive
      updateActiveTime();
      isActiveRef.current = false;
    }
  }, [updateActiveTime]);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden - update active time and send update
      updateActiveTime();
      isActiveRef.current = false;
      
      if (activeTimeRef.current >= MIN_UPDATE_THRESHOLD) {
        sendTimeUpdate(activeTimeRef.current);
      }
    } else {
      // Page is visible again - reset session start
      const now = Date.now();
      isActiveRef.current = true;
      sessionStartRef.current = now;
      lastActivityRef.current = now;
    }
  }, [updateActiveTime, sendTimeUpdate]);

  // Setup activity tracking and heartbeat
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Setup inactivity checker (every 5 seconds)
    const inactivityChecker = setInterval(checkInactivity, 5000);

    // Setup heartbeat for periodic updates
    heartbeatIntervalRef.current = setInterval(() => {
      updateActiveTime();
      
      const totalActiveTime = activeTimeRef.current;
      if (totalActiveTime >= MIN_UPDATE_THRESHOLD) {
        sendTimeUpdate(totalActiveTime, true);
      }
      
      // Call onTimeUpdate if provided
      onTimeUpdate?.(totalActiveTime);
    }, HEARTBEAT_INTERVAL);

    // Setup visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      clearInterval(inactivityChecker);
      clearInterval(heartbeatIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Only flush if not already flushed by beforeunload
      if (!hasFlushedRef.current) {
        updateActiveTime();
        if (activeTimeRef.current >= MIN_UPDATE_THRESHOLD) {
          sendTimeUpdate(activeTimeRef.current);
          hasFlushedRef.current = true;
          activeTimeRef.current = 0;
        }
      }
    };
  }, [problemId, handleUserActivity, checkInactivity, handleVisibilityChange, updateActiveTime, sendTimeUpdate, onTimeUpdate]);

  // Setup beforeunload handler (only for significant active time)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasFlushedRef.current) {
        updateActiveTime();
        // Always send any nonzero time, even if < threshold, on unload
        if (activeTimeRef.current > 0 && !isUpdatingRef.current) {
          navigator.sendBeacon(
            '/api/problem/time-spent',
            JSON.stringify({ problemId, timeSpentMs: activeTimeRef.current })
          );
          hasFlushedRef.current = true;
          activeTimeRef.current = 0;
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [problemId, updateActiveTime]);
} 