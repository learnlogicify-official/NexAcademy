"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/course-card"
import { Search } from "lucide-react"

// Sample course data
const courses = [
  {
    id: "1",
    title: "Python Fundamentals",
    description: "Learn the basics of Python programming language with hands-on projects and exercises.",
    instructor: "Dr. Alex Johnson",
    level: "Beginner",
    duration: "8 weeks",
    enrolled: 1245,
    rating: 4.8,
    progress: 0,
    tags: ["python", "programming", "basics"],
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced concepts in JavaScript including closures, prototypes, and async programming.",
    instructor: "Sarah Williams",
    level: "Advanced",
    duration: "10 weeks",
    enrolled: 892,
    rating: 4.7,
    progress: 65,
    tags: ["javascript", "web development", "advanced"],
  },
  {
    id: "3",
    title: "Web Development Bootcamp",
    description:
      "Comprehensive course on modern web development covering HTML, CSS, JavaScript, and responsive design.",
    instructor: "Michael Chen",
    level: "Intermediate",
    duration: "12 weeks",
    enrolled: 1567,
    rating: 4.9,
    progress: 32,
    tags: ["web development", "html", "css", "javascript"],
  },
  {
    id: "4",
    title: "Data Structures & Algorithms",
    description:
      "Learn essential data structures and algorithms with practical implementations and problem-solving techniques.",
    instructor: "Prof. Emily Rodriguez",
    level: "Intermediate",
    duration: "10 weeks",
    enrolled: 1023,
    rating: 4.6,
    progress: 0,
    tags: ["dsa", "algorithms", "computer science"],
  },
  {
    id: "5",
    title: "React for Beginners",
    description: "Start building modern web applications with React. Learn components, hooks, and state management.",
    instructor: "David Kim",
    level: "Beginner",
    duration: "8 weeks",
    enrolled: 1432,
    rating: 4.8,
    progress: 0,
    tags: ["react", "javascript", "web development"],
  },
  {
    id: "6",
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning concepts and applications with Python and popular ML libraries.",
    instructor: "Dr. Lisa Patel",
    level: "Intermediate",
    duration: "12 weeks",
    enrolled: 876,
    rating: 4.7,
    progress: 0,
    tags: ["machine learning", "ai", "data science", "python"],
  },
]

// Featured courses for recommendations
const featuredCourses = [
  {
    id: "7",
    title: "Full Stack Development with MERN",
    description: "Build complete web applications using MongoDB, Express, React, and Node.js stack.",
    instructor: "Jason Taylor",
    level: "Intermediate",
    duration: "14 weeks",
    enrolled: 2134,
    rating: 4.9,
    progress: 0,
    tags: ["fullstack", "mern", "web development", "javascript"],
  },
  {
    id: "8",
    title: "Mobile App Development with Flutter",
    description: "Create beautiful cross-platform mobile applications with Flutter and Dart.",
    instructor: "Sophia Garcia",
    level: "Intermediate",
    duration: "10 weeks",
    enrolled: 1567,
    rating: 4.8,
    progress: 0,
    tags: ["mobile", "flutter", "dart", "app development"],
  },
]

export function Courses() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-full md:w-[300px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Featured Courses */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses
                .filter((course) => course.progress > 0)
                .map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              {filteredCourses.filter((course) => course.progress > 0).length === 0 && (
                <p className="text-muted-foreground col-span-3">You haven't enrolled in any courses yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Completed Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses
                .filter((course) => course.progress === 100)
                .map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              {filteredCourses.filter((course) => course.progress === 100).length === 0 && (
                <p className="text-muted-foreground col-span-3">You haven't completed any courses yet.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

