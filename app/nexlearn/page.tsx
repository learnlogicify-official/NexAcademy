"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Star, Users, ShoppingCart, BookOpen } from "lucide-react"
import { FeaturedCourseCard } from "@/components/featured-course-card"
import { FaListUl } from "react-icons/fa"
import { MdSlowMotionVideo } from "react-icons/md"
import { SiPython, SiJavascript, SiReact, SiDatacamp } from "react-icons/si"
import { FaCode } from "react-icons/fa"
import { DashboardLayout } from "@/components/dashboard-layout"

// Utility function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

// Mock data for available courses
const availableCourses = [
  {
    id: "data-science",
    title: "Data Science Bootcamp",
    description:
      "Comprehensive data science program covering Python, statistics, machine learning, and data visualization",
    instructor: "Dr. Sarah Johnson",
    price: 99.99,
    originalPrice: 199.99,
    rating: 4.9,
    ratingCount: 4567,
    students: 23456,
    duration: "12 weeks",
    level: "Intermediate",
    tags: ["data science", "python", "machine learning"],
    featured: true,
    icon: SiDatacamp,
    bannerColor: "rgb(230, 230, 250)",
    topics: 24,
    videos: 65,
  },
  {
    id: "javascript-mastery",
    title: "JavaScript Mastery",
    description: "Master modern JavaScript from fundamentals to advanced concepts like async/await and ES6+ features",
    instructor: "Michael Chen",
    price: 79.99,
    originalPrice: 149.99,
    rating: 4.8,
    ratingCount: 3254,
    students: 18923,
    duration: "10 weeks",
    level: "All Levels",
    tags: ["javascript", "web development", "programming"],
    featured: true,
    icon: SiJavascript,
    bannerColor: "rgb(255, 251, 214)",
    topics: 20,
    videos: 48,
  },
  {
    id: "react-essentials",
    title: "React Essentials",
    description: "Start building modern web applications with React",
    instructor: "David Kim",
    price: 69.99,
    originalPrice: 129.99,
    rating: 4.8,
    ratingCount: 3211,
    students: 15432,
    duration: "8 weeks",
    level: "Beginner",
    tags: ["react", "javascript", "web development"],
    featured: false,
    icon: SiReact,
    bannerColor: "rgb(217, 242, 255)",
    topics: 15,
    videos: 42,
  },
  {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms and techniques",
    instructor: "Dr. James Wilson",
    price: 89.99,
    originalPrice: 169.99,
    rating: 4.7,
    ratingCount: 2134,
    students: 12567,
    duration: "10 weeks",
    level: "Intermediate",
    tags: ["machine learning", "python", "data science"],
    featured: false,
    icon: SiPython,
    bannerColor: "rgb(255, 218, 205)",
    topics: 18,
    videos: 55,
  },
  {
    id: "advanced-data-structures",
    title: "Advanced Data Structures",
    description: "Deep dive into complex data structures and algorithms",
    instructor: "Dr. Lisa Chen",
    price: 79.99,
    originalPrice: 159.99,
    rating: 4.9,
    ratingCount: 1543,
    students: 8765,
    duration: "10 weeks",
    level: "Advanced",
    tags: ["algorithms", "data structures", "computer science"],
    featured: false,
    icon: FaCode,
    bannerColor: "rgb(220, 242, 233)",
    topics: 22,
    videos: 60,
  },
  {
    id: "python-for-data-analysis",
    title: "Python for Data Analysis",
    description: "Learn how to use Python for data analysis with pandas, NumPy, and Matplotlib",
    instructor: "Dr. Alex Johnson",
    price: 69.99,
    originalPrice: 139.99,
    rating: 4.8,
    ratingCount: 2876,
    students: 14532,
    duration: "8 weeks",
    level: "Intermediate",
    tags: ["python", "data analysis", "pandas"],
    featured: false,
    icon: SiPython,
    bannerColor: "rgb(255, 218, 205)",
    topics: 16,
    videos: 45,
  },
]

// Get featured course
const featuredCourse = availableCourses.find((course) => course.featured && course.id === "data-science")

// Rating renderer function
const renderRating = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const stars = []

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="text-yellow-400 fill-yellow-400" size={14} />)
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className="text-yellow-400 fill-yellow-400" size={14} />)
    } else {
      stars.push(<Star key={i} className="text-gray-300" size={14} />)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function CourseHubPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [filteredCourses, setFilteredCourses] = useState(availableCourses)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter courses based on search query, active tab, and filters
  useEffect(() => {
    let filtered = availableCourses

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
    if (activeTab !== "all") {
      filtered = filtered.filter((course) => course.tags.some((tag) => tag.toLowerCase() === activeTab.toLowerCase()))
    }

    // Apply price filter
    if (priceFilter === "under-50") {
      filtered = filtered.filter((course) => course.price < 50)
    } else if (priceFilter === "50-100") {
      filtered = filtered.filter((course) => course.price >= 50 && course.price <= 100)
    } else if (priceFilter === "over-100") {
      filtered = filtered.filter((course) => course.price > 100)
    }

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level.toLowerCase() === levelFilter.toLowerCase())
    }

    setFilteredCourses(filtered)
  }, [searchQuery, activeTab, priceFilter, levelFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full md:w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Featured Course */}
        {featuredCourse && (
          <FeaturedCourseCard
            title={featuredCourse.title}
            description={featuredCourse.description}
            instructor={featuredCourse.instructor}
            rating={featuredCourse.rating}
            ratingCount={featuredCourse.ratingCount}
            students={featuredCourse.students}
            duration={featuredCourse.duration}
            topics={24}
            videos={65}
          />
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Course Hub</h1>
            <p className="text-muted-foreground">Discover and enroll in new courses</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-0 bg-transparent p-0 h-auto overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="all"
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Courses
              </TabsTrigger>
              <TabsTrigger
                value="programming"
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Programming
              </TabsTrigger>
              <TabsTrigger
                value="data science"
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Data Science
              </TabsTrigger>
              <TabsTrigger
                value="web development"
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Web Development
              </TabsTrigger>
              <TabsTrigger
                value="machine learning"
                className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Machine Learning
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="over-100">Over $100</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0 flex flex-col h-full justify-between">
                  {/* Top section with colored background */}
                  <div className="p-6 h-full" style={{ backgroundColor: course.bannerColor }}>
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
                    <div className="mt-2 text-[13px] pl-1.5 text-gray-600 line-clamp-2">{course.description}</div>

                    {/* Students count */}
                    <div className="mt-3 pl-1.5 flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{formatNumber(course.students)} students enrolled</span>
                    </div>
                  </div>

                  {/* Bottom section with price and enroll button */}
                  <div className="bg-white dark:bg-[#121212] p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">${course.price}</span>
                        {course.originalPrice > course.price && (
                          <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
                        )}
                      </div>

                      <Button size="sm" className="gap-1 rounded-full">
                        <ShoppingCart className="h-4 w-4" />
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground max-w-md">Try adjusting your search or filters to find courses.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
