"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Search, FileText, Code, ChevronRight } from "lucide-react"

// Mock submissions data
const submissionsData = [
  {
    id: 1,
    title: "Build a Todo App",
    course: "React Essentials",
    courseId: 2,
    submittedAt: "2025-04-05T14:30:00",
    dueDate: "2025-04-10T23:59:59",
    status: "graded",
    score: 95,
    maxScore: 100,
    xpEarned: 150,
    feedback: "Excellent work! Your code is clean and well-structured.",
    type: "assignment",
    language: "JavaScript",
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    course: "JavaScript Fundamentals",
    courseId: 1,
    submittedAt: "2025-04-03T10:15:00",
    dueDate: "2025-04-08T23:59:59",
    status: "graded",
    score: 85,
    maxScore: 100,
    xpEarned: 100,
    feedback: "Good understanding of core concepts. Review linked lists section.",
    type: "quiz",
    language: "JavaScript",
  },
  {
    id: 3,
    title: "API Integration Project",
    course: "React Essentials",
    courseId: 2,
    submittedAt: "2025-03-30T16:45:00",
    dueDate: "2025-04-15T23:59:59",
    status: "submitted",
    type: "assignment",
    language: "JavaScript",
  },
  {
    id: 4,
    title: "Python Functions Exercise",
    course: "Python Basics",
    courseId: 3,
    submittedAt: "2025-03-28T09:20:00",
    dueDate: "2025-04-05T23:59:59",
    status: "graded",
    score: 90,
    maxScore: 100,
    xpEarned: 75,
    feedback: "Great job with recursion! Consider optimizing your solution for better performance.",
    type: "exercise",
    language: "Python",
  },
  {
    id: 5,
    title: "Binary Search Tree Implementation",
    course: "Data Structures & Algorithms",
    courseId: 4,
    submittedAt: "2025-03-25T11:30:00",
    dueDate: "2025-03-25T23:59:59",
    status: "graded",
    score: 100,
    maxScore: 100,
    xpEarned: 200,
    feedback: "Perfect implementation! Your code is efficient and well-documented.",
    type: "problem",
    language: "Python",
  },
  {
    id: 6,
    title: "CSS Animations Challenge",
    course: "Advanced CSS & Animations",
    courseId: 6,
    submittedAt: "2025-03-20T14:10:00",
    dueDate: "2025-03-22T23:59:59",
    status: "graded",
    score: 92,
    maxScore: 100,
    xpEarned: 125,
    feedback: "Creative animations! Consider optimizing for mobile devices.",
    type: "assignment",
    language: "CSS",
  },
  {
    id: 7,
    title: "Node.js Server Setup",
    course: "Node.js Backend Development",
    courseId: 5,
    submittedAt: "2025-03-15T10:45:00",
    dueDate: "2025-03-18T23:59:59",
    status: "graded",
    score: 88,
    maxScore: 100,
    xpEarned: 175,
    feedback: "Good implementation. Consider adding more error handling.",
    type: "assignment",
    language: "JavaScript",
  },
]

export function ProfileSubmissions() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Get unique courses from submissions
  const courses = Array.from(new Set(submissionsData.map((submission) => submission.course))).map((course) => ({
    name: course,
    id: submissionsData.find((s) => s.course === course)?.courseId,
  }))

  // Get unique submission types
  const submissionTypes = Array.from(new Set(submissionsData.map((submission) => submission.type)))

  // Filter submissions based on active tab and filters
  const filteredSubmissions = submissionsData
    .filter((submission) => {
      // Filter by tab
      if (activeTab === "graded" && submission.status !== "graded") return false
      if (activeTab === "pending" && submission.status !== "submitted") return false

      // Filter by search query
      if (
        searchQuery &&
        !submission.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !submission.course.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false

      // Filter by course
      if (courseFilter !== "all" && submission.courseId !== Number.parseInt(courseFilter)) return false

      // Filter by type
      if (typeFilter !== "all" && submission.type !== typeFilter) return false

      return true
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const getStatusBadge = (status, score, maxScore) => {
    switch (status) {
      case "graded":
        const percentage = (score / maxScore) * 100
        if (percentage >= 90) {
          return (
            <Badge className="gap-1 bg-green-500 text-white">
              <CheckCircle className="h-3 w-3" /> {score}/{maxScore} ({percentage}%)
            </Badge>
          )
        } else if (percentage >= 70) {
          return (
            <Badge className="gap-1 bg-yellow-500 text-white">
              <CheckCircle className="h-3 w-3" /> {score}/{maxScore} ({percentage}%)
            </Badge>
          )
        } else {
          return (
            <Badge className="gap-1 bg-red-500 text-white">
              <XCircle className="h-3 w-3" /> {score}/{maxScore} ({percentage}%)
            </Badge>
          )
        }
      case "submitted":
        return (
          <Badge className="gap-1 bg-blue-500 text-white">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "quiz":
        return <FileText className="h-4 w-4 text-yellow-500" />
      case "exercise":
        return <Code className="h-4 w-4 text-green-500" />
      case "problem":
        return <Code className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getLanguageBadge = (language) => {
    let color
    switch (language) {
      case "JavaScript":
        color = "bg-yellow-500/10 text-yellow-500"
        break
      case "Python":
        color = "bg-blue-500/10 text-blue-500"
        break
      case "CSS":
        color = "bg-purple-500/10 text-purple-500"
        break
      default:
        color = "bg-gray-500/10 text-gray-500"
    }

    return (
      <Badge variant="outline" className={color}>
        {language}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Submissions
        </h2>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search submissions..."
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
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {submissionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon(submission.type)}</div>
                    <div>
                      <h3 className="font-semibold">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground">{submission.course}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(submission.status, submission.score, submission.maxScore)}
                    {getLanguageBadge(submission.language)}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Submitted: {formatDate(submission.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {formatDate(submission.dueDate)}</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={`/submissions/${submission.id}`}>
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {submission.status === "graded" && (
                  <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Feedback</span>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        +{submission.xpEarned} XP
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{submission.feedback}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No submissions found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || courseFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't submitted any assignments yet."}
              </p>
              {(searchQuery || courseFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setCourseFilter("all")
                    setTypeFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

