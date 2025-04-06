"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

interface TestNavigationProps {
  currentProblemIndex: number
  totalProblems: number
  onNavigate: (index: number) => void
  solvedProblems: number[]
}

export function TestNavigation({
  currentProblemIndex,
  totalProblems,
  onNavigate,
  solvedProblems,
}: TestNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`flex flex-col h-full bg-[#1a1a1a] border-l border-[#2d2d2d] transition-all duration-300 ${isCollapsed ? "w-12" : "w-20"}`}
    >
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-gray-400 hover:text-white self-end">
        <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="flex flex-col gap-2 items-center">
          {Array.from({ length: totalProblems }).map((_, index) => {
            const isCurrent = index === currentProblemIndex
            const isSolved = solvedProblems.includes(index)

            return (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCurrent ? "bg-[#0091FF] text-white" : isSolved ? "bg-green-500 text-white" : "bg-[#252525] text-gray-300"}
                  hover:opacity-90 transition-colors
                `}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

