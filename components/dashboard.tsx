"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Flame,
  Trophy,
  ArrowRight,
  Award,
  BookOpen,
  FileText,
  BarChart3,
  ChevronRight,
  Code,
  BookOpenCheck,
} from "lucide-react"
import { XPChart } from "@/components/xp-chart"
import { useEffect, useState } from "react"
import { pythonBasicsCourse } from "@/data/courses"
import { useRouter } from "next/navigation"
import { CourseCard } from "@/components/course-card"

// Mock data
const courses = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    instructor: "Alex Johnson",
    progress: 75,
    tags: ["javascript", "web development", "frontend"],
  },
  {
    id: 2,
    title: "React Essentials",
    instructor: "Sarah Miller",
    progress: 45,
    tags: ["react", "javascript", "frontend"],
  },
  {
    id: 3,
    title: "Python Basics",
    instructor: "Michael Chen",
    progress: 90,
    tags: ["python", "programming", "backend"],
  },
]

const assignments = [
  {
    id: 1,
    title: "Build a Todo App",
    course: "React Essentials",
    dueDate: "2025-04-10",
    status: "pending",
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    course: "JavaScript Fundamentals",
    dueDate: "2025-04-08",
    status: "pending",
  },
  {
    id: 3,
    title: "API Integration Project",
    course: "React Essentials",
    dueDate: "2025-04-15",
    status: "pending",
  },
]

const activities = [
  {
    id: 1,
    title: "Python Basics - Final Project",
    time: "2 hours ago",
    xp: 150,
    badge: "Code Ninja",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals - Quiz 3",
    time: "Yesterday",
    xp: 75,
    badge: null,
  },
]

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleContinueCourse = () => {
    router.push(`/courses/${pythonBasicsCourse.id}`)
  }

  // Get the user's full name, falling back to email if name is not available
  const displayName = user.name || user.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground">Here's what's happening with your learning journey</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>3-day streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Level 4: Syntax Samurai</span>
          </div>
        </div>
      </div>

      {/* Featured Course Card */}
      <Card className="overflow-hidden border shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-48 w-full md:h-auto md:w-1/3 lg:w-1/4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
              <Code className="h-16 w-16 text-white" />
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <Badge className="mb-2 bg-primary text-primary-foreground">Featured Course</Badge>
                <h2 className="text-2xl font-bold">{pythonBasicsCourse.title}</h2>
                <p className="mt-1 text-muted-foreground">{pythonBasicsCourse.description}</p>
              </div>
              <Badge variant="outline" className="bg-muted">
                {pythonBasicsCourse.level}
              </Badge>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground">{pythonBasicsCourse.progress}%</span>
              </div>
              <Progress value={pythonBasicsCourse.progress} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpenCheck className="h-4 w-4 text-primary" />
                  <span>
                    {pythonBasicsCourse.modules.filter((m) => m.status === "Completed").length} of{" "}
                    {pythonBasicsCourse.modules.length} modules completed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>
                    {pythonBasicsCourse.xpEarned} / {pythonBasicsCourse.totalXP} XP
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pythonBasicsCourse.lastModuleTitle ? (
                    <span>
                      Continue from: <span className="text-foreground">{pythonBasicsCourse.lastModuleTitle}</span>
                    </span>
                  ) : (
                    <span>Start your learning journey</span>
                  )}
                </div>
                <Button onClick={handleContinueCourse} className="gap-1.5">
                  {pythonBasicsCourse.progress > 0 ? "Continue Learning" : "Start Learning"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 in progress, 1 completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 due this week, 2 upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">+350 XP this week (+16.7%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Latest: Code Ninja (2 hours ago)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} viewMode="compact" />
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>XP Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <div className="p-6">
              <XPChart />
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 pt-0 text-center">
              <div className="rounded-lg bg-secondary p-2">
                <div className="text-2xl font-bold">2,450</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
              <div className="rounded-lg bg-secondary p-2">
                <div className="text-2xl font-bold">550</div>
                <div className="text-xs text-muted-foreground">XP to Level 5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Assignments</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.course}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === "completed" ? "outline" : "default"}>
                        {assignment.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      +{activity.xp} XP
                    </div>
                    {activity.badge && (
                      <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                        <Award className="h-3 w-3" />
                        {activity.badge}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Start Next Assignment
          </Button>
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" />
            View Leaderboard
          </Button>
          <Button variant="outline" className="gap-2">
            <Award className="h-4 w-4" />
            Claim Reward
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

