"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Flame,
  Trophy,
  BookOpen,
  Code,
  Search,
  Users,
  Pencil,
  Settings,
  Github,
  Linkedin,
  Twitter,
  Globe,
} from "lucide-react"
import { ProfileHeatmap } from "@/components/profile-heatmap"
import { Input } from "@/components/ui/input"
import { ProgrammingLanguagesCard } from "@/components/programming-languages-card"
import { SkillsCard } from "@/components/skills-card"
import { ContactLinksCard } from "@/components/contact-links-card"
import { ProjectsCard } from "@/components/projects-card"
import { AchievementsCompactCard } from "@/components/achievements-compact-card"
import { ProgressCard } from "@/components/progress-card"
import { ProblemsSolvedCard } from "@/components/problems-solved-card"

// Mock user data
export const userData = {
  name: "Ashwin",
  avatar: "/images/avatar.jpeg",
  level: 4,
  levelTitle: "Syntax Samurai",
  tier: "Platinum",
  tierEmoji: "💠",
  currentXP: 4595,
  nextLevelXP: 5000,
  streak: 3,
  achievements: 7,
  daysActive: 42,
  username: "ashwin_coder",
  bio: "Passionate developer learning to code through gamified experiences. Currently focused on web development and Python.",
  followers: 125,
  following: 87,
  location: "San Francisco, CA",
  website: "ashwin.dev",
  email: "ashwin@example.com",
}

// Mock programming languages data
const programmingLanguages = [
  { name: "JavaScript", proficiency: 85, color: "bg-yellow-500", icon: "🟨" },
  { name: "Python", proficiency: 75, color: "bg-blue-500", icon: "🐍" },
  { name: "TypeScript", proficiency: 70, color: "bg-blue-600", icon: "🔷" },
  { name: "HTML/CSS", proficiency: 90, color: "bg-orange-500", icon: "🌐" },
  { name: "React", proficiency: 80, color: "bg-cyan-500", icon: "⚛️" },
  { name: "Node.js", proficiency: 65, color: "bg-green-500", icon: "🟩" },
  { name: "SQL", proficiency: 60, color: "bg-purple-500", icon: "🗃️" },
]

// Mock skills data
const skills = [
  { name: "Frontend Dev", level: 4, category: "Development" },
  { name: "Backend Dev", level: 3, category: "Development" },
  { name: "UI/UX Design", level: 4, category: "Design" },
  { name: "DevOps", level: 2, category: "Operations" },
  { name: "Data Analysis", level: 3, category: "Data" },
  { name: "Testing", level: 3, category: "Quality Assurance" },
  { name: "Mobile Dev", level: 2, category: "Development" },
  { name: "Algorithms", level: 4, category: "Computer Science" },
  { name: "System Design", level: 3, category: "Computer Science" },
  { name: "API Design", level: 4, category: "Development" },
]

// Mock contact links data
const contactLinks = [
  {
    type: "github",
    username: "ashwin_dev",
    url: "https://github.com/ashwin_dev",
    icon: <Github className="h-4 w-4 text-purple-500" />,
  },
  {
    type: "linkedin",
    username: "ashwin",
    url: "https://linkedin.com/in/ashwin",
    icon: <Linkedin className="h-4 w-4 text-purple-500" />,
  },
  {
    type: "twitter",
    username: "@ashwin_codes",
    url: "https://twitter.com/ashwin_codes",
    icon: <Twitter className="h-4 w-4 text-purple-500" />,
  },
  {
    type: "website",
    username: "ashwin.dev",
    url: "https://ashwin.dev",
    icon: <Globe className="h-4 w-4 text-purple-500" />,
  },
]

