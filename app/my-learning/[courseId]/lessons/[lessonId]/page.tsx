"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { pythonBasicsCourse } from "@/data/courses"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonHeader } from "./components/lesson-header"
import { VideoSection } from "./components/video-section"
import { ContentSection } from "./components/content-section"
import { PracticeSection } from "./components/practice-section"
import { AssessmentSection } from "./components/assessment-section"
import { ChapterIntroSection } from "./components/chapter-intro-section"
import { BookOpen, ClipboardCheck, Code, FileText, Video } from "lucide-react"

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("intro")
  const router = useRouter()

  // Find the current module
  const currentModule = pythonBasicsCourse.modules.find((module) => module.id === params.lessonId)

  // Find the next and previous modules
  const moduleIndex = pythonBasicsCourse.modules.findIndex((module) => module.id === params.lessonId)

  const prevModule = moduleIndex > 0 ? pythonBasicsCourse.modules[moduleIndex - 1] : null

  const nextModule =
    moduleIndex < pythonBasicsCourse.modules.length - 1 ? pythonBasicsCourse.modules[moduleIndex + 1] : null

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const navigateToProblem = (difficulty: string, problemNumber: number) => {
    // This would navigate to the problem-solving page with the correct problem
    router.push(`/problem-solving/${params.lessonId}-${difficulty.toLowerCase()}-${problemNumber}`)
  }

  const navigateToModule = (moduleId: string) => {
    router.push(`/my-learning/${params.courseId}/lessons/${moduleId}`)
  }

  if (loading || !currentModule) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-full max-w-md mb-4" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Header with back button */}
        <div>
          <LessonHeader courseId={params.courseId} module={currentModule} />
        </div>

        {/* Navigation tabs */}
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mb-4 grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="intro" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Intro
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Chapter Intro section */}
            <TabsContent value="intro" className="h-full mt-0 overflow-hidden">
              <ChapterIntroSection module={currentModule} />
            </TabsContent>

            {/* Video section */}
            <TabsContent value="video" className="h-full mt-0 overflow-hidden">
              <VideoSection module={currentModule} />
            </TabsContent>

            {/* Content section */}
            <TabsContent value="content" className="h-full mt-0 overflow-hidden">
              <ContentSection module={currentModule} />
            </TabsContent>

            {/* Practice section */}
            <TabsContent value="practice" className="h-full mt-0 overflow-hidden">
              <PracticeSection module={currentModule} onNavigateToProblem={navigateToProblem} />
            </TabsContent>

            {/* Assessment section */}
            <TabsContent value="assessment" className="h-full mt-0 overflow-hidden">
              <AssessmentSection module={currentModule} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
