"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarHeatmap } from "@/components/coding-portfolio/calendar-heatmap"
import { BarChart2, Award, Code, Trophy, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import Image from "next/image"

// A modern, premium dashboard to showcase and track coding profiles and activity across platforms
// Designed with glass-morphism, premium animations, and elegant data visualization

interface PlatformProfile {
  platform: string;
  username: string;
  totalSolved?: number;
  rank?: number | string;
  rating?: number;
  contests?: number;
  badges?: number;
  score?: number;
  problemsByDifficulty?: Record<string, number>;
  error?: string;
  contestHistory?: Array<{
    name: string;
    date: string;
    rank: number;
    rating?: number;
  }>;
  activityHeatmap?: Array<{
    date: string;
    count: number;
  }>;
  stats?: {
    streak?: number;
    totalActiveDays?: number;
  };
  data?: any;
}

interface PlatformHandle {
  id: string;
  userId: string;
  platform: string;
  handle: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlatformData {
  id: string;
  userId: string;
  platform: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

const SUPPORTED_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", icon: "/images/platforms/leetcode.svg", color: "#FFA116" },
  { id: "codechef", name: "CodeChef", icon: "/images/platforms/codechef.svg", color: "#5B4638" },
  { id: "codeforces", name: "CodeForces", icon: "/images/platforms/codeforces.svg", color: "#1F8ACB" },
  { id: "geeksforgeeks", name: "GeeksForGeeks", icon: "/images/platforms/gfg.svg", color: "#2F8D46" },
  { id: "hackerrank", name: "HackerRank", icon: "/images/platforms/hackerrank.svg", color: "#00EA64" },
  { id: "hackerearth", name: "HackerEarth", icon: "/images/platforms/hackerearth.svg", color: "#2C3454" },
  { id: "codingninjas", name: "CodeStudio", icon: "/images/platforms/codingninjas.svg", color: "#FC4F41" },
];

export function CodingDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [platformHandles, setPlatformHandles] = useState<PlatformHandle[]>([])
  const [profiles, setProfiles] = useState<PlatformProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  useEffect(() => {
    fetchPlatformData()
  }, [])
  
  const fetchPlatformData = async () => {
    setLoading(true)
    try {
      // Fetch platform handles
      const handlesResponse = await fetch("/api/user/platform-handles")
      if (!handlesResponse.ok) throw new Error("Failed to fetch platform handles")
      const handlesData = await handlesResponse.json()
      setPlatformHandles(handlesData.handles || [])
      
      // Directly fetch platform data from the database instead of calling fetchers
      const platformDataResponse = await fetch("/api/user/platform-data")
      if (!platformDataResponse.ok) throw new Error("Failed to fetch platform data")
      
      const platformData = await platformDataResponse.json()
      console.log("Retrieved platform data from database:", platformData)
      
      // Convert the database-stored data to the profile format
      if (platformData && platformData.platformData) {
        const profilesFromDb = platformData.platformData.map((item: any) => {
          // Parse the stored JSON data
          const parsedData = typeof item.data === 'string' 
            ? JSON.parse(item.data) 
            : item.data;
            
          // Map platform IDs if needed
          let platformId = item.platform;
          if (platformId === 'gfg') platformId = 'geeksforgeeks';
          
          // Create profile object from stored data
          return {
            platform: platformId,
            username: parsedData.username || '',
            totalSolved: parsedData.totalSolved,
            rank: parsedData.rank,
            rating: parsedData.rating,
            score: parsedData.score,
            contests: parsedData.contests,
            badges: parsedData.badges,
            problemsByDifficulty: parsedData.problemsByDifficulty,
            contestHistory: parsedData.contestHistory,
            activityHeatmap: parsedData.activityHeatmap,
            stats: parsedData.stats,
            data: parsedData // <-- ensure raw data is always available
          };
        });
        
        setProfiles(profilesFromDb);
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load your coding profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const refreshData = async () => {
    setRefreshing(true)
    try {
      // Instead of refetching from external APIs, just refresh from database
      const refreshResponse = await fetch("/api/user/platform-data?refresh=true")
      if (!refreshResponse.ok) throw new Error("Failed to refresh platform data")
      
      // Fetch the updated data
      await fetchPlatformData()
      
      toast({
        title: "Success",
        description: "Your coding data has been refreshed",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh your coding data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }
  
  // Calculate total metrics
  const totalSolved = profiles.reduce((acc, profile) => acc + (profile.totalSolved || 0), 0)
  const totalSubmissions = profiles.flatMap(p => p.activityHeatmap || []).reduce((acc, day) => acc + day.count, 0)
  // Unique active days: collect all dates from activityHeatmap and codeforces recentActivity, normalize, and count unique
  const allActiveDates = new Set([
    ...profiles.flatMap(profile =>
      (profile.activityHeatmap || []).map(day => {
        // Normalize date to YYYY-MM-DD
        const d = new Date(day.date);
        return isNaN(d.getTime()) ? day.date : d.toISOString().split('T')[0];
      })
    ),
    ...profiles.filter(p => p.platform === 'codeforces' && p.data?.recentActivity)
      .flatMap(p => p.data.recentActivity.map((a: any) => {
        const d = new Date(a.date);
        return isNaN(d.getTime()) ? a.date : d.toISOString().split('T')[0];
      }))
  ]);
  
  // Instead of just counting unique days, sum submissions and Codeforces activities
  const totalActiveDays = totalSubmissions + 
    profiles.filter(p => p.platform === 'codeforces' && p.data?.recentActivity)
      .reduce((sum, p) => sum + p.data.recentActivity.length, 0);
  
  const currentStreak = Math.max(...profiles.map(p => p.stats?.streak || 0), 0)
  const maxStreak = Math.max(...profiles.map(p => p.stats?.totalActiveDays || 0), 8) // Default to 8 if no data
  
  // Get problems by difficulty across all platforms
  const problemsByDifficulty: Record<string, number> = {}
  profiles.forEach(profile => {
    if (profile.problemsByDifficulty) {
      Object.entries(profile.problemsByDifficulty).forEach(([difficulty, count]) => {
        const normalizedDifficulty = difficulty.toLowerCase()
        problemsByDifficulty[normalizedDifficulty] = (problemsByDifficulty[normalizedDifficulty] || 0) + count
      })
    }
  })
  
  // Get all activity data for heatmap
  const allActivityData = profiles.flatMap(p => p.activityHeatmap || [])
  
  // Platform-specific metrics
  const platformMetrics = SUPPORTED_PLATFORMS.map(platform => {
    const profile = profiles.find(p => p.platform === platform.id)
    // For GFG, do not use score as rating
    let rating = profile?.rating || 0;
    if (platform.id === 'geeksforgeeks') {
      // GFG does not have a contest rating, so set to 0 (will display N/A)
      rating = 0;
    }
    return {
      ...platform,
      connected: !!profile,
      totalSolved: profile?.totalSolved || 0,
      rating,
      username: profile?.username || '',
      rank: (profile?.rank !== undefined && profile?.rank !== null && profile?.rank !== '') ? profile.rank : 'N/A',
    }
  })
  
  // User profile from session
  const user = session?.user
  
  // Build a unified contest list from all possible sources
  let allContests: any[] = [];
  profiles.forEach(profile => {
    const { platform, contestHistory, data } = profile;
    // contestHistory for all platforms except hackerrank
    if (platform !== 'hackerrank' && contestHistory && Array.isArray(contestHistory)) {
      allContests = allContests.concat(
        contestHistory.map(contest => ({ ...contest, platform }))
      );
    }
    // HackerRank: ratingHistory[].events[]
    if (platform === 'hackerrank' && data?.ratingHistory) {
      data.ratingHistory.forEach((history: any) => {
        if (Array.isArray(history.events)) {
          allContests = allContests.concat(
            history.events.map((event: any) => ({
              name: event.contest_name || event.name || 'Unnamed Contest',
              date: event.date,
              rank: event.rank,
              rating: event.rating,
              platform
            }))
          );
        }
      });
    }
    // HackerEarth: ratingHistory[]
    if (platform === 'hackerearth' && data?.ratingHistory) {
      allContests = allContests.concat(
        data.ratingHistory.map((event: any) => ({
          name: event.name,
          date: event.date,
          rank: event.rank,
          rating: event.rating,
          platform
        }))
      );
    }
    // Coding Ninjas: contestHistory (if present)
    if (platform === 'codingninjas' && data?.contestHistory) {
      allContests = allContests.concat(
        data.contestHistory.map((contest: any) => ({ ...contest, platform }))
      );
    }
  });
  // Deduplicate by name+date+platform
  allContests = allContests.filter((c, i, arr) =>
    arr.findIndex(x => x.name === c.name && x.date === c.date && x.platform === c.platform) === i
  );
  // Sort by date descending
  allContests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Debug: log contest count per platform
  const contestCountPerPlatform = SUPPORTED_PLATFORMS.reduce((acc, platform) => {
    acc[platform.id] = allContests.filter(c => c.platform === platform.id).length;
    return acc;
  }, {} as Record<string, number>);
  console.log('Contest count per platform:', contestCountPerPlatform);

  // Extra debug for HackerRank: sum of events in data.ratingHistory
  const hackerRankProfile = profiles.find(p => p.platform === 'hackerrank');
  let hackerrankEventCount = 0;
  if (hackerRankProfile && hackerRankProfile.data?.ratingHistory) {
    hackerrankEventCount = hackerRankProfile.data.ratingHistory.reduce((sum: number, history: any) => {
      if (Array.isArray(history.events)) {
        return sum + history.events.length;
      }
      return sum;
    }, 0);
  }
  console.log('HackerRank contest count (sum of events in ratingHistory):', hackerrankEventCount);

  // Extra debug for HackerEarth: count of ratingHistory
  const hackerEarthProfile = profiles.find(p => p.platform === 'hackerearth');
  let hackerearthContestCount = 0;
  if (hackerEarthProfile && hackerEarthProfile.data?.ratingHistory) {
    hackerearthContestCount = Array.isArray(hackerEarthProfile.data.ratingHistory)
      ? hackerEarthProfile.data.ratingHistory.length
      : 0;
  }
  console.log('HackerEarth contest count (ratingHistory.length):', hackerearthContestCount);

  const totalContests = allContests.length;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading your coding profiles...</span>
      </div>
    )
  }
  
  if (platformHandles.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">No platforms connected</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your competitive programming profiles to see all your stats in one place.
        </p>
      </div>
    )
  }
  
  // Show a message if platforms are connected but no data is found
  if (platformHandles.length > 0 && profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">No data found</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You have connected platforms, but we couldn't find any stored data.
        </p>
        <Button onClick={refreshData} disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-12 py-8 px-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-900/60 dark:to-slate-900/20 backdrop-blur-sm border border-white/10 dark:border-slate-800/10 shadow-xl">
      {/* Back to Dashboard button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          onClick={() => window.location.href = '/dashboard'}
        >
          ← Back to Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData} 
          disabled={refreshing} 
          className="relative overflow-hidden group border-primary/25 dark:border-primary/40 hover:border-primary dark:hover:border-primary transition-all duration-300"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          )}
          <span className="ml-2 text-sm">Refresh Data</span>
          
          {/* Border animation */}
          <span className="absolute inset-0 border border-primary/40 rounded opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
        </Button>
      </div>
      
      {/* User profile summary section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-50/90 to-slate-100/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-lg p-8 shadow-lg border border-white/30 dark:border-slate-700/30 animate-fadeIn">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-20 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {user?.image && (
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-primary/20 dark:ring-primary/30">
              <Image 
                src={user.image}
                alt={user.name || "User"} 
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{user?.email}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Total Problems</div>
                  <div className="font-bold text-xl">{totalSolved}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                  <Trophy className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Contests</div>
                  <div className="font-bold text-xl">{totalContests}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <CalendarIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Active Days</div>
                  <div className="font-bold text-xl">{totalActiveDays}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
          <span className="relative">
            Connected Platforms
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
          </span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {SUPPORTED_PLATFORMS.map(platform => {
            const profile = profiles.find(p => p.platform === platform.id);
            const isConnected = !!profile;
            
            return (
              <div 
                key={platform.id}
                className={`p-5 rounded-xl border transition-all duration-300 group ${isConnected 
                  ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 hover:border-primary/30 dark:hover:border-primary/40' 
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-60'
                }`}
                style={{
                  boxShadow: isConnected ? `0 4px 12px ${adjustColor(platform.color, 95)}` : 'none'
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center mb-3 relative">
                    <div className={`absolute inset-0 rounded-full ${isConnected ? `bg-${platform.color}/10` : 'bg-transparent'} transition-all duration-300 group-hover:scale-110`}></div>
                    <img 
                      src={platform.icon} 
                      alt={platform.name} 
                      className="w-8 h-8 z-10 transition-all duration-300 group-hover:scale-110" 
                    />
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs p-1 rounded-full z-10 shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-center text-sm">{platform.name}</div>
                  {isConnected && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate w-full text-center">
                      @{profile.username}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Stats Row */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
          <span className="relative">
            Statistics
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Questions Card */}
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110" />
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Questions</div>
                <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Code className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-4">{totalSolved}</div>
              
              {/* Mini distribution bar */}
              <div className="space-y-1">
                <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                  {Object.entries(problemsByDifficulty).map(([difficulty, count]) => {
                    // Calculate colors based on difficulty
                    let color;
                    switch(difficulty.toLowerCase()) {
                      case 'easy': color = 'bg-green-500'; break;
                      case 'medium': color = 'bg-yellow-500'; break;
                      case 'hard': color = 'bg-red-500'; break;
                      case 'basic': color = 'bg-blue-500'; break;
                      case 'school': color = 'bg-teal-500'; break;
                      default: color = 'bg-slate-500'; break;
                    }
                    
                    // Calculate width percentage based on count
                    const percentage = (count / totalSolved) * 100;
                    
                    return (
                      <div 
                        key={difficulty}
                        className={`${color} h-full rounded-full transition-all duration-500 group-hover:scale-y-125`}
                        style={{ width: `${percentage}%` }}
                        title={`${difficulty}: ${count} (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>By difficulty</span>
                  <span>{Object.keys(problemsByDifficulty).length} levels</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Days Card */}
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110" />
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Days</div>
                <div className="p-2.5 rounded-lg bg-green-500/10 dark:bg-green-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <CalendarIcon className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-4">{totalActiveDays}</div>
              
              {/* Mini activity indicator */}
              <div className="space-y-1">
                <div className="flex h-12 gap-0.5 items-end">
                  {Array.from({ length: 14 }).map((_, i) => {
                    // Random heights for now, would be replaced with actual data
                    const heights = ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-9', 'h-10'];
                    const height = heights[Math.floor(Math.random() * heights.length)];
                    return (
                      <div key={i} className="flex-1 flex items-end">
                        <div className={`w-full ${height} bg-green-500/60 dark:bg-green-500/70 rounded-sm transition-all duration-300 group-hover:scale-y-110`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Last 14 days</span>
                  <span>{(totalActiveDays / allActiveDates.size * 100).toFixed(0)}% active</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contests Card */}
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110" />
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Contests</div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-4">{totalContests}</div>
              
              {/* Platform distribution mini-bar */}
              <div className="space-y-1">
                <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  {profiles
                    .filter(p => allContests.filter(c => c.platform === p.platform).length > 0)
                    .map(profile => {
                      // Find platform color
                      const platform = SUPPORTED_PLATFORMS.find(p => p.id === profile.platform);
                      const color = platform?.color || '#94a3b8';
                      const contestsCount = allContests.filter(c => c.platform === profile.platform).length;
                      
                      // Calculate percentage
                      const percentage = (contestsCount / totalContests) * 100;
                      
                      return (
                        <div 
                          key={profile.platform}
                          className="h-full rounded-full transition-all duration-500 group-hover:scale-y-125"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                          title={`${platform?.name}: ${contestsCount} (${percentage.toFixed(1)}%)`}
                        />
                      );
                    })
                  }
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>By platform</span>
                  <span>Last: {allContests[0]?.name || 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Streak Card */}
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110" />
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Streak
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Award className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-4">{currentStreak}</div>
              
              <div className="space-y-1">
                <div className="relative h-2 w-full bg-slate-200/70 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-500 left-0 top-0 rounded-full transition-all duration-500 group-hover:scale-105"
                    style={{ width: `${Math.min(100, (currentStreak / maxStreak) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Current</span>
                  <span>Max: {maxStreak}</span>
                </div>
              </div>
              
              {/* Flame icon for hot streaks */}
              {currentStreak > 3 && (
                <div className="absolute right-4 bottom-4 text-amber-500 animate-pulse">
                  <FlameIcon className="h-10 w-10 opacity-70" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Activity Heatmap */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
          <span className="relative">
            Activity Heatmap
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
          </span>
        </h2>
        
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full blur-3xl" />
          
          <CardHeader className="pb-2 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Coding Activity</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="font-medium text-primary">{totalSubmissions}</span> submissions
                </div>
              </div>
            </div>
          </CardHeader>
          
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 relative z-10">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Contribution summary by platform */}
              {SUPPORTED_PLATFORMS.filter(platform => 
                profiles.some(p => p.platform === platform.id && 
                  p.activityHeatmap && p.activityHeatmap.length > 0)
              ).map(platform => {
                const profile = profiles.find(p => p.platform === platform.id);
                const count = profile?.activityHeatmap?.reduce((sum, day) => sum + day.count, 0) || 0;
                
                return (
                  <div key={platform.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300">
                    <img src={platform.icon} alt={platform.name} className="h-4 w-4" />
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <CardContent className="p-0 relative z-10">
            <div className="px-6 pt-6 pb-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                <CalendarHeatmap data={allActivityData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Problems & Contests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problems Solved */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
            <span className="relative">
              Problems Solved
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
            </span>
          </h2>
          
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col gap-6">
                <div className="flex justify-center">
                  <div className="relative w-52 h-52 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner transition-all duration-500 group-hover:scale-105">
                    <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-primary to-primary/70">{totalSolved}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">problems solved</span>
                    
                    {/* Circular ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-700 group-hover:rotate-0" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="rgba(203, 213, 225, 0.2)" 
                        strokeWidth="3"
                        className="dark:stroke-slate-700/30"
                      />
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="rgba(79, 70, 229, 0.6)" 
                        strokeWidth="4"
                        strokeDasharray="282.7"
                        strokeDashoffset="56.6"
                        strokeLinecap="round"
                        className="transition-all duration-1000 group-hover:stroke-dashoffset-0"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Platform breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {SUPPORTED_PLATFORMS.filter(platform => {
                    const profile = profiles.find(p => p.platform === platform.id);
                    return (profile?.totalSolved || 0) > 0;
                  }).map(platform => {
                    const profile = profiles.find(p => p.platform === platform.id);
                    const totalSolvedCount = profile?.totalSolved ?? 0;
                    const percentage = (totalSolvedCount / totalSolved * 100).toFixed(1);
                    
                    return (
                      <div 
                        key={platform.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-100 dark:border-slate-800 group/item"
                        style={{
                          background: `linear-gradient(to right, ${adjustColor(platform.color, 97)} 0%, rgba(255,255,255,0) 50%)`,
                        }}
                      >
                        <img src={platform.icon} alt={platform.name} className="w-5 h-5 mr-3 transition-all duration-300 group-hover/item:scale-110" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-medium text-sm">{platform.name}</span>
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-sm">{totalSolvedCount}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contests Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
            <span className="relative">
              Contest Participation
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
            </span>
          </h2>
          
          <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col h-full">
                <div className="flex justify-center mb-6">
                  <div className="relative w-52 h-52 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner transition-all duration-500 group-hover:scale-105">
                    <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-amber-500 to-amber-600">{totalContests}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">contests joined</span>
                    
                    {/* Circular ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-700 group-hover:rotate-0" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="rgba(203, 213, 225, 0.2)" 
                        strokeWidth="3"
                        className="dark:stroke-slate-700/30"
                      />
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="4"
                        strokeDasharray="282.7"
                        strokeDashoffset="140"
                        strokeLinecap="round"
                        className="transition-all duration-1000 group-hover:stroke-dashoffset-70"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Platform Contest Counts */}
                <div className="grid grid-cols-2 gap-3">
                  {profiles.filter(p => allContests.filter(c => c.platform === p.platform).length > 0)
                    .sort((a, b) => {
                      const aCount = allContests.filter(c => c.platform === a.platform).length;
                      const bCount = allContests.filter(c => c.platform === b.platform).length;
                      return bCount - aCount;
                    })
                    .map(profile => {
                      const platform = SUPPORTED_PLATFORMS.find(p => p.id === profile.platform);
                      const contestsCount = allContests.filter(c => c.platform === profile.platform).length;
                      const percentage = (contestsCount / totalContests * 100).toFixed(1);
                      
                      return (
                        <div 
                          key={profile.platform} 
                          className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-100 dark:border-slate-800 group/item"
                          style={{
                            background: `linear-gradient(to right, ${adjustColor(platform?.color || '#94a3b8', 97)} 0%, rgba(255,255,255,0) 50%)`,
                          }}
                        >
                          <img src={platform?.icon} alt={platform?.name} className="w-5 h-5 mr-3 transition-all duration-300 group-hover/item:scale-110" />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="font-medium text-sm">{platform?.name}</span>
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-sm">{contestsCount}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
                
                {/* Recent contests */}
                {allContests.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                      Recent Contests
                    </h3>
                    <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                      {allContests.slice(0, 5).map((contest, index) => {
                        const platform = SUPPORTED_PLATFORMS.find(p => p.id === contest.platform);
                        const date = new Date(contest.date);
                        return (
                          <div 
                            key={`${contest.name}-${index}`} 
                            className="flex items-center gap-3 p-2.5 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 group/contest"
                          >
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md group-hover/contest:bg-slate-200 dark:group-hover/contest:bg-slate-700 transition-colors">
                              {platform && (
                                <img src={platform.icon} alt={platform.name} className="h-4 w-4 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{contest.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 mt-0.5">
                                <span>
                                  {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                {contest.rank > 0 && (
                                  <span className="text-amber-500 flex items-center">
                                    <Award className="h-3 w-3 mr-0.5" />
                                    Rank: {contest.rank}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Contest Rankings */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800 dark:text-slate-200">
          <span className="relative">
            Contest Rankings
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary/70 to-transparent"></span>
          </span>
        </h2>
        
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80">
          <div className="absolute -top-32 right-32 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              Platform Ratings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {platformMetrics
                .filter(p => p.connected && p.rating > 0)
                .map(platform => {
                  // Find the highest rating for this platform (max value)
                  const profile = profiles.find(p => p.platform === platform.id);
                  const contestHistory = profile?.contestHistory || [];
                  const allRatings = contestHistory
                    .filter(c => c.rating !== undefined)
                    .map(c => c.rating as number);
                  
                  // Find max rating from history or use current
                  const maxRating = allRatings.length > 0 
                    ? Math.max(...allRatings, platform.rating) 
                    : platform.rating;
                  
                  // Calculate rating change percentage if history exists
                  let changePercent = 0;
                  let changeDirection = 'neutral';
                  
                  if (allRatings.length >= 2) {
                    // Get the rating from two contests ago to compare with current
                    const oldRating = allRatings[allRatings.length - 2] || allRatings[0];
                    const currentRating = platform.rating;
                    
                    if (oldRating !== currentRating) {
                      changePercent = +((currentRating - oldRating) / oldRating * 100).toFixed(1);
                      changeDirection = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
                    }
                  }
                  
                  return (
                    <div 
                      key={platform.id} 
                      className="group/card overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/50 dark:bg-slate-900/50 p-0.5"
                    >
                      <div className="relative h-full p-4 rounded-lg overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${adjustColor(platform.color, 97)} 0%, rgba(255,255,255,0) 60%)` 
                        }}
                      >
                        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10" style={{ background: `radial-gradient(circle, ${platform.color} 0%, transparent 70%)` }}></div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-white p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                            <img 
                              src={platform.icon} 
                              alt={platform.name} 
                              className="w-full h-full object-contain transition-all duration-300 group-hover/card:scale-110" 
                            />
                          </div>
                          <h3 className="font-semibold">{platform.name}</h3>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-3xl font-bold" style={{ color: platform.color }}>
                              {platform.rating > 0 ? platform.rating : 'N/A'}
                            </div>
                            
                            <div className={`text-sm flex items-center font-medium gap-1
                              ${changeDirection === 'up' ? 'text-green-500' : 
                                changeDirection === 'down' ? 'text-red-500' : 'text-slate-400'}`}
                            >
                              {changeDirection === 'up' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                                </svg>
                              )}
                              {changeDirection === 'down' && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-.916.305l-4.287-1.704a.75.75 0 01.45-1.43l2.942 1.17a19.387 19.387 0 00-3.355-6.347L7.061 11.06 2.28 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                                </svg>
                              )}
                              {changeDirection !== 'neutral' && (
                                <span>{Math.abs(changePercent)}%</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex justify-between">
                            <span>Max: {maxRating}</span>
                            {platformMetrics.find(p => p.id === platform.id)?.rank !== 'N/A' && (
                              <span>Rank: <span className="font-medium text-slate-700 dark:text-slate-300">{platformMetrics.find(p => p.id === platform.id)?.rank}</span></span>
                            )}
                          </div>
                          
                          {/* Mini rating chart - with smooth curve */}
                          <div className="h-12 w-full overflow-hidden mt-3">
                            <svg viewBox="0 0 100 24" className="w-full h-full">
                              <defs>
                                <linearGradient id={`gradient-${platform.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor={platform.color} stopOpacity="0.3" />
                                  <stop offset="100%" stopColor={platform.color} stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              {/* Create path from actual ratings if available */}
                              {allRatings.length > 1 ? (
                                <>
                                  <path
                                    d={generateRatingsPath(allRatings, 24)}
                                    fill="none"
                                    stroke={platform.color}
                                    strokeWidth="1.5"
                                    className="transition-all duration-1000 opacity-70 group-hover/card:opacity-100"
                                  />
                                  <path
                                    d={generateRatingsPath(allRatings, 24) + " L 100 24 L 0 24 Z"}
                                    fill={`url(#gradient-${platform.id})`}
                                    className="transition-all duration-1000 opacity-50 group-hover/card:opacity-80"
                                  />
                                </>
                              ) : (
                                <>
                                  <path
                                    d={generateRandomPath(20)} // Generate random path for demo if no data
                                    fill="none"
                                    stroke={platform.color}
                                    strokeWidth="1.5"
                                    className="transition-all duration-1000 opacity-70 group-hover/card:opacity-100"
                                  />
                                  <path
                                    d={generateRandomPath(20) + " L 100 24 L 0 24 Z"} // Area below the line
                                    fill={`url(#gradient-${platform.id})`}
                                    className="transition-all duration-1000 opacity-50 group-hover/card:opacity-80"
                                  />
                                </>
                              )}
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                          {platform.rank !== 'N/A' ? (
                            <div className="text-slate-500 dark:text-slate-400">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{allContests.filter(c => c.platform === platform.id).length}</span> contests
                            </div>
                          ) : (
                            <div></div>
                          )}
                          
                          {platform.username && (
                            <div className="text-slate-500 dark:text-slate-400">
                              @{platform.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Summary line - when no ratings */}
            {platformMetrics.filter(p => p.connected && p.rating > 0).length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No contest ratings available yet</p>
                <p className="text-sm mt-1">Participate in contests to see your ratings here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper components
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number) {
  // Remove the # if it exists
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.min(255, Math.floor(r * (100 + percent) / 100));
  g = Math.min(255, Math.floor(g * (100 + percent) / 100));
  b = Math.min(255, Math.floor(b * (100 + percent) / 100));
  
  // Convert back to hex with alpha
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

// Helper function to generate a random SVG path for the mini-chart
function generateRandomPath(points: number) {
  let path = `M 0 10`;
  const increment = 100 / (points - 1);
  
  for (let i = 1; i < points; i++) {
    const x = i * increment;
    const y = 10 - Math.random() * 10; // Random value between 0-10
    path += ` L ${x} ${y}`;
  }
  
  return path;
}

// Helper function to generate a random SVG path for the mini-chart
function generateRatingsPath(ratings: number[], height: number) {
  let path = `M 0 ${height}`;
  const increment = 100 / (ratings.length - 1);
  
  for (let i = 0; i < ratings.length; i++) {
    const x = i * increment;
    const y = height - (ratings[i] / 100) * height;
    path += ` L ${x} ${y}`;
  }
  
  return path;
} 