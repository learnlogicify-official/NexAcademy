"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Search, BookOpen, Award, CheckCircle, BarChart3, Users } from "lucide-react"
import { SiPython, SiDatacamp } from "react-icons/si"
import { TbBrandHtml5 } from "react-icons/tb"
import { FaStar, FaRegStar, FaListUl } from "react-icons/fa"
import { MdSlowMotionVideo } from "react-icons/md"
import { DashboardLayout } from "@/components/dashboard-layout"

// Utility function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

// Mock data for enrolled courses
const enrolledCourses = [
  {
    id: "python-basics",
    title: "Python Basics",
    description:
      "Learn the fundamentals of Python programming language with hands-on projects and interactive exercises",
    instructor: "Dr. Alex Johnson",
    earnedXP: 450,
    totalXP: 1500,
    progress: 30,
    lastAccessed: "2 days ago",
    tags: ["python", "programming", "basics"],
    certificate: false,
    level: "Beginner",
    icon: SiPython,
    bannerColor: "rgb(255, 218, 205)",
    topics: 12,
    videos: 24,
    rating: 4.5,
    enrolledCount: 1200,
    isLiked: false,
    url: "/my-learning/python-basics",
  },
  {
    id: "web-dev",
    title: "Web Development Fundamentals",
    description: "Master HTML, CSS, and JavaScript through practical web development projects",
    instructor: "Emily Rodriguez",
    earnedXP: 750,
    totalXP: 1200,
    progress: 62,
    lastAccessed: "Yesterday",
    tags: ["html", "css", "javascript"],
    certificate: false,
    level: "Intermediate",
    icon: TbBrandHtml5,
    bannerColor: "rgb(220, 242, 233)",
    topics: 15,
    videos: 30,
    rating: 4.8,
    enrolledCount: 2500,
    isLiked: true,
    url: "/my-learning/web-dev",
  },
  {
    id: "data-science",
    title: "Data Science Bootcamp",
    description:
      "Comprehensive data science program covering Python, statistics, machine learning, and data visualization",
    instructor: "Dr. Sarah Johnson",
    earnedXP: 1200,
    totalXP: 1200,
    progress: 100,
    lastAccessed: "1 week ago",
    tags: ["data science", "python", "machine learning"],
    certificate: true,
    level: "Advanced",
    icon: SiDatacamp,
    bannerColor: "rgb(230, 230, 250)",
    topics: 20,
    videos: 45,
    rating: 4.9,
    enrolledCount: 3800,
    isLiked: false,
    url: "/my-learning/data-science",
  },
]

// Rating renderer function
const renderRating = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const stars = []

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />)
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />)
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300" size={14} />)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function MyLearningPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredCourses, setFilteredCourses] = useState(enrolledCourses)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter courses based on search query and active tab
  useEffect(() => {
    let filtered = enrolledCourses

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply tab filter
    if (activeTab === "in-progress") {
      filtered = filtered.filter((course) => course.progress > 0 && course.progress < 100)
    } else if (activeTab === "completed") {
      filtered = filtered.filter((course) => course.progress === 100)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, activeTab])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full md:w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Learning</h1>
            <p className="text-muted-foreground">Track your progress and continue learning</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
              className="pl-9 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{enrolledCourses.filter((course) => course.progress === 100).length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
                <p className="text-2xl font-bold">
                  {enrolledCourses.reduce((acc, course) => acc + course.earnedXP, 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0 flex flex-col h-[100%] justify-between">
                  <div className="p-6 h-[100%]" style={{ backgroundColor: course.bannerColor }}>
                    <div className="flex flex-row items-center justify-between">
                      <div className="bg-white dark:bg-[#121212] inline-block px-4 py-0.5 text-xs font-medium rounded-full text-gray-800 dark:text-white">
                        {course.level}
                      </div>
                      <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-lg flex justify-center items-center text-gray-800 dark:text-white">
                        {course.icon && <course.icon size={25} />}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-xl font-bold mt-2.5 pl-1.5 leading-[30px] text-gray-800">{course.title}</div>

                    {/* Stats Section */}
                    <div className="flex flex-row items-center gap-1 pl-1.5 pt-1.5">
                      <div className="text-[11px] text-gray-600 flex flex-row items-center justify-center gap-0.5">
                        <FaListUl size={14} />
                        <span>{course.topics} Topics</span>
                      </div>
                      <span className="text-gray-400 text-sm font-medium">|</span>
                      <div className="text-[11px] text-gray-600 flex flex-row items-center justify-center gap-0.5">
                        <MdSlowMotionVideo size={15} />
                        <span>{course.videos} Videos</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-2 pl-1.5">{renderRating(course.rating)}</div>

                    {/* Description */}
                    <div className="mt-2 text-[13px] pl-1.5 text-gray-600">{course.description}</div>
                  </div>

                  <div className="bg-white dark:bg-[#121212] p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-black dark:text-white">Progress</div>
                      <div className="text-sm font-medium text-black dark:text-white">{course.progress}%</div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Enrolled count */}
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 z-10">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{formatNumber(course.enrolledCount)}</span>
                      </div>

                      <Link href={course.url}>
                        <div className="px-5 py-2 bg-black text-white dark:bg-transparent dark:border dark:border-white dark:text-white rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-white dark:hover:text-black transition-colors">
                          Continue
                        </div>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery
                  ? "Try adjusting your search or filters to find your courses."
                  : "You haven't enrolled in any courses yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
