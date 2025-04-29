"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Code, FileText, Lightbulb, Target, Video, ClipboardCheck } from "lucide-react"

// Custom scrollbar hiding styles
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`

interface ChapterIntroSectionProps {
  module: {
    id: string
    title: string
    description: string
    level: string
  }
}

export function ChapterIntroSection({ module }: ChapterIntroSectionProps) {
  // Get module-specific learning objectives (limited to 3 for space)
  const getLearningObjectives = (moduleId: string) => {
    const allObjectives = {
      "variables-data-types": [
        "Understand what variables are and how they work in Python",
        "Learn about different data types: integers, floats, strings, and booleans",
        "Practice type conversion between different data types",
      ],
      "control-flow": [
        "Learn how to use if, elif, and else statements",
        "Understand comparison and logical operators",
        "Master nested conditional statements",
      ],
      functions: [
        "Understand how to define and call functions",
        "Learn about function parameters and return values",
        "Master default parameters and keyword arguments",
      ],
      loops: [
        "Learn how to use for loops with range and collections",
        "Understand while loops and when to use them",
        "Master loop control statements: break, continue, and pass",
      ],
      "lists-tuples": [
        "Understand the differences between lists and tuples",
        "Learn common operations for lists: append, insert, remove",
        "Master slicing and indexing techniques",
      ],
      default: [
        "Understand key concepts in this module",
        "Practice applying these concepts in real-world scenarios",
        "Master the techniques through hands-on exercises",
      ],
    }

    return allObjectives[moduleId as keyof typeof allObjectives] || allObjectives.default
  }

  // Get module-specific chapter content
  const getChapterContent = (moduleId: string) => {
    switch (moduleId) {
      case "variables-data-types":
        return {
          duration: "45 min",
          videoCount: 2,
          readingCount: 3,
          exerciseCount: 10,
          quizCount: 1,
        }
      case "control-flow":
        return {
          duration: "50 min",
          videoCount: 2,
          readingCount: 2,
          exerciseCount: 12,
          quizCount: 1,
        }
      case "functions":
        return {
          duration: "55 min",
          videoCount: 3,
          readingCount: 2,
          exerciseCount: 15,
          quizCount: 1,
        }
      case "loops":
        return {
          duration: "60 min",
          videoCount: 2,
          readingCount: 3,
          exerciseCount: 12,
          quizCount: 1,
        }
      case "lists-tuples":
        return {
          duration: "65 min",
          videoCount: 3,
          readingCount: 2,
          exerciseCount: 15,
          quizCount: 1,
        }
      default:
        return {
          duration: "60 min",
          videoCount: 2,
          readingCount: 2,
          exerciseCount: 10,
          quizCount: 1,
        }
    }
  }

  const learningObjectives = getLearningObjectives(module.id)
  const chapterContent = getChapterContent(module.id)

  return (
    <>
      <style jsx global>
        {scrollbarHideStyles}
      </style>
      <div className="h-[calc(100vh-12rem)] flex flex-col pt-2">
        <Card className="overflow-hidden border-0 shadow-md bg-[#121212] flex-1 flex flex-col">
          <CardContent className="p-6 pb-10 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30">{module.level}</Badge>
                  {/* Title removed from here as it's already in the header */}
                </div>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{chapterContent.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-1.5">
                    {learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    Chapter Content
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Video className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Videos</div>
                        <div className="font-medium text-sm">{chapterContent.videoCount}</div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Readings</div>
                        <div className="font-medium text-sm">{chapterContent.readingCount}</div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Code className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Exercises</div>
                        <div className="font-medium text-sm">{chapterContent.exerciseCount}</div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Quizzes</div>
                        <div className="font-medium text-sm">{chapterContent.quizCount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg mt-auto mb-6">
              <h3 className="text-lg font-medium mb-1">How to use this chapter:</h3>
              <p className="text-gray-300 text-sm">
                Start with the introduction video, then read through the content material. Practice with the coding
                exercises and finally take the quiz to test your knowledge.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
