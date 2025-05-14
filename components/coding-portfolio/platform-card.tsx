"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// List of supported platforms with metadata
const PLATFORMS_META = {
  leetcode: {
    name: "LeetCode",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    url: (handle: string) => `https://leetcode.com/${handle}`,
    logo: "/images/platforms/leetcode.svg"
  },
  codeforces: {
    name: "Codeforces",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    url: (handle: string) => `https://codeforces.com/profile/${handle}`,
    logo: "/images/platforms/codeforces.svg"
  },
  codechef: {
    name: "CodeChef",
    color: "bg-brown-500",
    textColor: "text-orange-700",
    url: (handle: string) => `https://www.codechef.com/users/${handle}`,
    logo: "/images/platforms/codechef.svg"
  },
  hackerrank: {
    name: "HackerRank",
    color: "bg-green-500",
    textColor: "text-green-500",
    url: (handle: string) => `https://www.hackerrank.com/${handle}`,
    logo: "/images/platforms/hackerrank.svg"
  },
  hackerearth: {
    name: "HackerEarth",
    color: "bg-blue-700",
    textColor: "text-blue-700",
    url: (handle: string) => `https://www.hackerearth.com/@${handle}`,
    logo: "/images/platforms/hackerearth.svg"
  },
  geeksforgeeks: {
    name: "GeeksforGeeks",
    color: "bg-green-600",
    textColor: "text-green-600",
    url: (handle: string) => `https://auth.geeksforgeeks.org/user/${handle}`,
    logo: "/images/platforms/gfg.svg"
  },
  gfg: {
    name: "GeeksforGeeks",
    color: "bg-green-600",
    textColor: "text-green-600",
    url: (handle: string) => `https://auth.geeksforgeeks.org/user/${handle}`,
    logo: "/images/platforms/gfg.svg"
  }
}

interface PlatformCardProps {
  platform: string
  handle: string
  data: any
  error?: string
}

export function PlatformCard({ platform, handle, data, error }: PlatformCardProps) {
  // Get platform metadata
  const platformMeta = PLATFORMS_META[platform as keyof typeof PLATFORMS_META] || {
    name: platform,
    color: "bg-gray-500",
    textColor: "text-gray-500",
    url: (handle: string) => "#",
    logo: ""
  }

  // Handle error state
  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className={`${platformMeta.color} text-white`}>
          <CardTitle className="flex justify-between items-center">
            <span>{platformMeta.name}</span>
            <Badge variant="outline" className="text-xs bg-white/20 hover:bg-white/20 border-white/40">
              {handle}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle loading or no data state
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className={`${platformMeta.color} text-white`}>
          <CardTitle className="flex justify-between items-center">
            <span>{platformMeta.name}</span>
            <Badge variant="outline" className="text-xs bg-white/20 hover:bg-white/20 border-white/40">
              {handle}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get platform profile URL
  const profileUrl = platformMeta.url(handle)

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${platformMeta.color} text-white`}>
        <CardTitle className="flex justify-between items-center">
          <span>{platformMeta.name}</span>
          <Badge variant="outline" className="text-xs bg-white/20 hover:bg-white/20 border-white/40">
            {handle}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Problems Solved</p>
            <p className="text-2xl font-bold">{data.totalSolved || 0}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Rank</p>
            <p className="text-2xl font-bold">{data.rank?.toLocaleString() || "N/A"}</p>
          </div>
          
          {data.rating !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{data.rating?.toLocaleString() || "N/A"}</p>
            </div>
          )}
          
          {data.contests !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contests</p>
              <p className="text-2xl font-bold">{data.contests || 0}</p>
            </div>
          )}
          
          {data.badges !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Badges</p>
              <p className="text-2xl font-bold">{data.badges || 0}</p>
            </div>
          )}
          
          {data.score !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{data.score?.toLocaleString() || 0}</p>
            </div>
          )}
        </div>
        
        {data.problemsByDifficulty && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Problems by Difficulty</h4>
            
            {/* For LeetCode, CodeForces and similar platforms */}
            {data.problemsByDifficulty.easy !== undefined && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-500">Easy</span>
                    <span>{data.problemsByDifficulty.easy || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.easy / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-500">Medium</span>
                    <span>{data.problemsByDifficulty.medium || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.medium / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500">Hard</span>
                    <span>{data.problemsByDifficulty.hard || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.hard / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
                </div>
              </div>
            )}
            
            {/* For GeeksforGeeks specific difficulties */}
            {data.problemsByDifficulty.school !== undefined && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-300">School</span>
                    <span>{data.problemsByDifficulty.school || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.school / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-emerald-100" indicatorClassName="bg-emerald-300" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-500">Basic</span>
                    <span>{data.problemsByDifficulty.basic || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.basic / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Easy</span>
                    <span>{data.problemsByDifficulty.easy || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.easy / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-emerald-100" indicatorClassName="bg-emerald-600" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-500">Medium</span>
                    <span>{data.problemsByDifficulty.medium || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.medium / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500">Hard</span>
                    <span>{data.problemsByDifficulty.hard || 0}</span>
                  </div>
                  <Progress value={Math.min(100, (data.problemsByDifficulty.hard / Math.max(1, data.totalSolved)) * 100)} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(profileUrl, "_blank")} asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              <span>View Profile</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
        
        {/* Contest History */}
        {data.contestHistory && data.contestHistory.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium mb-2">Recent Contests</h4>
            <div className="overflow-x-auto max-h-40">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-1 text-left">Contest</th>
                    <th className="p-1 text-center">Date</th>
                    <th className="p-1 text-right">Rank</th>
                    {platform === 'codeforces' && <th className="p-1 text-right">Rating</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.contestHistory.slice(0, 5).map((contest: any, i: number) => (
                    <tr key={i} className="border-b border-muted/30">
                      <td className="p-1 truncate max-w-[120px]">{contest.name}</td>
                      <td className="p-1 text-center">{contest.date}</td>
                      <td className="p-1 text-right">{contest.rank.toLocaleString()}</td>
                      {platform === 'codeforces' && (
                        <td className="p-1 text-right">{contest.rating?.toLocaleString() || '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Activity Heatmap */}
        {data.activityHeatmap && data.activityHeatmap.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium mb-2">Activity (Last 90 days)</h4>
            <div className="flex flex-wrap gap-1">
              {data.activityHeatmap.map((day: any, i: number) => {
                // Calculate color intensity based on submission count
                const intensity = Math.min(day.count, 10) / 10;
                let bgColor;
                
                if (platform === 'leetcode') {
                  // LeetCode yellow color
                  bgColor = day.count === 0 ? 'bg-slate-100 dark:bg-slate-800' : 
                    `rgb(255, ${255 - Math.floor(intensity * 120)}, ${50 + Math.floor(intensity * 50)})`;
                } else if (platform === 'codeforces') {
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
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: day.count > 0 ? bgColor : undefined }}
                    title={`${day.date}: ${day.count} submissions`}
                  />
                );
              })}
            </div>
            
            {data.stats?.streak !== undefined && (
              <div className="mt-2 text-xs flex gap-4">
                <div>
                  <span className="text-muted-foreground">Current Streak:</span> 
                  <span className="font-medium ml-1">{data.stats.streak} days</span>
                </div>
                {data.stats.totalActiveDays !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Active Days:</span> 
                    <span className="font-medium ml-1">{data.stats.totalActiveDays}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 