"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, Circle, ChevronRight } from "lucide-react"
import type { Module } from "@/data/courses"
import { useRouter } from "next/navigation"

interface ModuleCardProps {
  module: Module
  courseId: string
}

export function ModuleCard({ module, courseId }: ModuleCardProps) {
  const router = useRouter()

  const handleModuleClick = () => {
    if (module.status !== "Locked") {
      router.push(`/courses/${courseId}/${module.id}/tests`)
    }
  }

  const getStatusIcon = () => {
    switch (module.status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "In Progress":
        return <Circle className="h-5 w-5 text-[#0091FF]" />
      case "Locked":
        return <Lock className="h-5 w-5 text-gray-500" />
    }
  }

  const getProgressValue = () => {
    switch (module.status) {
      case "Completed":
        return 100
      case "In Progress":
        return 50
      case "Locked":
        return 0
    }
  }

  return (
    <Card
      className={`overflow-hidden border border-[#2d2d2d] bg-[#1a1a1a] transition-all ${
        module.status !== "Locked" ? "hover:shadow-md cursor-pointer" : "opacity-75"
      }`}
      onClick={handleModuleClick}
    >
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{module.description}</p>
            </div>
            <div className="ml-4">{getStatusIcon()}</div>
          </div>

          <div className="flex items-center justify-between text-sm mb-2">
            <Badge variant="outline" className="bg-[#252525] text-white border-[#3a3a3a]">
              {module.level}
            </Badge>
            <span className="text-gray-300">{module.xpAvailable} XP</span>
          </div>

          <Progress value={getProgressValue()} className="h-1.5 mt-4" />
        </div>

        <div className="border-t border-[#2d2d2d] p-4 flex justify-between items-center bg-[#1f1f1f]">
          <span className="text-sm text-gray-300">
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
              className="gap-1 text-[#0091FF] hover:text-[#0080e0] hover:bg-[#0091FF]/10"
            >
              {module.status === "Completed" ? "Review" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

