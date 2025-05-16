import type { Metadata } from "next"
import type { ReactNode } from "react"
import { NexPracticeLoader } from "@/app/explore-nex/components/NexPracticeLoader"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "NexPractice - Hands-on Coding Practice",
  description: "Practice coding with interactive exercises and challenges",
}

export default function NexPracticeLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {/* Loading overlay */}
      <NexPracticeLoader />
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  )
}
