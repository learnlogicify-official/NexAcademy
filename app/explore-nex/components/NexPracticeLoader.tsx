"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code, ChevronRight } from "lucide-react"
import { colors } from "@/lib/theme/colors"
import type { App } from "../types"
import { SelectedAppLoader } from "./SelectedAppLoader"
import {
  globalNexPracticeLoadingState,
  globalExitAnimationState,
  globalExitPosition,
  addStateChangeListener
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
      setIsLoading(false);
      setIsAnimatingExit(false);
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

    return () => {
      window.removeEventListener('nexacademy:routeChangeStart', onRouteChangeStart);
      window.removeEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete);
      unsubscribe();
    };
  }, []);

  if (!isLoading && !selectedApp) return null;

  return (
    <AnimatePresence>
      {isLoading && selectedApp && (
        <>
          {/* Backdrop blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isAnimatingExit ? 0.2 : 0.5 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-md"
            style={{
              backdropFilter: isAnimatingExit ? "blur(5px)" : "blur(10px)",
              WebkitBackdropFilter: isAnimatingExit ? "blur(5px)" : "blur(10px)"
            }}
          />
          
          {/* Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: isAnimatingExit ? exitPosition.x - 55 : 0, 
              y: isAnimatingExit ? exitPosition.y - 55 : 0, 
              scale: isAnimatingExit ? 0.4 : 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isAnimatingExit ? 0.8 : 0.5,
              ease: "anticipate"
            }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10000]"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: isAnimatingExit ? "center center" : "center center"
            }}
          >
            <SelectedAppLoader 
              app={selectedApp} 
              isLoading={true}
              isExiting={isAnimatingExit}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
