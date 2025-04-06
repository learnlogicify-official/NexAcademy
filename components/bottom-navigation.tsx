"use client"

import { Button } from "@/components/ui/button"
import { Play, Send, ChevronLeft, ChevronRight } from "lucide-react"

interface BottomNavigationProps {
  onPrev: () => void
  onNext: () => void
  onRun: () => void
  onSubmit: () => void
  isRunning: boolean
  isSubmitting: boolean
  hasPrev: boolean
  hasNext: boolean
}

export function BottomNavigation({
  onPrev,
  onNext,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  hasPrev,
  hasNext,
}: BottomNavigationProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border-t border-[#2d2d2d]">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev} className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          className="gap-1 min-w-[80px]"
        >
          {isRunning ? (
            <span className="flex items-center gap-1">
              <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-white rounded-full"></div>
              Running...
            </span>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run
            </>
          )}
        </Button>

        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          className="gap-1 min-w-[80px] bg-[#0091FF] hover:bg-[#0080e0]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-white rounded-full"></div>
              Submitting...
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit
            </>
          )}
        </Button>
      </div>

      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext} className="gap-1">
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

