"use client"

import dynamic from 'next/dynamic'
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Dynamically import the actual page component with no SSR
const ExploreNexContent = dynamic(
  () => import('./ExploreNexContent'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
)

// Simple wrapper that renders the dynamic component
export default function ExplorePage() {
  return (
    <DashboardLayout>
      <ExploreNexContent />
    </DashboardLayout>
  )
}
