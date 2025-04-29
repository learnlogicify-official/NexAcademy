import { SiPython, SiJavascript, SiReact } from "react-icons/si"
import { CheckCircle, Award, Trophy, CloudLightningIcon as Lightning } from "lucide-react"
import type { Course } from "./course-card"
import type { Quest } from "./quest-item"
import type { ActivityItem } from "./activity-feed"
import type { Achievement } from "./achievements-list"
import type { UserData } from "./welcome-section"
import type { StreakDay } from "./daily-streak-card"
import type { Event } from "./upcoming-events-card"

// User data
export const userData: UserData = {
  name: "Ashwin",
  avatar: "/images/avatar.jpeg",
  level: 4,
  levelTitle: "Syntax Samurai",
  tier: "Platinum Tier",
  tierEmoji: "💠",
  currentXP: 4595,
  nextLevelXP: 5000,
  streak: 3,
  achievements: 7,
  daysActive: 42,
}

// Course data
export const coursesData: Course[] = [
  {
    id: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript with practical examples and interactive exercises",
    instructor: "Alex Johnson",
    earnedXP: 750,
    totalXP: 1000,
    progress: 75,
    lastAccessed: "2 days ago",
    tags: ["javascript", "web development", "programming"],
    certificate: false,
    level: "Beginner",
    icon: SiJavascript,
    bannerColor: "rgb(255, 240, 200)",
    topics: 8,
    videos: 16,
    rating: 4.7,
    enrolledCount: 1800,
    isLiked: true,
    url: "/my-learning/javascript-fundamentals",
  },
  {
    id: "react-essentials",
    title: "React Essentials",
    description: "Master React.js through hands-on projects and component-based architecture",
    instructor: "Sarah Miller",
    earnedXP: 450,
    totalXP: 1000,
    progress: 45,
    lastAccessed: "Yesterday",
    tags: ["react", "javascript", "frontend"],
    certificate: false,
    level: "Intermediate",
    icon: SiReact,
    bannerColor: "rgb(220, 242, 250)",
    topics: 10,
    videos: 22,
    rating: 4.8,
    enrolledCount: 2200,
    isLiked: false,
    url: "/my-learning/react-essentials",
  },
  {
    id: "python-basics",
    title: "Python Basics",
    description: "Learn the fundamentals of Python programming language with hands-on projects and exercises",
    instructor: "Michael Chen",
    earnedXP: 900,
    totalXP: 1000,
    progress: 90,
    lastAccessed: "Today",
    tags: ["python", "programming", "basics"],
    certificate: false,
    level: "Beginner",
    icon: SiPython,
    bannerColor: "rgb(230, 250, 230)",
    topics: 12,
    videos: 24,
    rating: 4.9,
    enrolledCount: 3500,
    isLiked: true,
    url: "/my-learning/python-basics",
  },
]

// Daily quests data
export const questsData: Quest[] = [
  { id: "1", text: "Complete JavaScript Module 7", xp: 50, completed: true, type: "study" },
  { id: "2", text: "Solve 3 Python challenges", xp: 75, completed: false, type: "challenge" },
  { id: "3", text: "Watch React Component tutorial", xp: 30, completed: false, type: "study" },
  { id: "4", text: "Submit weekly assignment", xp: 100, completed: false, type: "practice" },
  { id: "5", text: "Help in community forum", xp: 25, completed: true, type: "practice" },
]

// Activity feed data
export const activityFeedData: ActivityItem[] = [
  {
    id: 1,
    title: "Completed Python Chapter 11",
    time: "Today, 9:25 AM",
    xp: 75,
    type: "chapter",
    icon: <CheckCircle className="text-green-500" />,
  },
  {
    id: 2,
    title: "Earned 'Fast Learner' Badge",
    time: "Yesterday, 4:15 PM",
    type: "badge",
    icon: <Award className="text-amber-500" />,
  },
  {
    id: 3,
    title: "Reached Level 4: Syntax Samurai",
    time: "Yesterday, 2:30 PM",
    xp: 0,
    type: "level",
    icon: <Trophy className="text-primary" />,
  },
  {
    id: 4,
    title: "Answered Forum Question",
    time: "Apr 5, 11:20 AM",
    xp: 25,
    type: "forum",
    icon: <Lightning className="text-blue-500" />,
  },
]

// Achievements data
export const achievementsData: Achievement[] = [
  { id: 1, title: "Fast Learner", description: "Complete 3 lessons in a day", progress: 100, icon: "🚀" },
  { id: 2, title: "Code Streak", description: "Learn for 7 consecutive days", progress: 43, icon: "🔥" },
  { id: 3, title: "Quiz Master", description: "Get perfect score on 3 quizzes", progress: 67, icon: "🧠" },
]

// Weekly streak data
export const weeklyStreakData: StreakDay[] = [
  { day: "Su", completed: true },
  { day: "M", completed: true },
  { day: "Tu", completed: true },
  { day: "W", completed: true },
  { day: "Th", completed: true },
  { day: "F", completed: false },
  { day: "Sa", completed: false },
]

// Upcoming events data
export const upcomingEventsData: Event[] = [
  {
    id: 1,
    title: "Data Structures Quiz",
    date: "Apr 12",
    time: "3:00 PM",
    type: "quiz",
    course: "JavaScript Fundamentals",
  },
  {
    id: 2,
    title: "Live Coding Session",
    date: "Apr 15",
    time: "2:00 PM",
    type: "live",
    course: "Python Basics",
  },
  {
    id: 3,
    title: "Code Project Deadline",
    date: "Apr 18",
    time: "11:59 PM",
    type: "deadline",
    course: "React Essentials",
  },
]

// Player stats
export const playerStatsData = {
  coursesEnrolled: 8,
  achievements: 7,
  problemsSolved: 42,
  daysActive: 42,
}