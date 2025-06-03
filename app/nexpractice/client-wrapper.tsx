"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Use dynamic import with SSR disabled in a client component
// Set loading to null since NexPracticeLoader in the layout handles loading
const NexPracticeClient = dynamic(() => import('./nexpractice-client'), {
  ssr: false,
  loading: () => null
});

// Client component wrapper
export default function ClientWrapper({ 
  totalSolved, 
  streak, 
  averageTimeMinutes 
}: { 
  totalSolved: number; 
  streak: number; 
  averageTimeMinutes: number; 
}) {
  const [mounted, setMounted] = useState(false);
  
  // Dispatch routeChangeComplete event when this component mounts
  useEffect(() => {
    setMounted(true);
    
    // Signal that navigation to nexpractice is complete
    window.dispatchEvent(new Event("nexacademy:routeChangeComplete"));
    
    // If this custom event isn't caught, try to directly access the global function
    try {
      if (typeof window !== 'undefined' && window.hasOwnProperty('stopNexPracticeLoading')) {
        (window as any).stopNexPracticeLoading();
      }
    } catch (e) {
      console.error("Failed to stop NexPractice loader:", e);
    }
  }, []);
  
  if (!mounted) return null;
  
  return <NexPracticeClient totalSolved={totalSolved} streak={streak} averageTimeMinutes={averageTimeMinutes} />;
} 