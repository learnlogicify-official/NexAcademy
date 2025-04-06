"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, List, Search } from "lucide-react"
import { AssignmentList } from "@/components/assignment-list"
import { AssignmentCalendar } from "@/components/assignment-calendar"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for assignments
export const assignmentsData = [
  {
    id: 1,
    title: "Build a Todo App",
    course: "React Essentials",
    courseId: 2,
    dueDate: "2025-04-10",
    xpReward: 150,
    status: "pending",
    description: "Create a simple todo application using React hooks and state management.",
    progress: 0,
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    course: "JavaScript Fundamentals",
    courseId: 1,
    dueDate: "2025-04-08",
    xpReward: 100,
    status: "submitted",
    description: "Complete the quiz on arrays, objects, and basic algorithms.",
    progress: 100,
    submittedAt: "2025-04-07T14:30:00",
  },
  {
    id: 3,
    title: "API Integration Project",
    course: "React Essentials",
    courseId: 2,
    dueDate: "2025-04-15",
    xpReward: 200,
    status: "pending",
    description: "Build a weather app that fetches data from a public API.",
    progress: 65,
  },
  {
    id: 4,
    title: "Python Functions Exercise",
    course: "Python Basics",
    courseId: 3,
    dueDate: "2025-04-05",
    xpReward: 75,
    status: "late",
    description: "Complete exercises on Python functions, arguments, and return values.",
    progress: 50,
  },
  {
    id: 5,
    title: "Final Project: Web Scraper",
    course: "Python Basics",
    courseId: 3,
    dueDate: "2025-04-20",
    xpReward: 300,
    status: "pending",
    description: "Build a web scraper that extracts data from a website of your choice.",
    progress: 25,
  },
  {
    id: 6,
    title: "CSS Animations Challenge",
    course: "Advanced CSS & Animations",
    courseId: 6,
    dueDate: "2025-04-12",
    xpReward: 125,
    status: "graded",
    description: "Create a series of complex animations using CSS keyframes.",
    progress: 100,
    submittedAt: "2025-04-11T09:15:00",
    grade: {
      score: 92,
      feedback:
        "Excellent work! Your animations are smooth and creative. Consider optimizing performance for mobile devices.",
      xpEarned: 115,
    },
  },
  {
    id: 7,
    title: "Node.js Server Setup",
    course: "Node.js Backend Development",
    courseId: 5,
    dueDate: "2025-04-18",
    xpReward: 175,
    status: "pending",
    description: "Create a basic Express server with routes for a RESTful API.",
    progress: 10,
  },
]

// Get unique courses from assignments
const courses = Array.from(new Set(assignmentsData.map((assignment) => assignment.course)))

export function Assignments() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [filteredAssignments, setFilteredAssignments] = useState(assignmentsData)

  // Apply filters and search
  useEffect(() => {
    let result = assignmentsData

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.course.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply course filter
    if (courseFilter !== "all") {
      result = result.filter((assignment) => assignment.course === courseFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((assignment) => assignment.status === statusFilter)
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "xpReward":
          return b.xpReward - a.xpReward
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredAssignments(result)
  }, [searchQuery, courseFilter, statusFilter, sortBy])

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Track and manage your course assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="xpReward">XP Reward</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(courseFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {courseFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Course: {courseFilter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setCourseFilter("all")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setStatusFilter("all")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {(courseFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    setSearchQuery("")
                    setCourseFilter("all")
                    setStatusFilter("all")
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments View */}
      {viewMode === "list" ? (
        <AssignmentList assignments={filteredAssignments} />
      ) : (
        <AssignmentCalendar assignments={filteredAssignments} />
      )}
    </div>
  )
}