// Mock projects data
const projects = [
  {
    name: "Code Quest",
    description: "A gamified learning platform for coding challenges and tutorials.",
    tags: ["React", "Node.js", "MongoDB"],
    repoUrl: "https://github.com/ashwin_dev/code-quest",
    liveUrl: "https://code-quest.vercel.app",
  },
  {
    name: "DevFlow",
    description: "Developer workflow automation tool with CI/CD integration.",
    tags: ["TypeScript", "Express", "Docker"],
    repoUrl: "https://github.com/ashwin_dev/devflow",
  },
  {
    name: "DataViz Dashboard",
    description: "Interactive data visualization dashboard for analytics.",
    tags: ["D3.js", "React", "Python"],
    repoUrl: "https://github.com/ashwin_dev/dataviz",
    liveUrl: "https://dataviz-dashboard.vercel.app",
  },
]

// Mock problems solved data
const problemsData = {
  totalSolved: 87,
  categories: [
    { name: "Easy", count: 42, color: "bg-green-500" },
    { name: "Medium", count: 35, color: "bg-yellow-500" },
    { name: "Hard", count: 10, color: "bg-red-500" },
  ],
  recentStreak: 5,
  successRate: 78,
}

// Mock progress data
const progressItems = [
  { name: "Courses Completed", current: 12, max: 20, color: "bg-rose-500" },
  { name: "Coding Problems", current: 87, max: 150, color: "bg-rose-500" },
  { name: "Badges Earned", current: 24, max: 50, color: "bg-rose-500" },
  { name: "Projects Completed", current: 5, max: 10, color: "bg-rose-500" },
]

export const oldUserData = {
  id: 1,
  username: "ashwin_coder",
  email: "ashwin@example.com",
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
      isPrimary: true,
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

    // Create "HI" pattern in Sep-Oct
    if ((month === 8 || month === 9) && (day % 7 === 1 || day % 7 === 5)) {
      count = Math.max(count, 3)
    }
    if (month === 8 && day % 7 === 3) {
      count = Math.max(count, 3)
    }
    if (month === 9 && day % 7 === 3) {
      count = Math.max(count, 3)
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
  const [user, setUser] = useState(userData)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-8">
      {/* Profile Hero Section */}
      <div className="relative">
        {/* Gradient Banner */}
        <div
          className="h-48 w-full rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #f87171 100%)",
          }}
        />

        {/* Search and User Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <Input
              className="w-64 rounded-full bg-white/20 border-none pl-10 text-white placeholder:text-white/70"
              placeholder="Search friends..."
            />
          </div>
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src="/images/avatar.jpeg" alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <Avatar className="absolute -top-16 left-8 h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src="/images/avatar.jpeg" alt={user.name} />
            <AvatarFallback className="text-3xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          {/* Profile Actions */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 gap-1"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-4 gap-1">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-16">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">@{userData.username}</div>
            </div>

            <div className="mt-3 text-sm space-y-1">
              <p>{userData.bio}</p>
              <div className="flex flex-wrap gap-y-1 mt-2">
                <div className="flex items-center gap-1 text-muted-foreground mr-4">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>
                    Level {userData.level}: {userData.levelTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mr-4">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{userData.streak}-day streak</span>
                </div>
              </div>

              {/* Followers/Following on a new line */}
              <div className="flex items-center gap-1 text-muted-foreground mt-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>
                  {userData.followers} followers · {userData.following} following
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                <Code className="h-3 w-3 mr-1" />
                @github
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                @leetcode
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                {userData.website}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout for Profile Cards */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Activity Heatmap */}
            <motion.div
              className="lg:col-span-2 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ProfileHeatmap data={oldUserData.heatmapData} />
            </motion.div>

            {/* Problems Solved Card (replacing Streak Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProblemsSolvedCard
                totalSolved={problemsData.totalSolved}
                categories={problemsData.categories}
                recentStreak={problemsData.recentStreak}
                successRate={problemsData.successRate}
              />
            </motion.div>

            {/* Programming Languages Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ProgrammingLanguagesCard languages={programmingLanguages} />
            </motion.div>

            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SkillsCard skills={skills} />
            </motion.div>

            {/* Contact Links Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ContactLinksCard links={contactLinks} email={userData.email} />
            </motion.div>

            {/* Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ProjectsCard projects={projects} />
            </motion.div>

            {/* Achievements Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <AchievementsCompactCard achievements={oldUserData.badges} />
            </motion.div>

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <ProgressCard items={progressItems} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
