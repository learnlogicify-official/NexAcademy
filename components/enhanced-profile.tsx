"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Pencil, Flame, Trophy, BookOpen, FileText, Code, Github } from "lucide-react"
import { ProfileHeatmap } from "@/components/profile-heatmap"
import { ProfileOverview } from "@/components/profile-overview"
import { ProfileBadges } from "@/components/profile-badges"
import { ProfileCourses } from "@/components/profile-courses"
import { ProfileSubmissions } from "@/components/profile-submissions"
import { EditProfileDialog } from "@/components/edit-profile-dialog"

// Mock user data
export const userData = {
  id: 1,
  name: "Jamie Smith",
  username: "jamie_coder",
  email: "jamie.smith@example.com",
  avatar: "/placeholder.svg?height=100&width=100",
  level: {
    number: 4,
    title: "Syntax Samurai",
    progress: 82,
  },
  xp: {
    current: 2450,
    nextLevel: 3000,
  },
  streak: 3,
  joinedDate: "2024-01-15",
  bio: "Passionate developer learning to code through gamified experiences. Currently focused on web development and Python.",
  stats: {
    totalXP: 2450,
    coursesCompleted: 1,
    coursesInProgress: 2,
    assignmentsCompleted: 8,
    assignmentsPending: 5,
    codingHours: 42,
    daysActive: 24,
    problemsSolved: 37,
    submissions: 52,
    successRate: 71,
  },
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
  heatmapData: generateHeatmapData(),
}

// Generate mock heatmap data for the last 365 days
function generateHeatmapData() {
  const data = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate random activity count (more likely to be 0-2, occasionally higher)
    let count = 0
    const rand = Math.random()

    if (rand < 0.45) {
      count = 0 // 45% chance of no activity
    } else if (rand < 0.7) {
      count = 1 // 25% chance of 1 activity
    } else if (rand < 0.85) {
      count = 2 // 15% chance of 2 activities
    } else if (rand < 0.95) {
      count = 3 // 10% chance of 3 activities
    } else {
      count = 4 + Math.floor(Math.random() * 4) // 5% chance of 4-7 activities
    }

    // Create streaks (consecutive days with activity)
    // Last 7 days have higher chance of activity for current streak
    if (i < 7) {
      if (i === 0 || i === 1 || i === 3) {
        // Today, yesterday, and 3 days ago
        count = Math.max(count, 1 + Math.floor(Math.random() * 3))
      }
    }

    // Create some patterns - more activity on weekends
    const dayOfWeek = date.getDay()
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.4) {
      count = Math.max(count, 1 + Math.floor(Math.random() * 4))
    }

    // Add some "hot" periods (e.g., project weeks)
    const month = date.getMonth()
    const day = date.getDate()

    // Project week in March
    if (month === 2 && day >= 15 && day <= 21) {
      count = Math.max(count, Math.floor(Math.random() * 5) + 1)
    }

    // Project week in January
    if (month === 0 && day >= 10 && day <= 16) {
      count = Math.max(count, Math.floor(Math.random() * 5) + 1)
    }

    data.push({
      date: date.toISOString().split("T")[0],
      count,
      details: count > 0 ? generateActivityDetails(count, date) : [],
    })
  }

  return data
}

