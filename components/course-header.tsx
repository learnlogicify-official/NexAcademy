import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronRight } from "lucide-react"
import type { Course } from "@/data/courses"

interface CourseHeaderProps {
  course: Course
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{course.title}</h1>
            <Badge variant="outline" className="bg-[#252525] text-white border-[#3a3a3a]">
              {course.level}
            </Badge>
          </div>
          <p className="text-gray-300 max-w-2xl">{course.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 bg-[#252525] px-4 py-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{course.xpEarned}</div>
            <div className="text-xs text-gray-300">XP Earned</div>
          </div>
          <div className="flex flex-col items-center gap-1 bg-[#252525] px-4 py-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{course.progress}%</div>
            <div className="text-xs text-gray-300">Completed</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Course Progress</span>
          <span className="text-white">
            {course.xpEarned} / {course.totalXP} XP
          </span>
        </div>
        <Progress value={course.progress} className="h-2" />
      </div>

      {course.lastModule && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-[#2d2d2d] bg-[#1a1a1a] rounded-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0091FF]" />
            <div>
              <div className="text-sm text-gray-300">Continue where you left off</div>
              <div className="font-medium text-white">{course.lastModuleTitle}</div>
            </div>
          </div>
          <Button className="gap-1.5 bg-[#0091FF] hover:bg-[#0080e0]">
            Continue Learning
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

