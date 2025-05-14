"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CodingDashboard } from "@/components/coding-portfolio/dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CodingPortfolioDashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-black">
        <div className="container max-w-7xl pt-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <Link href="/coding-portfolio">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Back to Portfolio</span>
              </Button>
            </Link>
            <Link href="/coding-portfolio/connect">
              <Button variant="outline">Manage Connections</Button>
            </Link>
          </div>
          
          <CodingDashboard />
        </div>
      </div>
    </DashboardLayout>
  )
} 