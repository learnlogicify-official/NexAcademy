"use client"

import { useState, useEffect } from "react"
import { UserInfoCard } from "@/components/user-info-card"
import { BadgesGrid } from "@/components/badges-grid"
import { StatsOverview } from "@/components/stats-overview"
import { ActivityGraph } from "@/components/activity-graph"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { Achievements } from "@/components/achievements"
import { AboutMe } from "@/components/about-me"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock user data
export const userData = {
  id: 1,
  name: "Jamie Smith",
  email: "jamie.smith@example.com",
  avatar: "/placeholder.svg?height=100&width=100",
  level: {
    number: 4,
    title: "Syntax Samurai",
  },
  xp: {
    current: 2450,
    nextLevel: 3000,
  },
  streak: 3,
  joinedDate: "2024-01-15",
  stats: {
    totalXP: 2450,
    coursesCompleted: 1,
    coursesInProgress: 2,
    assignmentsCompleted: 8,
    assignmentsPending: 5,
    codingHours: 42,
    daysActive: 24,
  },
  bio: "Passionate developer learning to code through gamified experiences. Currently focused on web development and Python.",
  interests: ["Web Development", "Python", "Data Science", "UI/UX Design"],
  badges: [
    {
      id: 1,
      name: "Early Bird",
      description: "Completed 5 assignments before their due dates",
      icon: "🌅",
      earnedAt: "2025-02-10",
      isPrimary: true,
    },
    {
      id: 2,
      name: "Code Ninja",
      description: "Achieved a perfect score on 3 consecutive assignments",
      icon: "🥷",
      earnedAt: "2025-03-05",
      isPrimary: false,
    },
    {
      id: 3,
      name: "Python Master",
      description: "Completed Python Basics with excellence",
      icon: "🐍",
      earnedAt: "2025-03-20",
      isPrimary: false,
    },
    {
      id: 4,
      name: "Streak Keeper",
      description: "Maintained a 7-day coding streak",
      icon: "🔥",
      earnedAt: "2025-02-28",
      isPrimary: false,
    },
    {
      id: 5,
      name: "Bug Hunter",
      description: "Found and fixed 10 bugs in your code",
      icon: "🐛",
      earnedAt: "2025-03-15",
      isPrimary: false,
    },
    {
      id: 6,
      name: "Team Player",
      description: "Helped 5 other students in the forum",
      icon: "🤝",
      earnedAt: "2025-03-10",
      isPrimary: false,
    },
    {
      id: 7,
      name: "Fast Learner",
      description: "Completed a course in record time",
      icon: "⚡",
      earnedAt: "2025-02-20",
      isPrimary: false,
    },
  ],
  achievements: [
    {
      id: 1,
      title: "Complete 10 assignments",
      description: "You've completed 8/10 assignments",
      progress: 80,
      reward: "Problem Solver Badge",
    },
    {
      id: 2,
      title: "Reach Level 5",
      description: "You're Level 4 - earn 550 more XP",
      progress: 82,
      reward: "Advanced Coder Status",
    },
    {
      id: 3,
      title: "7-day Coding Streak",
      description: "You're on a 3-day streak",
      progress: 43,
      reward: "100 XP Bonus",
    },
  ],
  activityData: [
    { day: "2025-03-25", hours: 2.5 },
    { day: "2025-03-26", hours: 1.0 },
    { day: "2025-03-27", hours: 3.2 },
    { day: "2025-03-28", hours: 0.5 },
    { day: "2025-03-29", hours: 0.0 },
    { day: "2025-03-30", hours: 1.8 },
    { day: "2025-03-31", hours: 2.3 },
    { day: "2025-04-01", hours: 1.5 },
    { day: "2025-04-02", hours: 2.0 },
    { day: "2025-04-03", hours: 3.0 },
    { day: "2025-04-04", hours: 2.2 },
    { day: "2025-04-05", hours: 1.7 },
    { day: "2025-04-06", hours: 0.0 },
    { day: "2025-04-07", hours: 0.8 },
  ],
  heatmapData: [
    {
      date: "2025-04-05",
      count: 3,
      details: [
        { type: "assignment", title: "CSS Animations Challenge", xp: 115 },
        { type: "course", title: "Advanced CSS & Animations", xp: 50 },
        { type: "coding", title: "Coding Session", xp: 25 },
      ],
    },
    {
      date: "2025-04-04",
      count: 2,
      details: [
        { type: "assignment", title: "Data Structures Quiz", xp: 100 },
        { type: "coding", title: "Coding Session", xp: 30 },
      ],
    },
    {
      date: "2025-04-03",
      count: 4,
      details: [
        { type: "assignment", title: "API Integration Project", xp: 75 },
        { type: "course", title: "React Essentials", xp: 60 },
        { type: "coding", title: "Morning Coding Session", xp: 20 },
        { type: "coding", title: "Evening Coding Session", xp: 25 },
      ],
    },
    {
      date: "2025-04-02",
      count: 1,
      details: [{ type: "course", title: "JavaScript Fundamentals", xp: 40 }],
    },
    {
      date: "2025-03-31",
      count: 2,
      details: [
        { type: "assignment", title: "Python Functions Exercise", xp: 60 },
        { type: "coding", title: "Coding Session", xp: 35 },
      ],
    },
    {
      date: "2025-03-29",
      count: 3,
      details: [
        { type: "course", title: "Python Basics", xp: 70 },
        { type: "assignment", title: "Final Project: Web Scraper", xp: 100 },
        { type: "coding", title: "Coding Session", xp: 40 },
      ],
    },
    {
      date: "2025-03-27",
      count: 1,
      details: [{ type: "coding", title: "Coding Session", xp: 25 }],
    },
    {
      date: "2025-03-25",
      count: 2,
      details: [
        { type: "course", title: "Node.js Backend Development", xp: 55 },
        { type: "coding", title: "Coding Session", xp: 30 },
      ],
    },
    {
      date: "2025-03-22",
      count: 3,
      details: [
        { type: "assignment", title: "Node.js Server Setup", xp: 85 },
        { type: "course", title: "Node.js Backend Development", xp: 45 },
        { type: "coding", title: "Coding Session", xp: 20 },
      ],
    },
    {
      date: "2025-03-20",
      count: 1,
      details: [{ type: "coding", title: "Coding Session", xp: 15 }],
    },
    {
      date: "2025-03-18",
      count: 2,
      details: [
        { type: "course", title: "JavaScript Fundamentals", xp: 50 },
        { type: "coding", title: "Coding Session", xp: 25 },
      ],
    },
    {
      date: "2025-03-15",
      count: 3,
      details: [
        { type: "assignment", title: "Build a Todo App", xp: 120 },
        { type: "course", title: "React Essentials", xp: 60 },
        { type: "coding", title: "Coding Session", xp: 35 },
      ],
    },
    {
      date: "2025-03-12",
      count: 1,
      details: [{ type: "coding", title: "Coding Session", xp: 20 }],
    },
    {
      date: "2025-03-10",
      count: 2,
      details: [
        { type: "course", title: "Python Basics", xp: 45 },
        { type: "coding", title: "Coding Session", xp: 30 },
      ],
    },
    {
      date: "2025-03-08",
      count: 1,
      details: [{ type: "coding", title: "Coding Session", xp: 25 }],
    },
    {
      date: "2025-03-05",
      count: 2,
      details: [
        { type: "assignment", title: "CSS Animations Challenge", xp: 90 },
        { type: "coding", title: "Coding Session", xp: 35 },
      ],
    },
    {
      date: "2025-03-02",
      count: 3,
      details: [
        { type: "course", title: "Advanced CSS & Animations", xp: 55 },
        { type: "assignment", title: "API Integration Project", xp: 110 },
        { type: "coding", title: "Coding Session", xp: 40 },
      ],
    },
    {
      date: "2025-02-28",
      count: 1,
      details: [{ type: "coding", title: "Coding Session", xp: 20 }],
    },
    {
      date: "2025-02-25",
      count: 2,
      details: [
        { type: "course", title: "JavaScript Fundamentals", xp: 60 },
        { type: "coding", title: "Coding Session", xp: 25 },
      ],
    },
  ],
}

export function Profile() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile, badges, and achievements</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <UserInfoCard user={userData} />
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="about">About Me</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <StatsOverview stats={userData.stats} />
              <Achievements achievements={userData.achievements} />
            </TabsContent>

            <TabsContent value="badges" className="pt-4">
              <BadgesGrid badges={userData.badges} />
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <ActivityGraph activityData={userData.activityData} />
            </TabsContent>

            <TabsContent value="heatmap" className="pt-4">
              <ActivityHeatmap data={userData.heatmapData} />
            </TabsContent>

            <TabsContent value="about" className="pt-4">
              <AboutMe user={userData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