// Generate mock activity details
function generateActivityDetails(count, date) {
  const activityTypes = ["assignment", "course", "coding", "problem"]
  const details = []

  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    let title, xp

    switch (type) {
      case "assignment":
        title = `${["Completed", "Submitted", "Worked on"][Math.floor(Math.random() * 3)]} ${["JavaScript", "Python", "React", "CSS", "Data Structures"][Math.floor(Math.random() * 5)]} ${["Assignment", "Project", "Exercise", "Challenge"][Math.floor(Math.random() * 4)]}`
        xp = 50 + Math.floor(Math.random() * 100)
        break
      case "course":
        title = `${["Progressed in", "Completed module in", "Started"][Math.floor(Math.random() * 3)]} ${["JavaScript Fundamentals", "Python Basics", "React Essentials", "Data Structures", "Algorithms"][Math.floor(Math.random() * 5)]}`
        xp = 20 + Math.floor(Math.random() * 60)
        break
      case "coding":
        title = `${["Morning", "Afternoon", "Evening", "Late night"][Math.floor(Math.random() * 4)]} coding session`
        xp = 10 + Math.floor(Math.random() * 40)
        break
      case "problem":
        title = `Solved ${["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)]} problem: ${["Array", "String", "Tree", "Graph", "DP"][Math.floor(Math.random() * 5)]} ${["Manipulation", "Traversal", "Search", "Optimization"][Math.floor(Math.random() * 4)]}`
        xp = 30 + Math.floor(Math.random() * 120)
        break
    }

    details.push({
      type,
      title,
      xp,
      timestamp: new Date(date).toISOString(),
    })
  }

  return details
}

export function EnhancedProfile() {
  const [mounted, setMounted] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState(userData)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleProfileUpdate = (updatedData) => {
    setUser({ ...user, ...updatedData })
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        className="rounded-xl bg-card p-6 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start md:flex-row md:gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 text-center md:text-left md:mt-0">
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant="outline" className="text-xs">
                  @{user.username}
                </Badge>
              </div>

              <div className="mt-1 flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <Badge className="level-badge gap-1 px-2 py-1">
                  <Trophy className="h-3.5 w-3.5" />
                  Level {user.level.number}: {user.level.title}
                </Badge>
                <Badge variant="outline" className="gap-1 px-2 py-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {user.streak}-day streak
                </Badge>
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                <p>{user.bio}</p>
              </div>

              <div className="mt-3">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mt-0 md:ml-auto">
            <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3">
              <Trophy className="h-5 w-5 text-primary mb-1" />
              <span className="text-xl font-bold">{user.xp.current.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Total XP</span>
            </div>

            <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3">
              <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xl font-bold">{user.stats.coursesCompleted}</span>
              <span className="text-xs text-muted-foreground">Courses</span>
            </div>

            <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3">
              <FileText className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-xl font-bold">{user.stats.assignmentsCompleted}</span>
              <span className="text-xs text-muted-foreground">Assignments</span>
            </div>

            <div className="flex flex-col items-center rounded-lg bg-secondary/30 p-3">
              <Code className="h-5 w-5 text-purple-500 mb-1" />
              <span className="text-xl font-bold">{user.stats.problemsSolved}</span>
              <span className="text-xs text-muted-foreground">Problems</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span>Level {user.level.number} Progress</span>
            <span>
              {user.xp.current} / {user.xp.nextLevel} XP
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={user.level.progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">{user.level.progress}%</span>
          </div>
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        className="rounded-xl bg-card p-6 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Coding Activity</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 sm:mt-0">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-3 rounded-sm bg-primary/10"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/25"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/40"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/60"></div>
              <div className="h-3 w-3 rounded-sm bg-primary/80"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <ProfileHeatmap data={user.heatmapData} />

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{user.streak}-day streak</span>
            <span className="text-muted-foreground">· {user.stats.daysActive} active days this year</span>
          </div>
          <div className="text-muted-foreground">
            {user.heatmapData.reduce((sum, day) => sum + day.count, 0)} total activities in the last year
          </div>
        </div>
      </motion.div>

      {/* Tabbed Content */}
      <motion.div
        className="rounded-xl bg-card shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="badges"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Badges
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Submissions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6">
            <ProfileOverview user={user} />
          </TabsContent>

          <TabsContent value="badges" className="p-6">
            <ProfileBadges badges={user.badges} />
          </TabsContent>

          <TabsContent value="courses" className="p-6">
            <ProfileCourses />
          </TabsContent>

          <TabsContent value="submissions" className="p-6">
            <ProfileSubmissions />
          </TabsContent>
        </Tabs>
      </motion.div>

      <EditProfileDialog
        user={user}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  )
}

