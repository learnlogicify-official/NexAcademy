"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityCalendar, type CalendarData } from "@/components/coding-portfolio/activity-calendar"
import { ProfileHeatmap } from "@/components/profile-heatmap"
import { PortfolioHeatmap, type ActivityData } from "@/components/coding-portfolio/portfolio-heatmap"
import { ProblemsSolvedCard } from "@/components/problems-solved-card"
import {
  Code,
  Trophy,
  Loader2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Sigma,
  Sparkles,
  CheckCircle2,
  Star,
  BarChart3,
  TrendingUp,
  Flame,
  Clock,
  ChevronDown,
  Filter,
  CalendarDays,
  BarChart4,
  LineChart,
  PieChart,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PlatformProfile } from "./types"

// A modern, premium dashboard to showcase and track coding profiles and activity across platforms
// Designed with glass-morphism, premium animations, and elegant data visualization

// Define interface for ProfileHeatmap data
interface HeatmapData {
  date: string
  count: number
  verdictSummary?: Array<{
    status: string
    readableStatus: string
    count: number
    color: string
  }>
}

interface PlatformProblem {
  id: string
  name: string
  color: string
  icon: string
  count: number
  percentage: number
}

interface CodingDashboardProps {
  totalSolved?: number
  activeDays?: number
  totalContests?: number
  streak?: number
  maxStreak?: number
  calendarData?: CalendarData[]
  easyCount?: number
  mediumCount?: number
  hardCount?: number
  platformProblems?: PlatformProblem[]
  platforms?: PlatformProfile[] // Add this line to accept platforms prop
  statsCardWeeklyTrend?: number // Add this prop
}

const SUPPORTED_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", icon: "/images/platforms/leetcode.svg", color: "#FFA116" },
  { id: "codechef", name: "CodeChef", icon: "/images/platforms/codechef.svg", color: "#5B4638" },
  { id: "codeforces", name: "CodeForces", icon: "/images/platforms/codeforces.svg", color: "#1F8ACB" },
  { id: "geeksforgeeks", name: "GeeksForGeeks", icon: "/images/platforms/gfg.svg", color: "#2F8D46" },
  { id: "hackerrank", name: "HackerRank", icon: "/images/platforms/hackerrank.svg", color: "#00EA64" },
  { id: "hackerearth", name: "HackerEarth", icon: "/images/platforms/hackerearth.svg", color: "#2C3454" },
  { id: "codingninjas", name: "Coding Ninjas", icon: "/images/platforms/codingninjas.svg", color: "#FC4F41" },
]

