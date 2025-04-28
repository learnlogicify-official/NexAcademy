"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, Circle, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import type { Module } from "@/data/courses"

interface ModuleListProps {
  modules: Module[]
  courseId: string
}

export function ModuleList({ modules, courseId }: ModuleListProps) {
  const router = useRouter()
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const handleModuleClick = (moduleId: string, status: string) => {
    if (status !== "Locked") {
      if (expandedModule === moduleId) {
        setExpandedModule(null)
      } else {
        setExpandedModule(moduleId)
      }
    }
  }

  const handleStartTest = (moduleId: string, testId: string) => {
    // Extract the difficulty level from the testId (e.g., "variables-data-types-easy")
    const difficultyMatch = testId.match(/-(\w+)$/)
    const difficulty = difficultyMatch ? difficultyMatch[1] : "easy"

    // For now, we'll use a fixed problem ID based on the module and difficulty
    // In a real app, this would fetch the first problem of the selected test level
    const problemId = `${moduleId}-${difficulty}-1`

    // Route to the problem-solving page with the problem ID
    router.push(`/problem-solving/${problemId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "In Progress":
        return <Circle className="h-5 w-5 text-primary" />
      case "Locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "Completed":
        return 100
      case "In Progress":
        return 50
      case "Locked":
        return 0
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20"
      case "Intermediate":
        return "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20"
      case "Advanced":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20"
      default:
        return "bg-primary/10 text-primary dark:bg-primary/20"
    }
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card
          key={module.id}
          className={`overflow-hidden border transition-all ${
            module.status !== "Locked" ? "hover:shadow-md" : "opacity-90"
          }`}
        >
          <CardContent className="p-0">
            <div
              className={`p-5 cursor-pointer ${module.status === "Locked" ? "cursor-not-allowed" : ""}`}
              onClick={() => handleModuleClick(module.id, module.status)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    {expandedModule === module.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                </div>
                <div className="ml-4">{getStatusIcon(module.status)}</div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <Badge variant="outline" className={getDifficultyColor(module.level)}>
                  {module.level}
                </Badge>
                <span className="text-muted-foreground">{module.xpAvailable} XP</span>
              </div>

              <Progress value={getProgressValue(module.status)} className="h-1.5 mt-4" />
            </div>

            {expandedModule === module.id && (
              <div className="border-t p-5 bg-muted/30">
                <h4 className="font-medium mb-3">Test Levels</h4>
                <div className="space-y-3">
                  {["Easy", "Intermediate", "Challenge"].map((level, index) => (
                    <div key={level} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              level === "Easy"
                                ? "bg-green-500/10 text-green-500"
                                : level === "Intermediate"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-red-500/10 text-red-500"
                            }
                          >
                            {level}
                          </Badge>
                          <h5 className="font-medium">
                            {level === "Easy"
                              ? "Basic Concepts"
                              : level === "Intermediate"
                                ? "Applied Knowledge"
                                : "Advanced Problems"}
                          </h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {level === "Easy"
                            ? "10 problems covering fundamental concepts"
                            : level === "Intermediate"
                              ? "10 problems requiring deeper understanding"
                              : "10 challenging problems to test mastery"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={module.status === "Locked" || (index > 0 && module.status !== "Completed")}
                        onClick={() => handleStartTest(module.id, `${module.id}-${level.toLowerCase()}`)}
                        className="gap-1"
                      >
                        {module.status === "Completed" ? "Review" : "Start"}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-4 flex justify-between items-center bg-card">
              <span className="text-sm text-muted-foreground">
                {module.status === "Locked"
                  ? "Complete previous module to unlock"
                  : module.status === "Completed"
                    ? "Module completed"
                    : "Continue module"}
              </span>

              {module.status !== "Locked" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleModuleClick(module.id, module.status)}
                >
                  {module.status === "Completed" ? "Review" : "Continue"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
