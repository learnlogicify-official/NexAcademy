'use client';

import { Leaderboard } from "@/components/leaderboard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Suspense } from "react";

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }>
        <Leaderboard />
      </Suspense>
    </DashboardLayout>
  )
}

