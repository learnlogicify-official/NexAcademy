"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, RefreshCw, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react"

const SUPPORTED_PLATFORMS = [
  { 
    id: "leetcode", 
    name: "LeetCode", 
    icon: "/images/platforms/leetcode.svg", 
    placeholder: "Enter your LeetCode username",
    baseUrl: "https://leetcode.com/",
    connectLabel: "Connect"
  },
  { 
    id: "codestudio", 
    name: "CodeStudio", 
    icon: "/images/platforms/codingninjas.svg", 
    placeholder: "Enter your Code360 UUID",
    baseUrl: "https://www.naukri.com/code360/profile/",
    connectLabel: "Connect"
  },
  { 
    id: "geeksforgeeks", 
    name: "GeeksForGeeks", 
    icon: "/images/platforms/gfg.svg", 
    placeholder: "Enter your GeeksForGeeks username",
    baseUrl: "https://www.geeksforgeeks.org/user/",
    connectLabel: "Connect"
  },
  { 
    id: "codechef", 
    name: "CodeChef", 
    icon: "/images/platforms/codechef.svg", 
    placeholder: "Enter your CodeChef username",
    baseUrl: "https://www.codechef.com/users/",
    connectLabel: "Connect" 
  },
  { 
    id: "codeforces", 
    name: "CodeForces", 
    icon: "/images/platforms/codeforces.svg", 
    placeholder: "Enter your CodeForces username",
    baseUrl: "https://codeforces.com/profile/",
    connectLabel: "Connect" 
  },
  { 
    id: "hackerrank", 
    name: "HackerRank", 
    icon: "/images/platforms/hackerrank.svg", 
    placeholder: "Enter your HackerRank username",
    baseUrl: "https://www.hackerrank.com/",
    connectLabel: "Connect" 
  },
  { 
    id: "hackerearth", 
    name: "HackerEarth", 
    icon: "/images/platforms/hackerearth.svg", 
    placeholder: "Enter your HackerEarth username",
    baseUrl: "https://www.hackerearth.com/@",
    connectLabel: "Connect" 
  },
]

export default function ConnectPlatformsPage() {
  const { toast } = useToast()
  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({})
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  
  // Keep track of refreshed platforms to show their status
  const [refreshedPlatforms, setRefreshedPlatforms] = useState<Set<string>>(new Set())
  const [connectionInProgress, setConnectionInProgress] = useState<string | null>(null)

  // Fetch existing platform connections
  useEffect(() => {
    fetchPlatformHandles()
  }, [])

  const fetchPlatformHandles = async () => {
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
      console.log("Loaded platform handles:", data.handles)
      
      // Create a map of platform ID to handle
      const handleMap: Record<string, string> = {}
      const statusMap: Record<string, string> = {}
      
      if (Array.isArray(data.handles)) {
        data.handles.forEach((h: any) => {
          // Map platform IDs from API to local IDs if needed
          let platformId = h.platform
          if (platformId === 'codingninjas') platformId = 'codestudio'
          if (platformId === 'gfg') platformId = 'geeksforgeeks'
          
          handleMap[platformId] = h.handle
          statusMap[platformId] = h.verified ? "verified" : "pending"
        })
      }
      
      setPlatformHandles(handleMap)
      setPlatformStatuses(statusMap)
      
      // Fetch profile data for connected platforms
      const verifiedPlatforms = Object.keys(handleMap).filter(platformId => 
        statusMap[platformId] === "verified"
      )
      
      console.log(`Found ${verifiedPlatforms.length} verified platforms`)
      
      // Only refresh data for platforms that haven't been refreshed yet
      for (const platformId of verifiedPlatforms) {
        if (!refreshedPlatforms.has(platformId)) {
          await refreshPlatformData(platformId, handleMap[platformId])
          setRefreshedPlatforms(prev => new Set([...prev, platformId]))
        }
      }
    } catch (error) {
      console.error("Error fetching platform handles:", error)
      toast({
        title: "Error",
        description: "Failed to load your platform connections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        case "codestudio":
          apiParam = `codingninjas=${handle}`
          break
        default:
          throw new Error("Unsupported platform")
      }
      
      const response = await fetch(`/api/user/profile-data?${apiParam}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) throw new Error("Failed to refresh platform data")
      
      const data = await response.json()
      
      // If we have a successful result, update the UI
      if (data.profiles && data.profiles.length > 0) {
        const profile = data.profiles[0]
        if (!profile.error) {
          // Don't show success toast for initial loads to avoid flood of notifications
          if (handleOverride === undefined) {
            toast({
              title: "Success",
              description: `Successfully refreshed ${platformId} data`,
            })
          }
        } else {
          toast({
            title: "Warning",
            description: `Couldn't fetch profile data: ${profile.error}`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error refreshing platform data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh platform data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(prev => ({ ...prev, [platformId]: false }))
    }
  }

  const renderStatusIcon = (platformId: string) => {
    const status = platformStatuses[platformId]
    
    if (!status) return null
    
    if (status === "verified") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Connect Platforms</h1>
          <Link href="/coding-portfolio">
            <Button variant="outline">Back to Portfolio</Button>
          </Link>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Connect your profiles from various coding platforms to showcase your achievements and track your progress.
        </p>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading your connections...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="text-xl font-semibold mb-2">Problem Solving</div>
            <div className="grid gap-4">
              {SUPPORTED_PLATFORMS.map((platform) => (
                <Card key={platform.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                          <img 
                            src={platform.icon} 
                            alt={platform.name} 
                            className="h-6 w-6" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{platform.name}</span>
                            {renderStatusIcon(platform.id)}
                          </div>
                          {platformStatuses[platform.id] === "verified" && (
                            <span className="text-sm text-slate-500">
                              Connected as: {platformHandles[platform.id]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {platformStatuses[platform.id] === "verified" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refreshPlatformData(platform.id)}
                              disabled={refreshing[platform.id] || connectionInProgress === platform.id}
                            >
                              {refreshing[platform.id] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Refresh
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => disconnectPlatform(platform.id)}
                              disabled={refreshing[platform.id] || connectionInProgress === platform.id}
                            >
                              {connectionInProgress === platform.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <Input
                                placeholder={platform.placeholder}
                                value={platformHandles[platform.id] || ""}
                                onChange={(e) => handleInputChange(platform.id, e.target.value)}
                                className="w-80"
                                disabled={connectionInProgress === platform.id}
                              />
                              <div className="text-xs text-slate-500">
                                {platform.baseUrl}<span className="font-semibold">username</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => connectPlatform(platform.id)}
                              disabled={connectionInProgress !== null}
                            >
                              {connectionInProgress === platform.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <>
                                  {platform.connectLabel} <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 