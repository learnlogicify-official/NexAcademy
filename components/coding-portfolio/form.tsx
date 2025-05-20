"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, PlusCircle, Trash2, Award, Code, Star, Trophy, BarChart2 } from "lucide-react"
import { PlatformCard } from "./platform-card"

// List of supported platforms
const SUPPORTED_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", logo: "/images/platforms/leetcode.svg" },
  { id: "codeforces", name: "Codeforces", logo: "/images/platforms/codeforces.svg" },
  { id: "codechef", name: "CodeChef", logo: "/images/platforms/codechef.svg" },
  { id: "hackerrank", name: "HackerRank", logo: "/images/platforms/hackerrank.svg" },
  { id: "hackerearth", name: "HackerEarth", logo: "/images/platforms/hackerearth.svg" },
  { id: "geeksforgeeks", name: "GeeksforGeeks", logo: "/images/platforms/gfg.svg" },
  { id: "codingninjas", name: "Coding Ninjas", logo: "/images/platforms/codingninjas.svg" },
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

// Define a type for the platform profile data
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
    problemsSolved?: number;
    totalProblems?: number;
  }>;
  activityHeatmap?: Array<{
    date: string;
    count: number;
  }>;
  stats?: {
    streak?: number;
    totalActiveDays?: number;
    [key: string]: any;
  };
}

