"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { pythonBasicsCourse, moduleTestLevels, type TestLevel } from "@/data/courses"
import { Button } from "@/components/ui/button"
import { TestLevelCard } from "@/components/test-level-card"
import { ChevronLeft } from "lucide-react"

export default function TestLevelsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string

  const [testLevels, setTestLevels] = useState<TestLevel[]>([])
  const [moduleName, setModuleName] = useState("")

  useEffect(() => {
    // In a real app, this would fetch from an API
    if (moduleId && moduleTestLevels[moduleId]) {
      setTestLevels(moduleTestLevels[moduleId])

      const module = pythonBasicsCourse.modules.find((m) => m.id === moduleId)
      if (module) {
        setModuleName(module.title)
      }
    }
  }, [moduleId])

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 gap-1.5 text-gray-300 hover:text-white" onClick={handleBackToCourse}>
        <ChevronLeft className="h-4 w-4" />
        Back to Course
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{moduleName}: Test Levels</h1>
        <p className="text-gray-300">
          Complete each level to master the concepts and earn XP. Start with Level 1 and work your way up.
        </p>
      </div>

      <div className="space-y-6">
        {testLevels.map((testLevel, index) => (
          <TestLevelCard
            key={testLevel.id}
            testLevel={testLevel}
            isLocked={index > 0 && testLevels[index - 1].status !== "Completed"}
          />
        ))}
      </div>
    </div>
  )
}

