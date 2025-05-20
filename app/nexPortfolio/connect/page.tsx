"use client"

import ConnectUserBanner from "@/components/coding-portfolio/connect-user-banner"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Trash2,
  CheckCircle,
  Loader2,
  Code,
  Trophy,
  Award,
  Activity,
  PlusCircle,
  CheckCheck,
  AlertTriangle,
  Zap,
  ChevronRight,
  ExternalLink,
  User,
  Settings,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { motion } from "framer-motion"

const SUPPORTED_PLATFORMS = [
  { 
    id: "leetcode", 
    name: "LeetCode", 
    icon: "/images/platforms/leetcode.svg", 
    placeholder: "Enter your LeetCode username",
    baseUrl: "https://leetcode.com/",
    connectLabel: "Connect",
    color: "#FFA116",
    tagline: "Enhance your coding skills with algorithmic challenges",
    features: ["Problem solving", "Contests", "Interview prep"]
  },
  { 
    id: "codingninjas", 
    name: "CodingNinjas", 
    icon: "/images/platforms/codingninjas.svg", 
    placeholder: "Enter your Code360 UUID",
    baseUrl: "https://www.naukri.com/code360/profile/",
    connectLabel: "Connect",
    color: "#FC4F41",
    tagline: "Master your coding skills with real-world projects",
    features: ["DSA", "Projects", "Interview problems"]
  },
  { 
    id: "geeksforgeeks", 
    name: "GeeksForGeeks", 
    icon: "/images/platforms/gfg.svg", 
    placeholder: "Enter your GeeksForGeeks username",
    baseUrl: "https://www.geeksforgeeks.org/user/",
    connectLabel: "Connect",
    color: "#2F8D46",
    tagline: "A computer science portal for geeks",
    features: ["Data structures", "Algorithms", "Tutorials"]
  },
  { 
    id: "codechef", 
    name: "CodeChef", 
    icon: "/images/platforms/codechef.svg", 
    placeholder: "Enter your CodeChef username",
    baseUrl: "https://www.codechef.com/users/",
    connectLabel: "Connect",
    color: "#5B4638",
    tagline: "Competitive programming platform for cooking code",
    features: ["Contests", "DSA", "Long challenges"]
  },
  { 
    id: "codeforces", 
    name: "CodeForces", 
    icon: "/images/platforms/codeforces.svg", 
    placeholder: "Enter your CodeForces username",
    baseUrl: "https://codeforces.com/profile/",
    connectLabel: "Connect",
    color: "#1F8ACB",
    tagline: "Competitive programming with regular contests",
    features: ["Contests", "Ratings", "Problem solutions"]
  },
  { 
    id: "hackerrank", 
    name: "HackerRank", 
    icon: "/images/platforms/hackerrank.svg", 
    placeholder: "Enter your HackerRank username",
    baseUrl: "https://www.hackerrank.com/",
    connectLabel: "Connect",
    color: "#00EA64",
    tagline: "Skills certification for developers",
    features: ["Skill tests", "Certifications", "Practice"]
  },
  { 
    id: "hackerearth", 
    name: "HackerEarth", 
    icon: "/images/platforms/hackerearth.svg", 
    placeholder: "Enter your HackerEarth username",
    baseUrl: "https://www.hackerearth.com/@",
    connectLabel: "Connect",
    color: "#2C3454",
    tagline: "Hackathons and coding challenges for developers",
    features: ["Hackathons", "Challenges", "Hiring"]
  },
]

