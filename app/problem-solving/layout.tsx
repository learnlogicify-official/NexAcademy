import type React from "react"

export default function ProblemSolvingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout replaces the standard app UI with a fullscreen layout
  // but works within the existing document structure
  return <div className="fixed inset-0 z-50 w-full h-full bg-[#0d0d0d] text-white overflow-hidden">{children}</div>
}

