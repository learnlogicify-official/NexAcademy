"use client"

import dynamic from 'next/dynamic'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useState, useEffect } from 'react'

// Dynamically import the actual page component with no SSR
const ExploreNexContent = dynamic(
  () => import('../../explore-nex/ExploreNexContent'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
)

// Simple wrapper that renders the dynamic component
export default function ExplorePage() {
  // Random ID to prove this component reloads while shell persists
  const [pageId] = useState(Math.floor(Math.random() * 10000));
  
  useEffect(() => {
    console.log(`ExploreNex Page ID: ${pageId}`);
  }, [pageId]);
  
  return (
    <>
      {/* Hidden debug info to verify page changes */}
      <div className="text-[8px] text-blue-400 fixed bottom-0 right-0 opacity-50 z-50">
        ExploreNex Page ID: {pageId}
      </div>
      <ExploreNexContent />
    </>
  )
} 