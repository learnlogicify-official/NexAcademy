import type { Metadata } from "next"
import type { ReactNode } from "react"
import { NexPracticeLoader } from "@/app/explore-nex/components/NexPracticeLoader"

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
      {/* Loading overlay - only the loader is needed since the dashboard shell is in the parent layout */}
      <NexPracticeLoader />
      {children}
    </>
  )
} 