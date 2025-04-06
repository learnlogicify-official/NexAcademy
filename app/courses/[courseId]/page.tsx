"use client"

import { useEffect, useState } from "react"
import { pythonBasicsCourse, type Course } from "@/data/courses"
import { CourseHeader } from "@/components/course-header"
import { ModuleCard } from "@/components/module-card"
import { useParams } from "next/navigation"

export default function CoursePage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    // In a real app, this would fetch from an API
    if (courseId === "python-basics") {
      setCourse(pythonBasicsCourse)
    }
  }, [courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader course={course} />

      <h2 className="text-xl font-semibold text-white mb-6">Course Modules</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.modules.map((module) => (
          <ModuleCard key={module.id} module={module} courseId={course.id} />
        ))}
      </div>
    </div>
  )
}

