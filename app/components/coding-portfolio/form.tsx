"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, PlusCircle, Trash2 } from "lucide-react"

// Import directly from absolute path
import { PlatformCard } from "@/components/coding-portfolio/platform-card"

// List of supported platforms
const SUPPORTED_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", logo: "/images/platforms/leetcode.svg" },
  { id: "codeforces", name: "Codeforces", logo: "/images/platforms/codeforces.svg" },
  { id: "codechef", name: "CodeChef", logo: "/images/platforms/codechef.svg" },
  { id: "hackerrank", name: "HackerRank", logo: "/images/platforms/hackerrank.svg" },
  { id: "hackerearth", name: "HackerEarth", logo: "/images/platforms/hackerearth.svg" },
  { id: "geeksforgeeks", name: "GeeksforGeeks", logo: "/images/platforms/gfg.svg" },
]

interface PlatformHandle {
  id: string
  userId: string
  platform: string
  handle: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

interface PlatformData {
  platform: string
  handle: string
  data: any
  error?: string
}

export function CodingPortfolioForm() {
  const { toast } = useToast()
  const [handles, setHandles] = useState<PlatformHandle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  
  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState(SUPPORTED_PLATFORMS[0].id)
  const [handle, setHandle] = useState("")
  
  // Fetch user's platform handles on component mount
  useEffect(() => {
    fetchHandles()
  }, [])
  
  // Fetch platform handles from API
  const fetchHandles = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/platform-handles")
      if (!response.ok) throw new Error("Failed to fetch platform handles")
      
      const data = await response.json()
      setHandles(data.handles || [])
      
      // Fetch platform data if handles exist
      if (data.handles && data.handles.length > 0) {
        fetchPlatformData()
      }
    } catch (error) {
      console.error("Error fetching platform handles:", error)
      toast({
        title: "Error",
        description: "Failed to fetch platform handles. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch platform data from Clist API
  const fetchPlatformData = async () => {
    setDataLoading(true)
    try {
      const response = await fetch("/api/user/clist-data")
      if (!response.ok) throw new Error("Failed to fetch platform data")
      
      const data = await response.json()
      setPlatformData(data.platforms || [])
    } catch (error) {
      console.error("Error fetching platform data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch coding platform data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }
  
  // Submit handle form
  const submitHandle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPlatform || !handle.trim()) {
      toast({
        title: "Error",
        description: "Please select a platform and enter a handle",
        variant: "destructive",
      })
      return
    }
    
    setSubmitting(true)
    try {
      const response = await fetch("/api/user/platform-handles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform, handle: handle.trim() }),
      })
      
      if (!response.ok) throw new Error("Failed to save platform handle")
      
      // Reset form and refresh handles
      setHandle("")
      await fetchHandles()
      
      toast({
        title: "Success",
        description: "Platform handle saved successfully",
      })
    } catch (error) {
      console.error("Error saving platform handle:", error)
      toast({
        title: "Error",
        description: "Failed to save platform handle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Delete platform handle
  const deleteHandle = async (platform: string) => {
    try {
      const response = await fetch(`/api/user/platform-handles?platform=${platform}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete platform handle")
      
      // Refresh handles after deletion
      await fetchHandles()
      
      toast({
        title: "Success",
        description: "Platform handle deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting platform handle:", error)
      toast({
        title: "Error",
        description: "Failed to delete platform handle. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  // Refresh platform data
  const refreshData = () => {
    fetchPlatformData()
  }
  
  // Function to switch to handles tab
  const switchToHandlesTab = () => {
    const handlesTabElement = document.querySelector('[data-value="handles"]') as HTMLElement | null
    if (handlesTabElement) {
      handlesTabElement.click()
    }
  }
  
  return (
    <Tabs defaultValue="handles" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="handles">Platform Handles</TabsTrigger>
        <TabsTrigger value="statistics">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="handles" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Platform Handle</CardTitle>
            <CardDescription>
              Connect your coding platform profiles to showcase your achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitHandle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_PLATFORMS.map((platform) => (
                    <Button
                      key={platform.id}
                      type="button"
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      className="justify-start h-auto py-2"
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="handle">Username</Label>
                <Input
                  id="handle"
                  placeholder="Enter your username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Platform
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
            <CardDescription>
              Manage your connected coding platform profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : handles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't connected any platforms yet.</p>
                <p className="text-sm">Add your first platform above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {handles.map((handle) => {
                  const platform = SUPPORTED_PLATFORMS.find(p => p.id === handle.platform)
                  return (
                    <div key={handle.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {/* Add platform logo here if available */}
                        <div>
                          <p className="font-medium">{platform?.name || handle.platform}</p>
                          <p className="text-sm text-muted-foreground">{handle.handle}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHandle(handle.platform)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          {handles.length > 0 && (
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={refreshData} disabled={dataLoading}>
                {dataLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>Refresh Data</>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      
      <TabsContent value="statistics" className="space-y-6 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Coding Achievements</h2>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={dataLoading}>
            {dataLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>Refresh Data</>
            )}
          </Button>
        </div>
        
        {loading || dataLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : handles.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/30">
            <h3 className="text-xl font-medium mb-2">No platforms connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your coding platforms to see your statistics here.
            </p>
            <Button onClick={switchToHandlesTab}>
              Add Platforms
            </Button>
          </div>
        ) : platformData.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/30">
            <h3 className="text-xl font-medium mb-2">No data available</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't fetch your coding statistics. Please try refreshing.
            </p>
            <Button onClick={refreshData}>
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformData.map((platform) => (
              <PlatformCard 
                key={platform.platform} 
                platform={platform.platform}
                handle={platform.handle}
                data={platform.data}
                error={platform.error}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
} 