"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { pythonBasicsCourse } from "@/data/courses"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseHeader } from "./components/course-header"
import { ModulesGrid } from "./components/modules-grid"
import { ExploreMode } from "./components/explore-mode"
import { CourseSidebar } from "@/components/course-sidebar"
import { CourseTabsNavigation } from "./components/course-tabs-navigation"
import { MessageSquare, Award } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function CourseOverviewPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState(pythonBasicsCourse)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"guided" | "explore">("guided")
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Update document title to include course name
  useEffect(() => {
    if (!loading) {
      document.title = `${course.title} | Nexacademy`
    }
  }, [loading, course.title])

  const navigateToLesson = (moduleId: string) => {
    router.push(`/my-learning/${params.courseId}/lessons/${moduleId}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return viewMode === "guided" ? (
        <ModulesGrid modules={course.modules} onModuleClick={navigateToLesson} />
      ) : (
        <ExploreMode modules={course.modules} />
      )
    } else if (activeTab === "discussions") {
      return (
        <div className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Discussions Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join the conversation! Be the first to start a discussion about this course.
          </p>
        </div>
      )
    } else if (activeTab === "certificate") {
      return (
        <div className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Complete the Course to Earn Your Certificate</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Finish all modules and assignments to receive your course completion certificate.
          </p>
        </div>
      )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 w-full overflow-x-hidden">
        {/* Header section */}
        <div className="flex flex-col gap-6 w-full">
          <CourseHeader course={course} learningMode={viewMode} onLearningModeChange={(mode) => setViewMode(mode)} />
        </div>

        {/* Course content with sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          <div className="w-full overflow-x-hidden">
            <div>
              <CourseTabsNavigation onTabChange={setActiveTab} />
              {renderTabContent()}
            </div>
          </div>
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <CourseSidebar xpEarned={450} totalXP={1500} level={3} streak={7} className="sticky top-6" />
          </div>
        </div>
        {/* Add a mobile version of the sidebar that appears at the bottom */}
        <div className="lg:hidden mt-6 w-full">
          <CourseSidebar xpEarned={450} totalXP={1500} level={3} streak={7} />
        </div>
      </div>
    </DashboardLayout>
  )
}
