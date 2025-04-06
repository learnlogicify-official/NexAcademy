"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen, FileText, Clock, Code, CheckCircle, BarChart3, Flame } from "lucide-react"

interface User {
  stats: {
    totalXP: number
    coursesCompleted: number
    coursesInProgress: number
    assignmentsCompleted: number
    assignmentsPending: number
    codingHours: number
    daysActive: number
    problemsSolved: number
    submissions: number
    successRate: number
  }
}

interface ProfileOverviewProps {
  user: User
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const { stats } = user

  const statCards = [
    {
      title: "Total XP",
      value: stats.totalXP.toLocaleString(),
      icon: <Trophy className="h-5 w-5 text-primary" />,
      color: "bg-primary/10",
    },
    {
      title: "Courses Completed",
      value: stats.coursesCompleted,
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      color: "bg-green-500/10",
    },
    {
      title: "Courses In Progress",
      value: stats.coursesInProgress,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
    },
    {
      title: "Assignments Completed",
      value: stats.assignmentsCompleted,
      icon: <FileText className="h-5 w-5 text-green-500" />,
      color: "bg-green-500/10",
    },
    {
      title: "Assignments Pending",
      value: stats.assignmentsPending,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: "bg-yellow-500/10",
    },
    {
      title: "Coding Hours",
      value: stats.codingHours,
      icon: <Code className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500/10",
    },
    {
      title: "Problems Solved",
      value: stats.problemsSolved,
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      color: "bg-green-500/10",
      progress: stats.successRate,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Stats Overview
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="rounded-lg border bg-card shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>

              {stat.progress !== undefined && (
                <div className="mt-4">
                  <Progress value={stat.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Reached Level 4</h4>
                  <p className="text-sm text-muted-foreground">Earned the "Syntax Samurai" title</p>
                  <p className="text-xs text-muted-foreground">2 weeks ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Completed Python Basics</h4>
                  <p className="text-sm text-muted-foreground">Earned the "Python Master" badge</p>
                  <p className="text-xs text-muted-foreground">3 weeks ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                  <Flame className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">7-Day Streak</h4>
                  <p className="text-sm text-muted-foreground">Earned the "Streak Keeper" badge</p>
                  <p className="text-xs text-muted-foreground">1 month ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Learning Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Complete React Essentials</span>
                  </div>
                  <span className="text-xs text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Solve 50 Problems</span>
                  </div>
                  <span className="text-xs text-muted-foreground">74%</span>
                </div>
                <Progress value={74} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Reach Level 5</span>
                  </div>
                  <span className="text-xs text-muted-foreground">82%</span>
                </div>
                <Progress value={82} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Maintain 10-day Streak</span>
                  </div>
                  <span className="text-xs text-muted-foreground">30%</span>
                </div>
                <Progress value={30} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

