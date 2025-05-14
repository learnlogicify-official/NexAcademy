import { DashboardLayout } from "@/components/dashboard-layout"
import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodingStatsCard } from "@/components/coding-portfolio/stats-card"
import { CodingDashboard } from "@/components/coding-portfolio/dashboard"

export const metadata: Metadata = {
  title: "Coding Portfolio | NexAcademy",
  description: "Connect your coding profiles from various platforms and showcase your achievements",
}

export default function CodingPortfolioPage() {
  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">Coding Portfolio</h1>
            <Link href="/coding-portfolio/connect">
              <Button>Manage Platform Connections</Button>
            </Link>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
            Your unified coding metrics from multiple competitive programming platforms 
          </p>
        </div>
        
        <CodingDashboard />
      </div>
    </DashboardLayout>
  )
} 