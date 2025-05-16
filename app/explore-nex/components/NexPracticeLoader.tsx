"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code } from "lucide-react"
import { colors } from "@/lib/theme/colors"
import { Spinner } from "@/components/ui/spinner"
import type { App } from "../types"
import {
  globalNexPracticeLoadingState,
  globalExitAnimationState,
  globalExitPosition,
  addStateChangeListener,
  stopNexPracticeLoading
} from "../state"

export const NexPracticeLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(globalNexPracticeLoadingState);
  const [isAnimatingExit, setIsAnimatingExit] = useState(globalExitAnimationState);
  const [exitPosition, setExitPosition] = useState(globalExitPosition);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  
  useEffect(() => {
    // Set initial app data for NexPractice
    setSelectedApp({
      id: "nexpractice",
      name: "NexPractice",
      description: "Hands-on practice exercises and coding challenges",
      icon: Code,
      color: colors.nexpractice.primary.gradient,
      bgColor: colors.nexpractice.primary.background,
      lightColor: colors.nexpractice.primary.hex,
      isPro: true,
    });
    
    // Listen to navigation events
    const onRouteChangeStart = () => {
      setIsLoading(true);
    };

    const onRouteChangeComplete = () => {
      // Stop the loading animation when navigation completes
      stopNexPracticeLoading();
      setIsLoading(false);
      setIsAnimatingExit(false);
    };

    // Also listen for window load event to handle cases when navigation is complete
    const handleWindowLoad = () => {
      if (window.location.pathname === '/nexpractice') {
        stopNexPracticeLoading();
        setIsLoading(false);
        setIsAnimatingExit(false);
      }
    };

    // Subscribe to global state changes
    const unsubscribe = addStateChangeListener(() => {
      setIsLoading(globalNexPracticeLoadingState);
      setIsAnimatingExit(globalExitAnimationState);
      setExitPosition(globalExitPosition);
    });

    // Add event listeners for navigation
    window.addEventListener('nexacademy:routeChangeStart', onRouteChangeStart);
    window.addEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete);
    window.addEventListener('load', handleWindowLoad);
    
    // Check immediately if we're already on the nexpractice page
    if (window.location.pathname === '/nexpractice') {
      stopNexPracticeLoading();
    }

    return () => {
      window.removeEventListener('nexacademy:routeChangeStart', onRouteChangeStart);
      window.removeEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete);
      window.removeEventListener('load', handleWindowLoad);
      unsubscribe();
    };
  }, []);

  if (!isLoading && !selectedApp) return null;

  return (
    <AnimatePresence>
      {isLoading && selectedApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-[10000] bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm"
        >
          <Spinner size="md" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
