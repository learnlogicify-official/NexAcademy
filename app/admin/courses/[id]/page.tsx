"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseHeader } from "@/components/course-header"
import { ModuleList } from "@/components/admin/module-list"
import { ExploreMode } from "@/components/explore-mode"
import { CourseSidebar } from "@/components/course-sidebar"
import { CourseTabsNavigation } from "@/components/course-tabs-navigation"
import { MessageSquare, Award } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { use } from "react"
import { AdminModulesGrid } from "@/components/admin/AdminModulesGrid"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { EnrollUsersModal } from "@/components/admin/enroll-users-modal"

interface Course {
  id: string
  title: string
  description: string
  modules: any[]
  xpEarned: number
  totalXP: number
  progress: number
  level: "Beginner" | "Intermediate" | "Advanced"
  // Add other course properties as needed
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CourseOverviewPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"guided" | "explore">("guided")
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }
      const data = await response.json()
      setCourse({ ...data, xpEarned: data.xpEarned ?? 0 })
    } catch (error) {
      console.error('Error fetching course:', error)
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [resolvedParams.id])

  // Update document title to include course name
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | Nexacademy`
    }
  }, [course])

  const navigateToLesson = (moduleId: string) => {
    router.push(`/my-learning/${resolvedParams.id}/lessons/${moduleId}`)
  }

  const handleEnroll = async (course: Course) => {
    setIsEnrolling(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to enroll")
      setEnrolled(true)
      toast({ title: "Enrolled!", description: data.message || "Successfully enrolled in course." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to enroll.", variant: "destructive" })
    } finally {
      setIsEnrolling(false)
    }
  }

  if (loading) {
    return (
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
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    )
  }

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return viewMode === "guided" ? (
        <AdminModulesGrid courseId={course.id} modules={course.modules} onModuleUpdate={fetchCourse} />
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
    <div className="space-y-8 w-full overflow-x-hidden">
      {/* Header section */}
      <div className="flex flex-col gap-6 w-full">
        <CourseHeader
          course={course}
          learningMode={viewMode}
          onLearningModeChange={(mode) => setViewMode(mode)}
          enrollButton={
            <Button
              variant="default"
              size="sm"
              onClick={() => setEnrollModalOpen(true)}
              className="bg-green-600/90 hover:bg-green-700 text-white shadow-sm"
            >
              Enroll
            </Button>
          }
        />
        <EnrollUsersModal
          open={enrollModalOpen}
          onOpenChange={setEnrollModalOpen}
          courseId={course.id}
          onSuccess={() => toast({ title: "Enrolled!", description: "Users enrolled successfully." })}
        />
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
  )
} 
