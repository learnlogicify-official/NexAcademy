"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { Search, Trophy, Users, BookOpen } from "lucide-react"

// Mock data for leaderboard
export const leaderboardData = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 7,
      title: "Algorithm Ace",
    },
    xp: 5250,
    rank: 1,
    badges: [
      { name: "Python Master", icon: "🐍" },
      { name: "100 Day Streak", icon: "🔥" },
      { name: "Top Contributor", icon: "⭐" },
    ],
    coursesCompleted: 8,
    isCurrentUser: false,
  },
  {
    id: 2,
    name: "Sarah Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 6,
      title: "Code Virtuoso",
    },
    xp: 4980,
    rank: 2,
    badges: [
      { name: "JavaScript Guru", icon: "🌟" },
      { name: "Bug Hunter", icon: "🐛" },
    ],
    coursesCompleted: 7,
    isCurrentUser: false,
  },
  {
    id: 3,
    name: "Jamie Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 4,
      title: "Syntax Samurai",
    },
    xp: 2450,
    rank: 3,
    badges: [
      { name: "Early Bird", icon: "🌅" },
      { name: "Code Ninja", icon: "🥷" },
    ],
    coursesCompleted: 3,
    isCurrentUser: true,
  },
  {
    id: 4,
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 5,
      title: "Data Dynamo",
    },
    xp: 3100,
    rank: 4,
    badges: [
      { name: "Python Master", icon: "🐍" },
      { name: "Fast Learner", icon: "⚡" },
    ],
    coursesCompleted: 5,
    isCurrentUser: false,
  },
  {
    id: 5,
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 5,
      title: "Frontend Wizard",
    },
    xp: 2950,
    rank: 5,
    badges: [
      { name: "CSS Master", icon: "✨" },
      { name: "UI Expert", icon: "🎨" },
    ],
    coursesCompleted: 4,
    isCurrentUser: false,
  },
  {
    id: 6,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 4,
      title: "Backend Builder",
    },
    xp: 2300,
    rank: 6,
    badges: [
      { name: "Database Guru", icon: "💾" },
      { name: "API Architect", icon: "🔌" },
    ],
    coursesCompleted: 3,
    isCurrentUser: false,
  },
  {
    id: 7,
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 4,
      title: "Testing Titan",
    },
    xp: 2100,
    rank: 7,
    badges: [
      { name: "Bug Hunter", icon: "🐛" },
      { name: "Quality Guardian", icon: "🛡️" },
    ],
    coursesCompleted: 3,
    isCurrentUser: false,
  },
  {
    id: 8,
    name: "Ethan Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 3,
      title: "Mobile Maestro",
    },
    xp: 1950,
    rank: 8,
    badges: [
      { name: "App Developer", icon: "📱" },
      { name: "UI Designer", icon: "🎨" },
    ],
    coursesCompleted: 2,
    isCurrentUser: false,
  },
  {
    id: 9,
    name: "Sophia Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 3,
      title: "DevOps Dynamo",
    },
    xp: 1800,
    rank: 9,
    badges: [
      { name: "Cloud Expert", icon: "☁️" },
      { name: "CI/CD Master", icon: "🔄" },
    ],
    coursesCompleted: 2,
    isCurrentUser: false,
  },
  {
    id: 10,
    name: "Noah Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 3,
      title: "Security Sentinel",
    },
    xp: 1750,
    rank: 10,
    badges: [
      { name: "Ethical Hacker", icon: "🔒" },
      { name: "Firewall Guardian", icon: "🛡️" },
    ],
    coursesCompleted: 2,
    isCurrentUser: false,
  },
]

// Mock data for friends leaderboard
export const friendsLeaderboardData = [
  {
    id: 3,
    name: "Jamie Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 4,
      title: "Syntax Samurai",
    },
    xp: 2450,
    rank: 1,
    badges: [
      { name: "Early Bird", icon: "🌅" },
      { name: "Code Ninja", icon: "🥷" },
    ],
    coursesCompleted: 3,
    isCurrentUser: true,
  },
  {
    id: 11,
    name: "Taylor Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 3,
      title: "React Ranger",
    },
    xp: 1950,
    rank: 2,
    badges: [
      { name: "Component Creator", icon: "⚛️" },
      { name: "Hook Hero", icon: "🪝" },
    ],
    coursesCompleted: 2,
    isCurrentUser: false,
  },
  {
    id: 12,
    name: "Jordan Patel",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 3,
      title: "Python Pioneer",
    },
    xp: 1850,
    rank: 3,
    badges: [
      { name: "Data Scientist", icon: "📊" },
      { name: "ML Enthusiast", icon: "🤖" },
    ],
    coursesCompleted: 2,
    isCurrentUser: false,
  },
  {
    id: 13,
    name: "Riley Cooper",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 2,
      title: "JavaScript Journeyer",
    },
    xp: 1200,
    rank: 4,
    badges: [{ name: "DOM Manipulator", icon: "🔧" }],
    coursesCompleted: 1,
    isCurrentUser: false,
  },
  {
    id: 14,
    name: "Casey Morgan",
    avatar: "/placeholder.svg?height=40&width=40",
    level: {
      number: 2,
      title: "CSS Craftsperson",
    },
    xp: 1100,
    rank: 5,
    badges: [{ name: "Flexbox Fanatic", icon: "📦" }],
    coursesCompleted: 1,
    isCurrentUser: false,
  },
]

// Mock data for courses
export const courses = [
  { id: 1, name: "JavaScript Fundamentals" },
  { id: 2, name: "React Essentials" },
  { id: 3, name: "Python Basics" },
  { id: 4, name: "Data Structures & Algorithms" },
  { id: 5, name: "Node.js Backend Development" },
  { id: 6, name: "Advanced CSS & Animations" },
]

// Mock data for time periods
export const timePeriods = [
  { id: "all-time", name: "All Time" },
  { id: "this-week", name: "This Week" },
  { id: "this-month", name: "This Month" },
  { id: "last-30-days", name: "Last 30 Days" },
]

export function Leaderboard() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("global")
  const [courseFilter, setCourseFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState(leaderboardData)

  // Apply filters
  useEffect(() => {
    let data = activeTab === "global" ? leaderboardData : friendsLeaderboardData

    // Apply search filter
    if (searchQuery) {
      data = data.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // In a real app, you would apply course and time filters here
    // For now, we'll just use the mock data

    setFilteredData(data)
  }, [activeTab, courseFilter, timeFilter, searchQuery])

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>
      </div>

      <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="global" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Global</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Friends</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 sm:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeTab === "courses" && (
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select course" />
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
            )}

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                {timePeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="global" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Global Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {courseFilter === "all"
                  ? "All Courses"
                  : courses.find((c) => c.id.toString() === courseFilter)?.name || "Course"}{" "}
                Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Friends Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable data={filteredData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

