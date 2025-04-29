"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bookmark, BookmarkCheck, Share2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Course } from "@/data/courses"
import { getCourseTheme } from "@/lib/course-icons"
import { useRouter } from "next/navigation"
import { DiPython } from "react-icons/di"
import Link from "next/link"
import { GoHomeFill } from "react-icons/go"
import { LearningModeToggle } from "./learning-mode-toggle"

interface CourseHeaderProps {
  course: Course
  learningMode: "guided" | "explore"
  onLearningModeChange: (mode: "guided" | "explore") => void
}

export function CourseHeader({ course, learningMode, onLearningModeChange }: CourseHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const theme = getCourseTheme(course.title, [])
  const Icon = theme.icon
  const router = useRouter()

  const handleBack = () => {
    router.push("/my-learning")
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb navigation with learning mode toggle */}
      <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <ol className="flex items-center space-x-2 overflow-x-auto pb-1 w-full sm:w-auto">
          <li>
            <Link href="/" className="flex items-center hover:text-foreground transition-colors">
              <GoHomeFill className="h-4 w-4 flex-shrink-0" />
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            <Link href="/my-learning" className="hover:text-foreground transition-colors whitespace-nowrap">
              My Learning
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">{course.title}</span>
          </li>
        </ol>

        {/* Learning Mode Toggle */}
        <div className="self-end sm:self-auto">
          <LearningModeToggle mode={learningMode} onChange={onLearningModeChange} />
        </div>
      </nav>

      <div className="mb-8 bg-card rounded-xl overflow-hidden border border-border relative">
        {/* Add the buttons to the top right corner */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-card/80 backdrop-blur-sm"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarked ? "Remove bookmark" : "Bookmark course"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-card/80 backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share course</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative h-40 sm:h-48 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <DiPython className="h-48 w-48 sm:h-64 sm:w-64 text-primary" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-card to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                <DiPython className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{course.title}</h1>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {course.level}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1 max-w-2xl line-clamp-2 sm:line-clamp-none">
                  {course.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-8 sm:pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                {course.modules.length} Modules
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                {course.totalXP} XP Available
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                Estimated 12 hours
              </Badge>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
            <div className="flex-1 space-y-2 min-w-0 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-medium">
                  {course.xpEarned} / {course.totalXP} XP ({course.progress}%)
                </span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>

            <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-auto flex flex-col items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-lg px-3 sm:px-4 py-2 min-w-0 sm:min-w-[100px]">
                <span className="text-xl sm:text-2xl font-bold text-primary">{course.xpEarned}</span>
                <span className="text-xs text-muted-foreground">XP Earned</span>
              </div>
              <div className="flex-1 md:flex-auto flex flex-col items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-lg px-3 sm:px-4 py-2 min-w-0 sm:min-w-[100px]">
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  {Math.floor((course.xpEarned / course.totalXP) * 10)}
                </span>
                <span className="text-xs text-muted-foreground">Current Level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
