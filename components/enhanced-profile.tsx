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
  Camera,
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
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import ProfilePictureStep from "@/components/onboarding/profile-picture-step"
import BannerImageStep from "@/components/onboarding/banner-image-step"
import { useProfilePic } from "@/components/ProfilePicContext"
import { format } from "date-fns"

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
  profilePic: undefined,
  bannerImage: undefined,
  heatmapData: generateHeatmapData()
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
  totalProblems: 3520,
  categories: [
    { name: "Easy", count: 42, color: "#4ade80", textColor: "text-emerald-500", percentage: 48 },
    { name: "Medium", count: 35, color: "#fbbf24", textColor: "text-amber-500", percentage: 40 },
    { name: "Hard", count: 10, color: "#f87171", textColor: "text-red-500", percentage: 12 },
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

interface HeatmapDataEntry {
  date: string; 
  count: number; 
  details?: { 
    type: string; 
    title: string; 
    xp: number; 
    timestamp: string; 
  }[]
}

// Generate mock heatmap data for the last 365 days
function generateHeatmapData(): HeatmapDataEntry[] {
  const result: HeatmapDataEntry[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 365);
  
  // Generate a sparse set of entries with varying activity levels
  for (let i = 0; i < 80; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.floor(Math.random() * 365));
    
    // Format date as YYYY-MM-DD
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Only add if we don't already have this date
    if (!result.find(entry => entry.date === dateStr)) {
      // Random activity count between 1 and 4
      const count = Math.floor(Math.random() * 4) + 1;
      
      result.push({
        date: dateStr,
        count,
        details: generateActivityDetails(count, date)
      });
    }
  }
  
  return result;
}

// Generate mock activity details
function generateActivityDetails(count: number, date: Date): { type: string; title: string; xp: number; timestamp: string }[] {
  const activityTypes = ["assignment", "course", "coding", "problem"]
  const details = []

  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    let title = "", xp = 0

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

interface PublicUser {
  id?: string | null
  name?: string | null
  username?: string | null
  bio?: string | null
  profilePic?: string | null
  bannerImage?: string | null
}

interface EnhancedProfileProps {
  user?: PublicUser | null
  userStreak?: any
  heatmapData?: any[]
  submissionStats?: any
  problemsByDifficulty?: {
    totalSolved: number
    totalProblems: number
    categories: {
      name: string
      count: number
      color: string
      textColor: string
      percentage: number
    }[]
  }
}

export function EnhancedProfile({ 
  user: passedUser, 
  userStreak,
  heatmapData,
  submissionStats,
  problemsByDifficulty
}: EnhancedProfileProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPicDialogOpen, setIsPicDialogOpen] = useState(false)
  const [profilePic, setProfilePic] = useState(passedUser?.profilePic || session?.user?.profilePic || "")
  const { bannerImage, setBannerImage } = useProfilePic();
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") return null;

  // Use passed user, then session user, then mock data
  const user = passedUser || session?.user || userData;
  const signedInUser = session?.user;
  const isOwnProfile = signedInUser && user.username === signedInUser.username;

  const bannerToShow = isOwnProfile ? bannerImage : user.bannerImage;

  // Use passed heatmap data if available, otherwise use the mock data
  const activityData = heatmapData || userData.heatmapData;
  
  // Use streak data if available
  const streakCount = userStreak?.currentStreak || userData.streak;
  const longestStreak = userStreak?.longestStreak || streakCount;
  
  // Use problems data if available, otherwise use mock data
  const problems = problemsByDifficulty || problemsData;

  // Use submission stats if available
  const hasSubmissionStats = submissionStats && Array.isArray(submissionStats) && submissionStats.length > 0;

  return (
    <div className="space-y-8">
      {/* Profile Hero Section */}
      <div className="relative">
        {/* Banner with edit button */}
        <div className="h-48 w-full rounded-xl overflow-hidden relative">
          {bannerToShow ? (
            <img src={bannerToShow} alt="Profile Banner" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900" />
          )}
          {isOwnProfile && (
            <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="absolute top-2 right-2 bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg border-2 border-white hover:bg-primary/90 transition"
                  title="Change profile banner"
                >
                  <span className="text-xl font-bold leading-none">✎</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Change Profile Banner</DialogTitle>
                <BannerImageStep
                  bannerImage={bannerImage}
                  updateBannerImage={setBannerImage}
                  onClose={() => setIsBannerDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and User Controls */}
       

        {/* Profile Info Section */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-8 h-32 w-32">
            <div className="relative h-full w-full">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                {user.profilePic ? (
                  <AvatarImage src={user.profilePic ?? undefined} alt={user.name ?? "User"} />
                ) : (
                  <AvatarImage src="/images/avatar.jpeg" alt={user.name ?? "User"} />
                )}
                <AvatarFallback className="text-3xl">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Dialog open={isPicDialogOpen} onOpenChange={setIsPicDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="absolute bottom-2 right-0.5 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white hover:bg-primary/90 transition"
                      title="Change profile picture"
                    >
                      <span className="block w-full h-full flex items-center justify-center text-xl font-bold leading-none">+</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                    <ProfilePictureStep
                      profilePic={profilePic}
                      updateProfilePic={(url) => setProfilePic(url)}
                      onNext={() => setIsPicDialogOpen(false)}
                      onBack={() => setIsPicDialogOpen(false)}
                      username={user.username || ""}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-16">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground text-base font-mono">@{user.username}</div>
              
            </div>

            <div className="mt-3 text-sm space-y-1">
              <p>{user.bio}</p>
              <div className="flex flex-wrap gap-y-1 mt-2">
                <div className="flex items-center gap-1 text-muted-foreground mr-4">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>
                    Level {userData.level}: {userData.levelTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mr-4">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{streakCount}-day streak</span>
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
              <ProfileHeatmap data={activityData} submissionStats={submissionStats} />
            </motion.div>

            {/* Problems Solved Card (replacing Streak Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProblemsSolvedCard
                totalSolved={problems.totalSolved}
                totalProblems={problems.totalProblems}
                categories={problems.categories}
                className="bg-white dark:bg-[#18181b]"
              />
            </motion.div>

            {/* Programming Languages Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ProgrammingLanguagesCard languages={programmingLanguages} className="bg-white dark:bg-[#18181b]" />
            </motion.div>

            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SkillsCard skills={skills} className="bg-white dark:bg-[#18181b]" />
            </motion.div>

            {/* Contact Links Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ContactLinksCard links={contactLinks} email={userData.email} className="bg-white dark:bg-[#18181b]" isOwnProfile={isOwnProfile} key={`contact-${Math.random()}`} />
            </motion.div>

            {/* Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ProjectsCard 
                projects={projects} 
                className="bg-white dark:bg-[#18181b]" 
                isOwnProfile={isOwnProfile}
                key={`projects-${Math.random()}`}
              />
            </motion.div>

            {/* Achievements Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <AchievementsCompactCard achievements={oldUserData.badges} className="bg-white dark:bg-[#18181b]" />
            </motion.div>

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <ProgressCard items={progressItems} className="bg-white dark:bg-[#18181b]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Display submission stats if available */}
      {hasSubmissionStats && (
        <div className="bg-white dark:bg-[#121212] rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Problem Submission Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {submissionStats.map((stat: any) => (
              <div key={stat.status || 'UNKNOWN'} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.status || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add a streak display component */}
      <div className="bg-white dark:bg-[#121212] rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Streak Stats</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
            </div>
            <div className="text-3xl font-bold mt-2">{streakCount} {streakCount === 1 ? 'day' : 'days'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
            </div>
            <div className="text-3xl font-bold mt-2">{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
