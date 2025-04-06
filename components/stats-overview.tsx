"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, Clock, Code, FileText, Trophy } from "lucide-react"

interface Stats {
  totalXP: number
  coursesCompleted: number
  coursesInProgress: number
  assignmentsCompleted: number
  assignmentsPending: number
  codingHours: number
  daysActive: number
}

interface StatsOverviewProps {
  stats: Stats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Stats Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Total XP</p>
              <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Courses Completed</p>
              <p className="text-2xl font-bold">{stats.coursesCompleted}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Courses In Progress</p>
              <p className="text-2xl font-bold">{stats.coursesInProgress}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Assignments Completed</p>
              <p className="text-2xl font-bold">{stats.assignmentsCompleted}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Assignments Pending</p>
              <p className="text-2xl font-bold">{stats.assignmentsPending}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Code className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Coding Hours</p>
              <p className="text-2xl font-bold">{stats.codingHours}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

