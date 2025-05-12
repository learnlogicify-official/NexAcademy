"use client"

import dynamic from 'next/dynamic'

// Import a loading fallback component for when the page is loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen w-full bg-gray-900">
    <div className="text-white text-lg">Loading...</div>
  </div>
)

// Dynamically import the actual page component with no SSR
const ExploreNexContent = dynamic(
  () => import('./ExploreNexContent'),
  { 
    ssr: false,
    loading: () => <LoadingFallback />
  }
)

// Simple wrapper that renders the dynamic component
export default function ExplorePage() {
  return <ExploreNexContent />
}