// Animated glowing gradient badge for connected platforms
const StatusBadge = ({ status }: { status: "verified" | "pending" | undefined }) => {
  if (!status) return null;
  
  return status === "verified" ? (
    <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none animate-pulse">
      <CheckCheck className="h-3 w-3 mr-1" />
      Connected
    </Badge>
  ) : (
    <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
};

// Platform card with hover effects and animations
const PlatformCard = ({ 
  platform, 
  status, 
  handle, 
  isRefreshing, 
  isConnecting,
  onConnect,
  onRefresh,
  onDisconnect,
  onInputChange
}: { 
  platform: typeof SUPPORTED_PLATFORMS[0], 
  status: string | undefined,
  handle: string | undefined,
  isRefreshing: boolean,
  isConnecting: boolean,
  onConnect: () => void,
  onRefresh: () => void,
  onDisconnect: () => void,
  onInputChange: (value: string) => void
}) => {
  const isVerified = status === "verified";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-[1.5px] border-slate-200/60 dark:border-slate-800/60 hover:border-[1.5px] hover:border-slate-300 dark:hover:border-slate-700">
        <CardContent className="p-0">
          {/* Gradient header based on platform color */}
          <div 
            className="h-2 w-full" 
            style={{ 
              background: `linear-gradient(to right, ${platform.color}, ${platform.color}80)` 
            }}
          />
          
          <div className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Platform info section */}
              <div className="flex items-start gap-4">
                <div 
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm p-3 relative group"
                  style={{ boxShadow: `0 0 10px 0 ${platform.color}30` }}
                >
                  <img 
                    src={platform.icon} 
                    alt={platform.name} 
                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110" 
                  />
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h3 className="font-bold text-lg">{platform.name}</h3>
                    <StatusBadge status={status as "verified" | "pending" | undefined} />
                  </div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {platform.tagline}
                  </p>
                  
                  {isVerified && (
                    <div className="flex items-center mt-1">
                      <div className="h-6 px-2 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center text-xs text-slate-600 dark:text-slate-300">
                        <Code className="h-3 w-3 mr-1 text-slate-500" />
                        {handle}
                      </div>
                      <a 
                        href={`${platform.baseUrl}${handle}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="ml-2 text-xs flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Profile
                      </a>
                    </div>
                  )}
                  
                  {/* Feature badges */}
                  {platform.features && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {platform.features.map(feature => (
                        <div 
                          key={feature} 
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions section */}
              <div className="flex flex-col gap-3">
                {isVerified ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRefresh}
                      disabled={isRefreshing || isConnecting}
                      className="relative overflow-hidden group"
                      style={{
                        borderColor: `${platform.color}50`,
                      }}
                    >
                      <span className="absolute inset-0 w-0 bg-gradient-to-r group-hover:w-full transition-all duration-300 opacity-10"
                        style={{ background: platform.color }}></span>
                      {isRefreshing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" style={{ color: platform.color }} />
                      )}
                      <span style={{ color: isRefreshing ? undefined : platform.color }}>Refresh</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDisconnect}
                      disabled={isRefreshing || isConnecting}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Input
                        placeholder={platform.placeholder}
                        value={handle || ""}
                        onChange={(e) => onInputChange(e.target.value)}
                        className="w-full pl-10 border-slate-200 focus:border-[1.5px] focus:border-opacity-50 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)]"
                        style={{ 
                          borderColor: `${platform.color}30`,
                          boxShadow: `0 0 0 0px ${platform.color}10`,
                          transition: "all 0.2s ease-in-out",
                        }}
                        disabled={isConnecting}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div 
                          className="flex items-center justify-center h-4 w-4" 
                          style={{ color: platform.color }}
                        >
                          <Code className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      {platform.baseUrl}<span className="font-semibold">username</span>
                    </div>
                    <Button 
                      onClick={onConnect}
                      disabled={isConnecting}
                      className="w-full relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(to right, ${platform.color}, ${platform.color}DD)`
                      }}
                    >
                      <span className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-300 opacity-10"></span>
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          {platform.connectLabel} <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ConnectPlatformsPage() {
  const { toast } = useToast()
  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({})
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  
  // Keep track of refreshed platforms to show their status
  const [refreshedPlatforms, setRefreshedPlatforms] = useState<Set<string>>(new Set())
  const [connectionInProgress, setConnectionInProgress] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'unconnected'>('all')
  
  // Create refs to track last fetch time and prevent duplicate calls
  const lastFetchTimeRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)
  const lastRefreshTimeRef = useRef<Record<string, number>>({})
  const isRefreshingRef = useRef<Record<string, boolean>>({})

  // Fetch existing platform connections
  useEffect(() => {
    fetchPlatformHandles()
  }, [])

  const fetchPlatformHandles = async () => {
    // Debounce mechanism to prevent multiple rapid calls
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 2000 || isFetchingRef.current) {
      console.log("Debouncing fetchPlatformHandles call - too frequent")
      return
    }
    
    lastFetchTimeRef.current = now
    isFetchingRef.current = true
    setLoading(true)
    
    try {
      const response = await fetch("/api/user/platform-handles", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) throw new Error("Failed to fetch platform handles")
      
      const data = await response.json()
      
      // Create a map of platform ID to handle
      const handleMap: Record<string, string> = {}
      const statusMap: Record<string, string> = {}
      
      if (Array.isArray(data.handles)) {
        data.handles.forEach((h: any) => {
          // Map platform IDs from API to local IDs if needed
          let platformId = h.platform
          if (platformId === 'gfg') platformId = 'geeksforgeeks'
          
          handleMap[platformId] = h.handle
          statusMap[platformId] = h.verified ? "verified" : "pending"
        })
      }
      
      setPlatformHandles(handleMap)
      setPlatformStatuses(statusMap)
      
      // On connect page, don't automatically fetch profile data for platforms
      // This prevents platform fetchers from being called by default
    } catch (error) {
      console.error("Error fetching platform handles:", error)
      toast({
        title: "Error",
        description: "Failed to load your platform connections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  const handleInputChange = (platformId: string, value: string) => {
    setPlatformHandles(prev => ({
      ...prev,
      [platformId]: value
    }))
  }

  const connectPlatform = async (platformId: string) => {
    const handle = platformHandles[platformId]
    if (!handle) return
    
    // Use the handle directly as the username
    const username = handle.trim()
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter a valid username",
        variant: "destructive",
      })
      return
    }
    
    setConnectionInProgress(platformId)
    
    try {
      const response = await fetch("/api/user/platform-handles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId, handle: username }),
      })
      
      if (!response.ok) throw new Error("Failed to connect platform")
      
      const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformId)
      toast({
        title: "Success",
        description: `Successfully connected to ${platform?.name}`,
      })
      
      // Update status
      setPlatformStatuses(prev => ({
        ...prev,
        [platformId]: "verified"
      }))
      
      // Inform the user they need to manually refresh data
      toast({
        title: "Action Required",
        description: "Please click the 'Refresh' button to load your profile data.",
        duration: 5000,
      })
      
      // Refresh data
      await refreshPlatformData(platformId)
      setRefreshedPlatforms(prev => new Set([...prev, platformId]))
    } catch (error) {
      console.error("Error connecting platform:", error)
      toast({
        title: "Error",
        description: "Failed to connect platform",
        variant: "destructive",
      })
    } finally {
      setConnectionInProgress(null)
    }
  }

  const disconnectPlatform = async (platformId: string) => {
    setConnectionInProgress(platformId)
    
    try {
      const response = await fetch(`/api/user/platform-handles?platform=${platformId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to disconnect platform")
      
      toast({
        title: "Success",
        description: "Platform disconnected successfully",
      })
      
      // Update state
      setPlatformHandles(prev => {
        const newHandles = { ...prev }
        delete newHandles[platformId]
        return newHandles
      })
      
      setPlatformStatuses(prev => {
        const newStatuses = { ...prev }
        delete newStatuses[platformId]
        return newStatuses
      })
      
      // Remove from refreshed platforms
      setRefreshedPlatforms(prev => {
        const newSet = new Set(prev)
        newSet.delete(platformId)
        return newSet
      })
    } catch (error) {
      console.error("Error disconnecting platform:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive",
      })
    } finally {
      setConnectionInProgress(null)
    }
  }

  const refreshPlatformData = async (platformId: string, handleOverride?: string) => {
    // Debounce mechanism to prevent multiple rapid refreshes of the same platform
    const now = Date.now()
    if ((now - (lastRefreshTimeRef.current[platformId] || 0) < 3000) || isRefreshingRef.current[platformId]) {
      console.log(`Debouncing refreshPlatformData call for ${platformId} - too frequent`)
      return
    }
    
    lastRefreshTimeRef.current[platformId] = now
    isRefreshingRef.current[platformId] = true
    setRefreshing(prev => ({ ...prev, [platformId]: true }))
    
    try {
      // Get the handle for this platform
      const handle = handleOverride || platformHandles[platformId]
      if (!handle) throw new Error("No handle found for this platform")
      
      // Call the profile data API to refresh platform data
      let apiParam = ""
      switch (platformId) {
        case "leetcode":
          apiParam = `leetcode=${handle}`
          break
        case "codeforces":
          apiParam = `codeforces=${handle}`
          break
        case "codechef":
          apiParam = `codechef=${handle}`
          break
        case "geeksforgeeks":
          apiParam = `gfg=${handle}`
          break
        case "hackerrank":
          apiParam = `hackerrank=${handle}`
          break
        case "hackerearth":
          apiParam = `hackerearth=${handle}`
          break
        case "codingninjas":
          apiParam = `codingninjas=${handle}`
          break
        default:
          throw new Error("Unsupported platform")
      }
      
      const response = await fetch(`/api/user/profile-data?${apiParam}`, {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refresh platform data");
      }
      
      const data = await response.json()
      
      // If we have a successful result, update the UI
      if (data.profiles && data.profiles.length > 0) {
        const profile = data.profiles[0]
        if (!profile.error) {
          // Don't show success toast for initial loads to avoid flood of notifications
          if (handleOverride === undefined) {
            toast({
              title: "Success",
              description: `Updated ${platformId} data successfully`,
            })
          }
          
          // Don't call fetchPlatformHandles here to prevent recursive calls
          // Instead, just update the local state directly
          setPlatformStatuses(prev => ({
            ...prev,
            [platformId]: "verified"
          }))
        } else {
          console.warn(`Error refreshing ${platformId} data:`, profile.error);
          toast({
            title: "Warning",
            description: `${platformId}: ${profile.error}`,
            variant: "destructive",
          })
        }
      } else {
        // No profiles were returned
        toast({
          title: "Error",
          description: `No profile data returned for ${platformId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error refreshing platform data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? 
          `${platformId}: ${error.message}` : 
          `Failed to refresh ${platformId} data`,
        variant: "destructive",
      })
    } finally {
      setRefreshing(prev => ({ ...prev, [platformId]: false }))
      isRefreshingRef.current[platformId] = false
    }
  }

  // Filter platforms based on active filter
  const filteredPlatforms = SUPPORTED_PLATFORMS.filter(platform => {
    const isConnected = platformStatuses[platform.id] === "verified";
    if (activeFilter === 'connected') return isConnected;
    if (activeFilter === 'unconnected') return !isConnected;
    return true;
  });

  return (
    <div className="relative p-2 md:p-4 lg:p-6 pb-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Banner */}
        <div>
          <ConnectUserBanner />
        </div>
        
        {/* Section header */}
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-3">
                Connect Platforms
              </h1>
              <p className="text-slate-600 dark:text-slate-300 max-w-xl">
                Link your coding profiles to showcase your achievements and track your progress across multiple
                platforms.
              </p>
              
              {/* Animated gradient underline */}
              <div className="absolute -bottom-4 left-0 h-0.5 w-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            </div>
          </div>
        </div>
        
        {/* Step by step guide card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-0"
        >
          <div className="rounded-xl overflow-hidden border-[1.5px] border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/10 backdrop-blur-sm">
            <div className="grid md:grid-cols-4">
              {/* Step 1 */}
              <div className="relative p-5 border-b md:border-r md:border-b-0 border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold">1</div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Enter Username</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
                  Add your handle for each platform you want to connect
                </p>
                <PlusCircle className="absolute bottom-4 right-4 text-indigo-300 dark:text-indigo-700 opacity-70" />
              </div>
              
              {/* Step 2 */}
              <div className="relative p-5 border-b md:border-r md:border-b-0 border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-bold">2</div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300">Connect</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
                  Link your profile to verify your account ownership
                </p>
                <Zap className="absolute bottom-4 right-4 text-purple-300 dark:text-purple-700 opacity-70" />
              </div>
              
              {/* Step 3 */}
              <div className="relative p-5 border-b md:border-r md:border-b-0 border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 font-bold">3</div>
                  <h3 className="font-semibold text-pink-900 dark:text-pink-300">Refresh Data</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
                  Load your latest stats and achievements
                </p>
                <RefreshCw className="absolute bottom-4 right-4 text-pink-300 dark:text-pink-700 opacity-70" />
              </div>
              
              {/* Step 4 */}
              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-bold">4</div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-300">Showcase Progress</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-11">
                  View unified stats in your coding portfolio
                </p>
                <Trophy className="absolute bottom-4 right-4 text-amber-300 dark:text-amber-700 opacity-70" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Platform connection section */}
        {loading ? (
          <div className="min-h-[400px] space-y-4">
            {/* Section header skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md mb-3 animate-pulse"></div>
                <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              </div>
            </div>
            
            {/* Platform cards skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="h-2 w-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                      <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Filter and stats bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Programming Platforms</h2>
                <div className="bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {SUPPORTED_PLATFORMS.length} Available
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      activeFilter === 'all' 
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveFilter('connected')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      activeFilter === 'connected' 
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Connected
                  </button>
                  <button
                    onClick={() => setActiveFilter('unconnected')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      activeFilter === 'unconnected' 
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Unconnected
                  </button>
                </div>
                
                <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                  Connected: <span className="font-bold text-blue-600 dark:text-blue-400">
                    {Object.values(platformStatuses).filter(status => status === "verified").length}
                  </span>/{SUPPORTED_PLATFORMS.length}
                </div>
              </div>
            </motion.div>
            
            {/* No results message */}
            {filteredPlatforms.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">No platforms found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No platforms match your current filter. Please try a different filter.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveFilter('all')}
                >
                  Show All Platforms
                </Button>
              </div>
            )}
            
            {/* Platform cards */}
            <div className="grid gap-4">
              {filteredPlatforms.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  status={platformStatuses[platform.id]}
                  handle={platformHandles[platform.id]}
                  isRefreshing={!!refreshing[platform.id]}
                  isConnecting={connectionInProgress === platform.id}
                  onConnect={() => connectPlatform(platform.id)}
                  onRefresh={() => refreshPlatformData(platform.id)}
                  onDisconnect={() => disconnectPlatform(platform.id)}
                  onInputChange={(value) => handleInputChange(platform.id, value)}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Footer section with tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium">Pro Tips</h3>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Keep data updated</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Refresh your data regularly to keep your portfolio current with your latest achievements
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Highlight strengths</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connect platforms where you have the strongest performance to showcase your abilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 