"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, Circle, FileText, Trophy } from "lucide-react"
import type { TestLevel } from "@/data/courses"
import { useRouter } from "next/navigation"

interface TestLevelCardProps {
  testLevel: TestLevel
  isLocked?: boolean
}

export function TestLevelCard({ testLevel, isLocked = false }: TestLevelCardProps) {
  const router = useRouter()

  const handleStartTest = () => {
    if (!isLocked && testLevel.status !== "Locked") {
      // Route to the problem-solving page
      router.push(`/problem-solving/${testLevel.id}`)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-500"
      case "Intermediate":
        return "bg-[#0091FF]/10 text-[#0091FF]"
      case "Challenge":
        return "bg-purple-500/10 text-purple-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusIcon = () => {
    if (isLocked || testLevel.status === "Locked") {
      return <Lock className="h-5 w-5 text-gray-500" />
    }

    switch (testLevel.status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "In Progress":
        return <Circle className="h-5 w-5 text-[#0091FF]" />
      case "Not Started":
        return <Circle className="h-5 w-5 text-gray-300" strokeWidth={1} />
    }
  }

  return (
    <Card
      className={`overflow-hidden border border-[#2d2d2d] bg-[#1a1a1a] transition-all ${
        isLocked || testLevel.status === "Locked" ? "opacity-75" : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Badge className={`mb-2 ${getDifficultyColor(testLevel.difficulty)}`}>{testLevel.difficulty}</Badge>
              <h3 className="text-lg font-semibold text-white">{testLevel.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{testLevel.description}</p>
            </div>
            <div className="ml-4">{getStatusIcon()}</div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-300">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>{testLevel.problemCount} Problems</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-300">
              <Trophy className="h-4 w-4 text-[#0091FF]" />
              <span>{testLevel.xpReward} XP</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2d2d2d] p-4 flex justify-between items-center bg-[#1f1f1f]">
          {isLocked || testLevel.status === "Locked" ? (
            <span className="text-sm text-gray-300">Complete previous level to unlock</span>
          ) : (
            <span className="text-sm text-gray-300">
              {testLevel.status === "Completed"
                ? "All problems completed"
                : testLevel.status === "In Progress"
                  ? "Continue where you left off"
                  : "Start solving problems"}
            </span>
          )}

          <Button
            size="sm"
            disabled={isLocked || testLevel.status === "Locked"}
            onClick={handleStartTest}
            className={
              testLevel.status === "Completed" ? "bg-green-600 hover:bg-green-700" : "bg-[#0091FF] hover:bg-[#0080e0]"
            }
          >
            {testLevel.status === "Completed" ? "Review" : "Start Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

