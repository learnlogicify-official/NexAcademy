"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle, LockIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { pythonBasicsCourse } from "@/data/courses"

interface CourseChaptersSidebarProps {
  courseId: string
}

export function CourseChaptersSidebar({ courseId }: CourseChaptersSidebarProps) {
  const pathname = usePathname()
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  // In a real app, you would fetch the course data based on courseId
  // For now, we'll use the pythonBasicsCourse as a placeholder
  const course = pythonBasicsCourse

  // Mock lessons data for each module
  const moduleLessons: Record<string, { id: string; title: string; completed: boolean; inProgress: boolean }[]> = {
    "variables-data-types": [
      { id: "variables-intro", title: "Introduction to Variables", completed: true, inProgress: false },
      { id: "data-types", title: "Python Data Types", completed: true, inProgress: false },
      { id: "type-conversion", title: "Type Conversion", completed: false, inProgress: true },
      { id: "variables-practice", title: "Practice with Variables", completed: false, inProgress: false },
    ],
    "control-flow": [
      { id: "if-statements", title: "If Statements", completed: true, inProgress: false },
      { id: "if-else", title: "If-Else Statements", completed: false, inProgress: true },
      { id: "nested-conditionals", title: "Nested Conditionals", completed: false, inProgress: false },
      { id: "logical-operators", title: "Logical Operators", completed: false, inProgress: false },
    ],
    functions: [
      { id: "function-basics", title: "Function Basics", completed: false, inProgress: false },
      { id: "parameters-arguments", title: "Parameters and Arguments", completed: false, inProgress: false },
      { id: "return-values", title: "Return Values", completed: false, inProgress: false },
      { id: "scope", title: "Variable Scope", completed: false, inProgress: false },
    ],
    loops: [
      { id: "for-loops", title: "For Loops", completed: false, inProgress: false },
      { id: "while-loops", title: "While Loops", completed: false, inProgress: false },
      { id: "loop-control", title: "Loop Control Statements", completed: false, inProgress: false },
      { id: "nested-loops", title: "Nested Loops", completed: false, inProgress: false },
    ],
    "lists-tuples": [
      { id: "lists-intro", title: "Introduction to Lists", completed: false, inProgress: false },
      { id: "list-methods", title: "List Methods", completed: false, inProgress: false },
      { id: "tuples-intro", title: "Introduction to Tuples", completed: false, inProgress: false },
      { id: "lists-vs-tuples", title: "Lists vs Tuples", completed: false, inProgress: false },
    ],
  }

  // Determine which module is active based on the current URL
  const activeModuleId = pathname.includes("/lessons/") ? pathname.split("/lessons/")[1].split("/")[0] : ""

  // Initialize expanded state for the active module
  useEffect(() => {
    if (activeModuleId) {
      setExpandedModules((prev) => ({
        ...prev,
        [activeModuleId]: true,
      }))
    }
  }, [activeModuleId])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const getStatusIcon = (status: string, inProgress = false) => {
    if (status === "Completed" || status === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (status === "In Progress" || inProgress) {
      return <PlayCircle className="h-4 w-4 text-blue-500" />
    } else if (status === "Locked") {
      return <LockIcon className="h-4 w-4 text-gray-400" />
    }
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-2">
          {course.modules.map((module) => (
            <div key={module.id} className="mb-2">
              <Button
                variant="ghost"
                className={`w-full justify-between p-2 h-auto ${activeModuleId === module.id ? "bg-muted" : ""}`}
                onClick={() => toggleModule(module.id)}
                disabled={module.status === "Locked"}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(module.status)}
                  <span className="text-sm font-medium">{module.title}</span>
                </div>
                {module.status !== "Locked" &&
                  (expandedModules[module.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </Button>

              {expandedModules[module.id] && moduleLessons[module.id] && (
                <div className="ml-6 mt-1 border-l border-border pl-2">
                  {moduleLessons[module.id].map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/my-learning/${courseId}/lessons/${module.id}/${lesson.id}`}
                      className={`flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted ${
                        pathname.includes(lesson.id) ? "bg-muted" : ""
                      }`}
                    >
                      {getStatusIcon(lesson.completed, lesson.inProgress)}
                      <span>{lesson.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