export function CodingDashboard({ 
  totalSolved: propsTotalSolved, 
  activeDays: propsActiveDays, 
  totalContests = 0, 
  streak = 0, 
  maxStreak = 0, 
  calendarData: propsCalendarData,
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  platformProblems = [],
  platforms = [], // Add default empty array
  statsCardWeeklyTrend // Add prop
}: CodingDashboardProps) {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<PlatformProfile[]>([])
  // Initialize loading to false if we already have calendar data
  const [loading, setLoading] = useState(!propsCalendarData || propsCalendarData.length === 0)
  const [activeTab, setActiveTab] = useState("overview")
  const [calendarData, setCalendarData] = useState<CalendarData[]>(propsCalendarData || [])
  const [calendarTheme, setCalendarTheme] = useState({
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  })
  const [timeRange, setTimeRange] = useState("year")
  const [activityView, setActivityView] = useState("calendar")

  useEffect(() => {
    // If platforms are provided, use them directly
    if (platforms.length > 0) {
      setProfiles(platforms);
      setLoading(false);
    } else {
      // Otherwise try to fetch data
      fetchPlatformData();
    }
  }, [platforms])

  useEffect(() => {
    // Use prop calendar data if provided, otherwise keep the mock data
    if (propsCalendarData && propsCalendarData.length > 0) {
      console.log("Using provided calendar data:", propsCalendarData);
      setCalendarData(propsCalendarData);
      setLoading(false); // End loading when we have the real data
    }
  }, [propsCalendarData])

  const fetchPlatformData = async () => {
    setLoading(true)
    try {
      // Fetch platform data for the current logged in user from the backend API
      // Assumes you have an endpoint like /api/coding-portfolio/profiles that returns PlatformProfile[] for the current user
      const res = await fetch("/api/coding-portfolio/profiles", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch platform data");
      }

      const userProfiles: PlatformProfile[] = await res.json();
      setProfiles(userProfiles);

      // Only process activity data if we don't have prop data
      if ((!propsCalendarData || propsCalendarData.length === 0) && userProfiles.length > 0) {
        // Process activity data for the calendar
        const allActivityData = userProfiles.flatMap((p) => p.activityHeatmap || []);

        // Deduplicate and merge counts for the same date
        const dateMap = new Map<string, number>();
        allActivityData.forEach((item) => {
          const existingCount = dateMap.get(item.date) || 0;
          dateMap.set(item.date, existingCount + item.count);
        });

        // Convert to CalendarData format
        const processedData: CalendarData[] = Array.from(dateMap.entries()).map(([date, count]) => ({
          date,
          count,
          level: getLevelForCount(count),
        }));

        setCalendarData(processedData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load your coding profile data",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  // Helper function to determine level based on count
  const getLevelForCount = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0
    if (count <= 1) return 1
    if (count <= 3) return 2
    if (count <= 5) return 3
    return 4
  }

  // Calculate total metrics
  const calculatedTotalSolved = profiles.reduce((acc, profile) => acc + (profile.totalSolved || 0), 0)
  // Use provided prop value if available, otherwise use calculated value
  const totalSolved = propsTotalSolved !== undefined ? propsTotalSolved : calculatedTotalSolved
  const totalSubmissions = profiles.flatMap((p) => p.activityHeatmap || []).reduce((acc, day) => acc + day.count, 0)

  // Unique active days: collect all dates from activityHeatmap and count unique
  const allActiveDates = new Set(
    profiles.flatMap((profile) =>
      (profile.activityHeatmap || []).map((day) => {
        // Normalize date to YYYY-MM-DD
        const d = new Date(day.date)
        return isNaN(d.getTime()) ? day.date : d.toISOString().split("T")[0]
      }),
    ),
  )

  // Use provided prop value if available, otherwise use calculated value
  const totalActiveDays = propsActiveDays !== undefined ? propsActiveDays : allActiveDates.size
  // Use the props for streaks and contests
  const currentStreak = streak
  const bestStreak = maxStreak
  const contestsCount = totalContests

  // Get problems by difficulty across all platforms
  const problemsByDifficulty: Record<string, number> = {}
  
  // Use props values if provided, otherwise compute from profiles
  if (easyCount > 0 || mediumCount > 0 || hardCount > 0) {
    problemsByDifficulty.easy = easyCount;
    problemsByDifficulty.medium = mediumCount;
    problemsByDifficulty.hard = hardCount;
  } else {
    profiles.forEach((profile) => {
      const profileDifficulties = profile.problemsByDifficulty || {}
      Object.entries(profileDifficulties).forEach(([difficulty, count]) => {
        problemsByDifficulty[difficulty] = (problemsByDifficulty[difficulty] || 0) + (count as number)
      })
    })
  }

  // Platform-specific metrics
  const platformMetrics = SUPPORTED_PLATFORMS.map((platform) => {
    const profile = profiles.find((p) => p.platform === platform.id)
    return {
      ...platform,
      connected: !!profile,
      totalSolved: profile?.totalSolved || 0,
      rating: profile?.rating || 0,
      username: profile?.username || "",
      rank: profile?.rank !== undefined && profile?.rank !== null && profile?.rank !== "" ? profile.rank : "N/A",
      data: profile?.data // Add the data property for use in special cases
    }
  })

  // Calculate activity trends
  const getActivityTrend = () => {
    // Sort dates
    const sortedDates = [...calendarData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sortedDates.length < 14) return { trend: 0, percentage: 0 }

    // Get last 7 days and previous 7 days
    const last7Days = sortedDates.slice(-7)
    const previous7Days = sortedDates.slice(-14, -7)

    const last7Sum = last7Days.reduce((sum, day) => sum + day.count, 0)
    const previous7Sum = previous7Days.reduce((sum, day) => sum + day.count, 0)

    if (previous7Sum === 0) return { trend: 1, percentage: 100 }

    const trend = last7Sum - previous7Sum
    const percentage = Math.round((trend / previous7Sum) * 100)

    return { trend, percentage }
  }

  const activityTrend = getActivityTrend()

  // Calculate most active day of week
  const getMostActiveDayOfWeek = () => {
    const dayCount = [0, 0, 0, 0, 0, 0, 0] // Sun to Sat

    calendarData.forEach((day) => {
      const date = new Date(day.date)
      if (!isNaN(date.getTime())) {
        const dayOfWeek = date.getDay()
        dayCount[dayOfWeek] += day.count
      }
    })

    const maxCount = Math.max(...dayCount)
    const mostActiveDay = dayCount.indexOf(maxCount)

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return { day: days[mostActiveDay], count: maxCount }
  }

  const mostActiveDay = getMostActiveDayOfWeek()

  // Calculate average daily submissions
  const getAverageDailySubmissions = () => {
    if (calendarData.length === 0) return 0

    const totalSubmissions = calendarData.reduce((sum, day) => sum + day.count, 0)
    const activeDays = calendarData.filter((day) => day.count > 0).length

    return activeDays > 0 ? Math.round((totalSubmissions / activeDays) * 10) / 10 : 0
  }

  const averageDailySubmissions = getAverageDailySubmissions()

  // Generate monthly activity data for bar chart
  const getMonthlyActivityData = () => {
    const monthlyData = Array(12).fill(0)
    const currentYear = new Date().getFullYear()

    calendarData.forEach((day) => {
      const date = new Date(day.date)
      if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
        const month = date.getMonth()
        monthlyData[month] += day.count
      }
    })

    return monthlyData
  }

  const monthlyActivityData = getMonthlyActivityData()
  const maxMonthlyActivity = Math.max(...monthlyActivityData)
  
  // Transform CalendarData to format needed for ProfileHeatmap
  const transformToHeatmapData = (): ActivityData[] => {
    const filteredData = filterCalendarDataByTimeRange(calendarData, timeRange);
    return filteredData.map(item => ({
      date: item.date,
      count: item.count,
      verdictSummary: [
        {
          status: "ACCEPTED",
          readableStatus: "Accepted",
          count: item.count,
          color: "#4ade80"
        }
      ]
    }));
  };

  // Main dashboard tabs
  const [activeMainTab, setActiveMainTab] = useState("overview")
  
  // Filter calendar data based on selected time range
  const filterCalendarDataByTimeRange = (data: CalendarData[], range: string): CalendarData[] => {
    if (!data.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (range) {
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
      default:
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate && itemDate <= now;
    });
  };
  console.log("profiles",profiles);
  // Find the last three contests across LeetCode, Codeforces, and CodeChef
  // Gather all contest histories from all connected platforms, flatten, and find the last three contests with platform name and rank
  const recentContests = profiles
    .flatMap((profile) =>
      (profile.contestHistory || []).map((contest: any) => ({
        ...contest,
        platform: profile.platform,
        platformName:
          SUPPORTED_PLATFORMS.find((pl) => pl.id === profile.platform)?.name || profile.platform,
        platformIcon:
          SUPPORTED_PLATFORMS.find((pl) => pl.id === profile.platform)?.icon,
        platformColor:
          SUPPORTED_PLATFORMS.find((pl) => pl.id === profile.platform)?.color,
        rank: contest.rank || contest.position || contest.standing || 0,
      }))
    )
    .filter((c: any) => c.date)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  console.log(recentContests);
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton for Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-4 shadow-lg h-48 animate-pulse">
              <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
              <div className="h-8 w-1/4 bg-slate-300 dark:bg-slate-600 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-3 w-4/5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-300 dark:bg-slate-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Skeleton for Activity Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-40 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="h-5 w-24 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 shadow-lg animate-pulse">
            <div className="h-48 w-full">
              <div className="grid grid-cols-7 gap-1 h-full">
                {[...Array(7)].map((_, weekday) => (
                  <div key={weekday} className="flex flex-col gap-1">
                    {[...Array(20)].map((_, day) => (
                      <div 
                        key={day} 
                        className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600"
                        style={{ opacity: Math.random() * 0.7 + 0.2 }}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Activity insights skeleton */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Skeleton for Problems & Contests section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-5 w-20 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 shadow-lg h-80 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                  <div className="h-36 w-full bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-3 w-5/6 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-3 w-4/6 bg-slate-300 dark:bg-slate-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 mb-6">
          <Code className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          No platforms connected
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your competitive programming profiles to see all your stats in one place.
        </p>
        <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          <a href="/coding-portfolio/connect">Connect Platforms</a>
        </Button>
      </div>
    )
  }

  // --- Platform-wise contest counts ---
  const platformContestCounts: Record<string, number> = {};
  profiles.forEach(profile => {
    const data: any = profile.data || {};
    let count = 0;
    if (profile.platform === 'hackerrank') {
      if (Array.isArray(data.ratingHistory)) {
        data.ratingHistory.forEach((entry: any) => {
          if (Array.isArray(entry.events)) {
            count += entry.events.length;
          }
        });
      }
    } else if (profile.platform === 'hackerearth') {
      if (Array.isArray(data.ratingHistory)) {
        count += data.ratingHistory.length;
      }
    } else if (profile.platform === 'codingninjas') {
      // Special handling for CodingNinjas contest attendance
      if (data.contests && typeof data.contests === 'object') {
        // Check for attended field in contests object
        if (typeof data.contests.attended === 'number') {
          count += data.contests.attended;
        } else if (data.contestCount && typeof data.contestCount === 'number') {
          count += data.contestCount;
        }
      } else if (profile.contests) {
        // If already processed in the profile data
        count += profile.contests;
      }
    } else {
      if (Array.isArray(data.contests)) {
        count += data.contests.length;
      } else if (Array.isArray(data.contestHistory)) {
        count += data.contestHistory.length;
      } else if (typeof data.contests === 'number') {
        count += data.contests;
      }
    }
    platformContestCounts[profile.platform] = count;
  });

  // Calculate last solved label from calendarData
  let lastSolvedLabel = "Never";
  if (calendarData && calendarData.length > 0) {
    const activeDays = calendarData.filter(day => day.count > 0);
    if (activeDays.length > 0) {
      const lastDateStr = activeDays.reduce((latest, day) =>
        new Date(day.date) > new Date(latest) ? day.date : latest,
        activeDays[0].date
      );
      const lastDate = new Date(lastDateStr);
      const today = new Date();
      lastDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) lastSolvedLabel = "Today";
      else if (diffDays === 1) lastSolvedLabel = "Yesterday";
      else lastSolvedLabel = `${diffDays} days ago`;
    }
  }

  return (
    <div className="space-y-10 relative">
      <div className="mt-6">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <div className="border-b border-slate-200 dark:border-slate-800">
            <TabsList className="bg-transparent h-12 p-0 w-full justify-start gap-3">
              <TabsTrigger
                value="overview"
                className="z-20 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="contests"
                className="z-20 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
              >
                Contest Analysis
              </TabsTrigger>
              {profiles.map((profile) => {
                const platform = SUPPORTED_PLATFORMS.find((p) => p.id === profile.platform)
                return (
                  <TabsTrigger
                    key={profile.platform}
                    value={profile.platform}
                    className="z-20 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-white dark:bg-slate-800 p-0.5 flex items-center justify-center">
                        <img
                          src={platform?.icon || "/placeholder.svg"}
                          alt={platform?.name || profile.platform}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span>{platform?.name || profile.platform}</span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-8">
              {/* Activity Heatmap */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300">
                      Activity Heatmap
                    </h2>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 shadow-sm">
                    {totalActiveDays} active days
                  </div>
                </div>

                <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/90 dark:to-blue-900/20">
                  {/* Premium decorative elements - make them not block pointer events */}
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/10 via-transparent to-transparent opacity-60 dark:from-blue-800/10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* 3D-like top accent bar */}
                  <div className="relative h-2 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-lg overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-white opacity-20 w-1/2 blur-sm transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none"></div>
                  </div>

                  <CardHeader className="pb-2 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Activity insights */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Current Streak</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {currentStreak} days
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Weekly Trend</span>
                            <span
                              className={`text-xs font-semibold ${(statsCardWeeklyTrend ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                            >
                              {(statsCardWeeklyTrend ?? 0) >= 0 ? "+" : ""}
                              {(statsCardWeeklyTrend ?? 0)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Most Active</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {mostActiveDay.day.slice(0, 3)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                     
                    </div>
                  </CardHeader>

                  <CardContent className="p-2 relative z-10">
                    <div className="px-4 pt-4 pb-3">
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md p-6 bg-white dark:bg-slate-900">
                        <div>
                          {calendarData.length > 0 ? (
                            <PortfolioHeatmap 
                              data={calendarData}
                              weeklyTrend={statsCardWeeklyTrend}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                              <Calendar className="h-12 w-12 text-blue-500/50 mb-3" />
                              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No activity data yet</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                Start solving problems on your connected platforms to see your activity heatmap here.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activity insights */}
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Streak</div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{bestStreak}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">days</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Average</div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {averageDailySubmissions}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">submissions</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Consistency</div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {Math.round((totalActiveDays / 365) * 100)}%
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">of days active</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Most Productive
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {mostActiveDay.day.slice(0, 3)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                ({mostActiveDay.count} submissions)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Problems & Contests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Problems Solved - PREMIUM VERSION */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300">
                        Problems Solved
                      </h2>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 shadow-sm">
                      {totalSolved} total problems
                    </div>
                  </div>

                  {/* Problems Solved - ULTRA PREMIUM VERSION */}
                  <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/90 dark:to-blue-900/20">
                    {/* Premium decorative elements - make them not block pointer events */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/10 via-transparent to-transparent opacity-60 dark:from-blue-800/10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                    {/* 3D-like top accent bar */}
                    <div className="relative h-2 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-lg overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-white opacity-20 w-1/2 blur-sm transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none"></div>
                    </div>

                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Activity insights */}
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                              <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Current Streak</span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {currentStreak} days
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Weekly Trend</span>
                              <span
                                className={`text-xs font-semibold ${(statsCardWeeklyTrend ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                              >
                                {(statsCardWeeklyTrend ?? 0) >= 0 ? "+" : ""}
                                {(statsCardWeeklyTrend ?? 0)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Most Active</span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {mostActiveDay.day.slice(0, 3)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 relative z-10">
                      <div className="flex flex-col">
                        {/* Header section with 3D effect */}
                        <div className="relative p-5 pb-0 overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl"></div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                                  <Code className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Your coding challenge progress
                                </p>
                              </div>
                            </div>

                           
                          </div>
                        </div>

                        {/* Main content with 3D card effect */}
                        <div className="p-5">
                          <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-5 transform group-hover:-translate-y-1 transition-all duration-300">
                            {/* Subtle pattern overlay */}
                            <div
                              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            />

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                              {/* Left side - Counter with 3D effect */}
                              <div className="relative mb-4 md:mb-0">
                                <div className="relative w-40 h-40 rounded-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-blue-900/50 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] dark:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.2)] flex flex-col items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                                  {/* Animated glow effect */}
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>

                                  {/* 3D-like ring */}
                                  <div className="absolute inset-0 rounded-full border-8 border-white dark:border-slate-800 opacity-20"></div>

                                  {/* Counter */}
                                  <div className="relative">
                                    <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-600 drop-shadow-sm">
                                      {totalSolved}
                                    </span>

                                    
                                  </div>
                                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                    problems solved
                                  </span>

                                  {/* Circular progress ring with premium styling */}
                                  <svg
                                    className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-1000 group-hover:rotate-0"
                                    viewBox="0 0 100 100"
                                  >
                                    <defs>
                                      <linearGradient id="problemsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
                                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
                                      </linearGradient>
                                      <filter id="glow">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                          <feMergeNode in="coloredBlur" />
                                          <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                      </filter>
                                    </defs>
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="rgba(203, 213, 225, 0.2)"
                                      strokeWidth="2.5"
                                      className="dark:stroke-slate-700/30"
                                    />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="url(#problemsGradient)"
                                      strokeWidth="3"
                                      strokeDasharray="282.7"
                                      strokeDashoffset="56.6"
                                      strokeLinecap="round"
                                      filter="url(#glow)"
                                      className="transition-all duration-1500 ease-out-quart group-hover:stroke-dashoffset-0"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Right side - Difficulty breakdown */}
                              <div className="flex-1 space-y-4">
                                {/* Difficulty breakdown with premium styling */}
                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm">
                                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Difficulty Breakdown
                                  </h4>

                                  <div className="space-y-1.5">
                                    {/* Easy problems */}
                                    <div>
                                      <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-sm bg-green-500 mr-1.5"></div>
                                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Easy
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                          {problemsByDifficulty.easy || 0}
                                        </span>
                                      </div>
                                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out-quart"
                                          style={{
                                            width: `${((problemsByDifficulty.easy || 0) / totalSolved) * 100}%`,
                                            boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                                          }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Medium problems */}
                                    <div>
                                      <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500 mr-1.5"></div>
                                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Medium
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                                          {problemsByDifficulty.medium || 0}
                                        </span>
                                      </div>
                                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out-quart"
                                          style={{
                                            width: `${((problemsByDifficulty.medium || 0) / totalSolved) * 100}%`,
                                            boxShadow: "0 0 8px rgba(234, 179, 8, 0.5)",
                                          }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Hard problems */}
                                    <div>
                                      <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-sm bg-red-500 mr-1.5"></div>
                                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Hard
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                          {problemsByDifficulty.hard || 0}
                                        </span>
                                      </div>
                                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000 ease-out-quart"
                                          style={{
                                            width: `${((problemsByDifficulty.hard || 0) / totalSolved) * 100}%`,
                                            boxShadow: "0 0 8px rgba(239, 68, 68, 0.5)",
                                          }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Others problems */}
                                    <div>
                                      <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 mr-1.5"></div>
                                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                            Others
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                          {Math.max(0, totalSolved - ((problemsByDifficulty.easy || 0) + (problemsByDifficulty.medium || 0) + (problemsByDifficulty.hard || 0)))}
                                        </span>
                                      </div>
                                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000 ease-out-quart"
                                          style={{
                                            width: `${(Math.max(0, totalSolved - ((problemsByDifficulty.easy || 0) + (problemsByDifficulty.medium || 0) + (problemsByDifficulty.hard || 0))) / totalSolved) * 100}%`,
                                            boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Platform distribution - Full width */}
                            <div className="mt-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm">
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Platform Distribution
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {platformProblems.length > 0 ? (
                                  platformProblems.map((platform) => (
                                    <div
                                      key={platform.id}
                                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group/platform"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white dark:bg-slate-700 shadow-sm p-1 border border-slate-100 dark:border-slate-600 flex items-center justify-center">
                                        <img
                                          src={platform.icon || "/placeholder.svg"}
                                          alt={platform.name}
                                          className="w-full h-full object-contain transition-all duration-300 group-hover/platform:scale-110"
                                        />
                                      </div>
                                      <div className="flex-grow min-w-0 flex flex-col">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 break-normal mr-1.5">
                                            {platform.name}
                                          </span>
                                          <span className="text-xs font-bold flex-shrink-0" style={{ color: platform.color }}>
                                            {platform.count}
                                          </span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                                          <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out-quart"
                                            style={{
                                              width: `${platform.percentage}%`,
                                              background: `linear-gradient(90deg, ${platform.color}90, ${platform.color})`,
                                              boxShadow: `0 0 10px ${platform.color}50`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  SUPPORTED_PLATFORMS.filter((platform) => {
                                    const profile = profiles.find((p) => p.platform === platform.id)
                                    return (profile?.totalSolved || 0) > 0
                                  }).map((platform) => {
                                    const profile = profiles.find((p) => p.platform === platform.id)
                                    const totalSolvedCount = profile?.totalSolved ?? 0
                                    const percentage = ((totalSolvedCount / totalSolved) * 100).toFixed(1)

                                    return (
                                      <div
                                        key={platform.id}
                                        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group/platform"
                                      >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white dark:bg-slate-700 shadow-sm p-1 border border-slate-100 dark:border-slate-600 flex items-center justify-center">
                                          <img
                                            src={platform.icon || "/placeholder.svg"}
                                            alt={platform.name}
                                            className="w-full h-full object-contain transition-all duration-300 group-hover/platform:scale-110"
                                          />
                                        </div>
                                        <div className="flex-grow min-w-0 flex flex-col">
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 break-normal mr-1.5">
                                              {platform.name}
                                            </span>
                                            <span className="text-xs font-bold flex-shrink-0" style={{ color: platform.color }}>
                                              {totalSolvedCount}
                                            </span>
                                          </div>
                                          <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                                            <div
                                              className="h-full rounded-full transition-all duration-1000 ease-out-quart"
                                              style={{
                                                width: `${percentage}%`,
                                                background: `linear-gradient(90deg, ${platform.color}90, ${platform.color})`,
                                                boxShadow: `0 0 10px ${platform.color}50`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Achievement badges */}
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                <Trophy className="h-4 w-4" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                <Award className="h-4 w-4" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                <Sigma className="h-4 w-4" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                <Sparkles className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Last solved: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSolvedLabel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contests Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 dark:from-amber-500/20 dark:to-amber-600/30 border border-amber-100 dark:border-amber-800/50 shadow-sm">
                        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-400 dark:to-amber-300">
                        Contest Participation
                      </h2>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-xs font-medium text-amber-600 dark:text-amber-400 shadow-sm">
                      {totalContests} contests joined
                    </div>
                  </div>

                  {/* Contest Participation - ULTRA PREMIUM VERSION */}
                  <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-slate-50/90 to-amber-50/30 dark:from-slate-900 dark:via-slate-800/90 dark:to-amber-900/20">
                    {/* Premium decorative elements - make them not block pointer events */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-200/10 via-transparent to-transparent opacity-60 dark:from-amber-800/10 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                    {/* 3D-like top accent bar */}
                    <div className="relative h-2 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-lg overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-white opacity-20 w-1/2 blur-sm transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none"></div>
                    </div>

                    <CardContent className="p-0 relative z-10">
                      <div className="flex flex-col">
                        {/* Header section with 3D effect */}
                        <div className="relative p-5 pb-0 overflow-hidden">
                          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-red-500/5 rounded-full blur-xl"></div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                                  <Trophy className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                    <Star className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Your competitive achievements
                                </p>
                              </div>
                            </div>

                           
                          </div>
                        </div>

                        {/* Main content with 3D card effect */}
                        <div className="p-5">
                          <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-5 transform group-hover:-translate-y-1 transition-all duration-300">
                            {/* Subtle pattern overlay */}
                            <div
                              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            />

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                              {/* Left side - Trophy showcase with 3D effect */}
                              <div className="relative mb-4 md:mb-0">
                                <div className="relative w-40 h-40 rounded-full bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 border border-amber-100 dark:border-amber-900/50 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.3)] dark:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center transform group-hover:scale-105 transition-all duration-500">
                                  {/* Animated glow effect */}
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-500/20 dark:to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>

                                  {/* 3D-like ring */}
                                  <div className="absolute inset-0 rounded-full border-8 border-white dark:border-slate-800 opacity-20"></div>

                                  {/* Trophy icon with 3D effect */}
                                  <div className="relative mb-2">
                                    

                                    {/* Shine effect */}
                                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white opacity-30 blur-sm transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                  </div>

                                  {/* Counter */}
                                  <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-600 drop-shadow-sm">
                                    {totalContests}
                                  </div>
                                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    contests joined
                                  </span>

                                  {/* Circular progress ring with premium styling */}
                                  <svg
                                    className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-1000 group-hover:rotate-0"
                                    viewBox="0 0 100 100"
                                  >
                                    <defs>
                                      <linearGradient id="contestsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
                                        <stop offset="50%" stopColor="#EA580C" stopOpacity="0.7" />
                                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
                                      </linearGradient>
                                      <filter id="contestGlow">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                          <feMergeNode in="coloredBlur" />
                                          <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                      </filter>
                                    </defs>
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="rgba(203, 213, 225, 0.2)"
                                      strokeWidth="2.5"
                                      className="dark:stroke-slate-700/30"
                                    />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke="url(#contestsGradient)"
                                      strokeWidth="3"
                                      strokeDasharray="282.7"
                                      strokeDashoffset="140"
                                      strokeLinecap="round"
                                      filter="url(#contestGlow)"
                                      className="transition-all duration-1500 ease-out-quart group-hover:stroke-dashoffset-70"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Right side - Recent Contests */}
                              <div className="flex-1 space-y-4">
                                {/* Contest timeline */}
                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    Recent Contests
                                  </h4>
                                  <div className="space-y-3">
                                    {recentContests.length > 0 ? (
                                      recentContests.map((contest: any, i: number) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
                                        >
                                          <div className="w-8 h-8 rounded-md bg-white dark:bg-slate-700 shadow-sm p-1.5 border border-slate-100 dark:border-slate-600 flex items-center justify-center">
                                            <img
                                              src={contest.platformIcon || "/placeholder.svg"}
                                              alt={contest.platformName}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {contest.platformName}: {contest.name}
                                              </span>
                                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {contest.date}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                                Rank: {contest.rank}
                                              </div>
                                              {contest.rating !== undefined && (
                                                <div className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-[10px] font-medium text-blue-700 dark:text-blue-400 flex items-center">
                                                  Rating: {contest.rating}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs text-slate-500 dark:text-slate-400">No recent contests found.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Platform distribution - Full width */}
                            <div className="mt-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm">
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Platform Distribution
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {SUPPORTED_PLATFORMS.map(platform => {
                                  const profile = profiles.find(p => p.platform === platform.id);
                                  if (!profile) return null;
                                  const contestCount = platformContestCounts[platform.id] || 0;
                                  const percentage = totalContests > 0 ? Math.round((contestCount / totalContests) * 100) : 0;
                                  if (contestCount === 0) return null;
                                  return (
                                    <div
                                      key={platform.id}
                                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group/platform"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white dark:bg-slate-700 shadow-sm p-1 border border-slate-100 dark:border-slate-600 flex items-center justify-center">
                                        <img
                                          src={platform.icon || "/placeholder.svg"}
                                          alt={platform.name}
                                          className="w-full h-full object-contain transition-all duration-300 group-hover/platform:scale-110"
                                        />
                                      </div>
                                      <div className="flex-grow min-w-0 flex flex-col">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 break-normal mr-1.5">
                                            {platform.name}
                                          </span>
                                          <span className="text-xs font-bold flex-shrink-0" style={{ color: platform.color }}>
                                            {contestCount} contests
                                          </span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                                          <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out-quart"
                                            style={{
                                              width: `${percentage}%`,
                                              background: `linear-gradient(90deg, ${platform.color}90, ${platform.color})`,
                                              boxShadow: `0 0 10px ${platform.color}50`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }).filter(Boolean)}
                              </div>
                            </div>

                            {/* Achievement medals */}
                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                  <span className="text-amber-900 font-extrabold">1</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                  <span className="text-slate-700 font-extrabold">2</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">
                                  <span className="text-amber-100 font-extrabold">3</span>
                                </div>
                              </div>

                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Last contest:{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {recentContests.length > 0 ? (() => {
                                    const latestContest = recentContests[0];
                                    const contestDate = new Date(latestContest.date);
                                    const today = new Date();
                                    contestDate.setHours(0,0,0,0);
                                    today.setHours(0,0,0,0);
                                    const diffDays = Math.round((today.getTime() - contestDate.getTime()) / (1000 * 60 * 60 * 24));
                                    if (diffDays === 0) return "Today";
                                    else if (diffDays === 1) return "Yesterday";
                                    else return `${diffDays} days ago`;
                                  })() : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Platform Ratings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 border border-purple-100 dark:border-purple-800/50 shadow-sm">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-300">
                      Platform Ratings
                    </h2>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 text-xs font-medium text-purple-600 dark:text-purple-400 shadow-sm">
                    {platformMetrics.filter((p) => p.connected).length} platforms
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {platformMetrics
                    .filter((p) => p.connected)
                    .map((platform) => {
                      // Generate a random rating change for demo purposes
                      const ratingChange = Math.floor(Math.random() * 100) - 30
                      const changeDirection = ratingChange > 0 ? "up" : ratingChange < 0 ? "down" : "neutral"
                      const contestCount = platformContestCounts[platform.id] || 0;

                      // Special handling for HackerRank
                      let displayRating = platform.rating;
                      let displayRank = platform.rank;
                      if (platform.id === 'hackerrank' && platform.data?.ratingHistory) {
                        // Flatten all events
                        const allEvents = platform.data.ratingHistory.flatMap((entry: any) => Array.isArray(entry.events) ? entry.events : []);
                        // Sort by date descending
                        allEvents.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        if (allEvents.length > 0) {
                          displayRating = allEvents[0].rating || platform.rating;
                          displayRank = allEvents[0].rank || platform.rank;
                        }
                      }
                      // Special handling for CodingNinjas: use contest rating
                      if (platform.id === 'codingninjas' && platform.data?.contests?.rating) {
                        displayRating = platform.data.contests.rating;
                      }

                      return (
                        <Card
                          key={platform.id}
                          className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="h-1.5 w-full" style={{ backgroundColor: platform.color }}></div>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-1.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                <img
                                  src={platform.icon || "/placeholder.svg"}
                                  alt={platform.name}
                                  className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{platform.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">@{platform.username}</p>
                              </div>
                            </div>

                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <div className="text-3xl font-bold" style={{ color: platform.color }}>
                                  {displayRating}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Rank: {" "}
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {displayRank}
                                  </span>
                                </div>
                              </div>

                              
                            </div>

                            {/* Rating chart */}
                            <div className="h-12 w-full overflow-hidden">
                              <svg viewBox="0 0 100 24" className="w-full h-full">
                                <defs>
                                  <linearGradient id={`gradient-${platform.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={platform.color} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={platform.color} stopOpacity="0.05" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={generateRandomPath(20)} // Generate random path for demo
                                  fill="none"
                                  stroke={platform.color}
                                  strokeWidth="1.5"
                                  className="transition-all duration-1000 opacity-70 group-hover:opacity-100"
                                />
                                <path
                                  d={generateRandomPath(20) + " L 100 24 L 0 24 Z"} // Area below the line
                                  fill={`url(#gradient-${platform.id})}`}
                                  className="transition-all duration-1000 opacity-50 group-hover:opacity-80"
                                />
                              </svg>
                            </div>

                            <div className="flex justify-between items-center mt-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                              <div className="text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {contestCount}
                                </span>{" "}
                                contests
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>

                {/* Summary line - when no ratings */}
                {platformMetrics.filter((p) => p.connected).length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No contest ratings available yet</p>
                    <p className="text-sm mt-1">Participate in contests to see your ratings here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Contest Analysis Tab Content */}
          <TabsContent value="contests" className="mt-6">
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 dark:from-amber-500/20 dark:to-amber-600/30 border border-amber-100 dark:border-amber-800/50 shadow-sm">
                    <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-400 dark:to-amber-300">
                    Contest Performance Analysis
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-xs font-medium text-amber-600 dark:text-amber-400 shadow-sm">
                  {totalContests} total contests
                </div>
              </div>

              {/* Contest Performance Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Contest Rating Progression</h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px] w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 800 300" className="w-full h-full">
                        {/* Grid lines */}
                        {[...Array(6)].map((_, i) => (
                          <line
                            key={`h-${i}`}
                            x1="0"
                            y1={i * 60}
                            x2="800"
                            y2={i * 60}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray={i === 0 || i === 5 ? "" : "5,5"}
                          />
                        ))}
                        {[...Array(9)].map((_, i) => (
                          <line
                            key={`v-${i}`}
                            x1={i * 100}
                            y1="0"
                            x2={i * 100}
                            y2="300"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray={i === 0 || i === 8 ? "" : "5,5"}
                          />
                        ))}

                        {/* LeetCode rating line */}
                        <path
                          d="M50,250 C100,230 150,240 200,210 S300,180 350,170 S450,150 500,140 S600,120 750,100"
                          fill="none"
                          stroke="#FFA116"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* CodeForces rating line */}
                        <path
                          d="M50,270 C100,260 150,250 200,240 S300,220 350,200 S450,190 500,180 S600,160 750,150"
                          fill="none"
                          stroke="#1F8ACB"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Data points for LeetCode */}
                        {[50, 100, 150, 200, 300, 350, 450, 500, 600, 750].map((x, i) => {
                          const y = 250 - i * 15
                          return (
                            <circle key={`lc-${i}`} cx={x} cy={y} r="5" fill="#FFA116" stroke="#fff" strokeWidth="2" />
                          )
                        })}

                        {/* Data points for CodeForces */}
                        {[50, 100, 150, 200, 300, 350, 450, 500, 600, 750].map((x, i) => {
                          const y = 270 - i * 12
                          return (
                            <circle key={`cf-${i}`} cx={x} cy={y} r="5" fill="#1F8ACB" stroke="#fff" strokeWidth="2" />
                          )
                        })}
                      </svg>

                      {/* Y-axis labels */}
                      <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-2 text-xs text-slate-500 dark:text-slate-400">
                        <div>2000</div>
                        <div>1800</div>
                        <div>1600</div>
                        <div>1400</div>
                        <div>1200</div>
                        <div>1000</div>
                      </div>

                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 w-full flex justify-between px-12 text-xs text-slate-500 dark:text-slate-400">
                        <div>Jan</div>
                        <div>Feb</div>
                        <div>Mar</div>
                        <div>Apr</div>
                        <div>May</div>
                        <div>Jun</div>
                        <div>Jul</div>
                      </div>

                      {/* Legend */}
                      <div className="absolute top-2 right-2 flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FFA116]"></div>
                          <span className="text-xs">LeetCode</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#1F8ACB]"></div>
                          <span className="text-xs">CodeForces</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contest Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold">Contest Participation</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#FFA116"
                            strokeWidth="10"
                            strokeDasharray="251.2"
                            strokeDashoffset="62.8"
                            transform="rotate(-90 50 50)"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#1F8ACB"
                            strokeWidth="10"
                            strokeDasharray="251.2"
                            strokeDashoffset="188.4"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-3xl font-bold">{totalContests}</span>
                          <span className="text-xs text-slate-500">Total</span>
                        </div>
                      </div>
                      <div className="flex justify-between w-full mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FFA116]"></div>
                          <div className="text-xs">
                            <div>LeetCode</div>
                            <div className="font-semibold">12</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#1F8ACB]"></div>
                          <div className="text-xs">
                            <div>CodeForces</div>
                            <div className="font-semibold">18</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold">Best Rankings</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                          1
                        </div>
                        <div>
                          <div className="text-sm font-medium">LeetCode Weekly Contest 342</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span>Top 5% (Rank 342)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold shadow-md">
                          2
                        </div>
                        <div>
                          <div className="text-sm font-medium">CodeForces Round #835</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-slate-400" />
                            <span>Top 8% (Rank 523)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white font-bold shadow-md">
                          3
                        </div>
                        <div>
                          <div className="text-sm font-medium">LeetCode Biweekly Contest 98</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-amber-700" />
                            <span>Top 12% (Rank 876)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold">Recent Performance</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - i * 14)
                        const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        const platform = i % 2 === 0 ? "LeetCode" : "CodeForces"
                        const platformColor = i % 2 === 0 ? "#FFA116" : "#1F8ACB"
                        const trend = i === 0 ? "up" : i === 1 ? "down" : i === 2 ? "up" : "neutral"

                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColor }}></div>
                              <span className="text-xs">{platform} Contest</span>
                            </div>
                            <div className="text-xs text-slate-500">{formattedDate}</div>
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                trend === "up"
                                  ? "text-emerald-500"
                                  : trend === "down"
                                    ? "text-rose-500"
                                    : "text-slate-500"
                              }`}
                            >
                              {trend === "up" && <ArrowUp className="h-3 w-3" />}
                              {trend === "down" && <ArrowDown className="h-3 w-3" />}
                              <span>{trend === "up" ? "+45" : trend === "down" ? "-23" : "0"}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Platform-specific tabs */}
          {profiles.map((profile) => {
            const platform = SUPPORTED_PLATFORMS.find((p) => p.id === profile.platform)

            return (
              <TabsContent key={profile.platform} value={profile.platform} className="mt-6">
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img
                          src={platform?.icon || "/placeholder.svg"}
                          alt={platform?.name || profile.platform}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: platform?.color }}>
                          {platform?.name || profile.platform}
                        </h2>
                        <div className="text-sm text-slate-500 dark:text-slate-400">@{profile.username}</div>
                      </div>
                    </div>
                    <a
                      href={`https://${profile.platform}.com/user/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Profile</span>
                    </a>
                  </div>

                  {/* Platform stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <h3 className="text-base font-semibold">Problems Solved</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <div className="text-5xl font-bold mb-2" style={{ color: platform?.color }}>
                            {profile.totalSolved}
                          </div>
                          <div className="text-sm text-slate-500">Total problems</div>

                          <div className="w-full mt-6 space-y-3">
                            {profile.problemsByDifficulty &&
                              Object.entries(profile.problemsByDifficulty).map(([difficulty, count]) => {
                                const color =
                                  difficulty === "easy"
                                    ? "bg-green-500"
                                    : difficulty === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"

                                return (
                                  <div key={difficulty} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${color}`}></div>
                                        <span className="text-xs capitalize">{difficulty}</span>
                                      </div>
                                      <span className="text-xs font-medium">{count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full`}
                                        style={{
                                          width: `${(count / profile.totalSolved!) * 100}%`,
                                          backgroundColor:
                                            difficulty === "easy"
                                              ? "#22c55e"
                                              : difficulty === "medium"
                                                ? "#eab308"
                                                : "#ef4444",
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <h3 className="text-base font-semibold">Rating & Rank</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <div className="text-5xl font-bold mb-2" style={{ color: platform?.color }}>
                            {profile.rating}
                          </div>
                          <div className="text-sm text-slate-500">Current rating</div>

                          <div className="mt-4 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
                            Rank: <span className="font-semibold">{profile.rank}</span>
                          </div>

                          <div className="w-full mt-6">
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: "65%",
                                  backgroundColor: platform?.color,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-slate-500">
                              <div>Current: {profile.rating}</div>
                              <div>Next: {profile.rating! + 100}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <h3 className="text-base font-semibold">Contest History</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {profile.contestHistory && profile.contestHistory.length > 0 ? (
                            profile.contestHistory.slice(0, 5).map((contest, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <div className="text-xs">
                                  {contest.name || `${platform?.name} Contest #${i + 1}`}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {contest.date ? new Date(contest.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                    #{contest.rank || "N/A"}
                                  </div>
                                  {contest.rating !== undefined && (
                                    <div
                                      className={`flex items-center gap-0.5 text-xs`}
                                    >
                                      <span>{contest.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-sm text-slate-500 py-2">
                              No contest history available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Platform activity chart */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Activity on {platform?.name}</h3>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[200px] w-full">
                        <PortfolioHeatmap
                          data={
                            profile.activityHeatmap ? profile.activityHeatmap.map((day) => ({
                              date: day.date,
                              count: day.count,
                              verdictSummary: [
                                {
                                  status: "ACCEPTED",
                                  readableStatus: "Accepted",
                                  count: day.count,
                                  color: "#4ade80" // Use standard green color
                                }
                              ]
                            })) : []
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number) {
  // Remove the # if it exists
  hex = hex.replace("#", "")

  // Convert to RGB
  let r = Number.parseInt(hex.substring(0, 2), 16)
  let g = Number.parseInt(hex.substring(2, 4), 16)
  let b = Number.parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  r = Math.min(255, Math.floor((r * (100 + percent)) / 100))
  g = Math.min(255, Math.floor((g * (100 + percent)) / 100))
  b = Math.min(255, Math.floor((b * (100 + percent)) / 100))

  // Convert back to hex with alpha
  return `rgba(${r}, ${g}, ${b}, 0.1)`
}

// Helper function to generate a random SVG path for the mini-chart
function generateRandomPath(points: number) {
  let path = `M 0 10`
  const increment = 100 / (points - 1)

  for (let i = 1; i < points; i++) {
    const x = i * increment
    const y = 10 - Math.random() * 10 // Random value between 0-10
    path += ` L ${x} ${y}`
  }

  return path
}