export function CodingPortfolioForm() {
  const { toast } = useToast()
  const [handles, setHandles] = useState<PlatformHandle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  
  // Refs to prevent duplicate API calls
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  
  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState(SUPPORTED_PLATFORMS[0].id)
  const [handle, setHandle] = useState("")
  
  // Unified Profile Tracker state
  const [trackerHandles, setTrackerHandles] = useState({
    leetcode: '',
    codeforces: '',
    codechef: '',
    gfg: '',
    hackerrank: '',
    hackerearth: '',
    codingninjas: '',
  });
  const [trackerResults, setTrackerResults] = useState<PlatformProfile[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  
  // Fetch user's platform handles on component mount
  useEffect(() => {
    fetchHandles()
  }, [])
  
  // Fetch platform handles from API
  const fetchHandles = async () => {
    // Debounce mechanism
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000 || isFetchingRef.current) {
      console.log("Debouncing fetchHandles call - too frequent");
      return;
    }
    
    lastFetchTimeRef.current = now;
    isFetchingRef.current = true;
    setLoading(true);
    
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
      isFetchingRef.current = false;
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
  
  // Unified Profile Tracker fetch
  const fetchUnifiedProfile = async () => {
    setTrackerLoading(true);
    setTrackerResults([]);
    try {
      const params = Object.entries(trackerHandles)
        .filter(([_, v]) => v.trim())
        .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
        .join('&');
      if (!params) {
        toast({ title: 'Error', description: 'Please enter at least one handle', variant: 'destructive' });
        setTrackerLoading(false);
        return;
      }
      const response = await fetch(`/api/user/profile-data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch profile data');
      const data = await response.json();
      setTrackerResults(data.profiles || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch profile data', variant: 'destructive' });
    } finally {
      setTrackerLoading(false);
    }
  };
  
  return (
    <Tabs defaultValue="handles" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="handles">Platform Handles</TabsTrigger>
        <TabsTrigger value="statistics">Statistics</TabsTrigger>
        <TabsTrigger value="tracker">Unified Profile Tracker</TabsTrigger>
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
      
      <TabsContent value="tracker" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Unified Profile Tracker</CardTitle>
            <CardDescription>
              Enter your handles for each platform and view your aggregated coding stats instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUPPORTED_PLATFORMS.map((platform) => (
                <div key={platform.id} className="flex items-center gap-2">
                  <img src={platform.logo} alt={platform.name} className="w-6 h-6" />
                  <Label htmlFor={`tracker-${platform.id}`}>{platform.name}</Label>
                  <Input
                    id={`tracker-${platform.id}`}
                    value={trackerHandles[platform.id as keyof typeof trackerHandles]}
                    onChange={e => setTrackerHandles(h => ({ ...h, [platform.id]: e.target.value }))}
                    placeholder={`Enter ${platform.name} handle`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={fetchUnifiedProfile} disabled={trackerLoading}>
              {trackerLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Fetch Profile Data
            </Button>
          </CardContent>
          {trackerResults.length > 0 && (
            <CardFooter className="flex flex-col">
              <div className="w-full">
                <h3 className="font-bold text-xl mb-4">Your Coding Profiles</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Total Solved</p>
                    <p className="text-2xl font-bold">
                      {trackerResults.reduce((total, profile) => total + (Number(profile.totalSolved) || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <Trophy className="h-6 w-6 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Contests</p>
                    <p className="text-2xl font-bold">
                      {trackerResults.reduce((total, profile) => total + (Number(profile.contests) || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">Badges</p>
                    <p className="text-2xl font-bold">
                      {trackerResults.reduce((total, profile) => total + (Number(profile.badges) || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <BarChart2 className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <p className="text-2xl font-bold">
                      {trackerResults.filter(p => !p.error).length}
                    </p>
                  </div>
                </div>
                
                {/* Platform Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trackerResults.map((profile) => (
                    <div key={profile.platform} className="border rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={SUPPORTED_PLATFORMS.find(p => p.id === profile.platform)?.logo} 
                            alt={profile.platform} 
                            className="w-8 h-8" 
                          />
                          <div>
                            <span className="font-bold text-lg capitalize">{profile.platform}</span>
                            <span className="text-xs text-slate-500 ml-2">@{profile.username}</span>
                          </div>
                        </div>
                      </div>
                      
                      {profile.error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-500 text-sm">
                          <XCircle className="h-4 w-4 inline mr-2" />
                          {profile.error}
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {profile.totalSolved !== undefined && (
                              <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">Solved:</span>
                                <span className="font-semibold">{profile.totalSolved}</span>
                              </div>
                            )}
                            {profile.rating !== undefined && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-500" />
                                <span className="text-muted-foreground">Rating:</span>
                                <span className="font-semibold">{profile.rating}</span>
                              </div>
                            )}
                            {profile.rank && (
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-secondary" />
                                <span className="text-muted-foreground">Rank:</span>
                                <span className="font-semibold">{profile.rank}</span>
                              </div>
                            )}
                            {profile.contests !== undefined && (
                              <div className="flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">Contests:</span>
                                <span className="font-semibold">{profile.contests}</span>
                              </div>
                            )}
                            {profile.badges !== undefined && (
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-muted-foreground">Badges:</span>
                                <span className="font-semibold">{profile.badges}</span>
                              </div>
                            )}
                            {profile.score !== undefined && (
                              <div className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4 text-blue-500" />
                                <span className="text-muted-foreground">Score:</span>
                                <span className="font-semibold">{profile.score}</span>
                              </div>
                            )}
                          </div>
                          
                          {profile.problemsByDifficulty && Object.keys(profile.problemsByDifficulty).length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Problems by Difficulty</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(profile.problemsByDifficulty).map(([diff, count]) => (
                                  <div key={diff} className="flex justify-between">
                                    <span className="capitalize">{diff}:</span>
                                    <span className="font-medium">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {profile.contestHistory && profile.contestHistory.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Recent Contests</p>
                              <div className="max-h-40 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="p-1 text-left">Contest</th>
                                      <th className="p-1 text-center">Date</th>
                                      <th className="p-1 text-right">Rank</th>
                                      {profile.platform === 'codeforces' && <th className="p-1 text-right">Rating</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {profile.contestHistory.map((contest, i) => (
                                      <tr key={i} className="border-b border-muted/30">
                                        <td className="p-1 truncate max-w-[100px]">{contest.name}</td>
                                        <td className="p-1 text-center">{contest.date}</td>
                                        <td className="p-1 text-right">{contest.rank}</td>
                                        {profile.platform === 'codeforces' && <td className="p-1 text-right">{contest.rating}</td>}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {profile.activityHeatmap && profile.activityHeatmap.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Activity (Last 90 days)</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.activityHeatmap.map((day, i) => {
                                  // Calculate color intensity based on submission count
                                  const intensity = Math.min(day.count, 10) / 10;
                                  let bgColor;
                                  
                                  if (profile.platform === 'leetcode') {
                                    // LeetCode yellow color
                                    bgColor = day.count === 0 ? 'bg-slate-100 dark:bg-slate-800' : 
                                      `rgb(255, ${255 - Math.floor(intensity * 120)}, ${50 + Math.floor(intensity * 50)})`;
                                  } else if (profile.platform === 'codeforces') {
                                    // Codeforces blue color
                                    bgColor = day.count === 0 ? 'bg-slate-100 dark:bg-slate-800' : 
                                      `rgb(${100 - Math.floor(intensity * 50)}, ${150 - Math.floor(intensity * 50)}, ${255 - Math.floor(intensity * 105)})`;
                                  } else {
                                    // Default green color for other platforms
                                    bgColor = day.count === 0 ? 'bg-slate-100 dark:bg-slate-800' : 
                                      `rgb(${50 + Math.floor(intensity * 50)}, ${200 - Math.floor(intensity * 100)}, ${50 + Math.floor(intensity * 50)})`;
                                  }
                                  
                                  return (
                                    <div 
                                      key={i} 
                                      className="w-3 h-3 rounded-sm"
                                      style={{ backgroundColor: day.count > 0 ? bgColor : undefined }}
                                      title={`${day.date}: ${day.count} submissions`}
                                    />
                                  );
                                })}
                              </div>
                              
                              {profile.stats?.streak !== undefined && (
                                <div className="mt-2 text-xs flex gap-4">
                                  <div>
                                    <span className="text-muted-foreground">Current Streak:</span> 
                                    <span className="font-medium ml-1">{profile.stats.streak} days</span>
                                  </div>
                                  {profile.stats.totalActiveDays !== undefined && (
                                    <div>
                                      <span className="text-muted-foreground">Active Days:</span> 
                                      <span className="font-medium ml-1">{profile.stats.totalActiveDays}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  )
} 