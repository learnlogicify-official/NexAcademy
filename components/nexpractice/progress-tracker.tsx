"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, Trophy, Zap, Code, BookOpen, Calendar, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgressStats {
  totalProblems: number
  solvedProblems: number
  easyProblems: { total: number, solved: number }
  mediumProblems: { total: number, solved: number }
  hardProblems: { total: number, solved: number }
  currentStreak: number
  longestStreak: number
  lastPracticed: string
  recentlyCompletedProblems: {
    id: string
    title: string
    difficulty: "Easy" | "Medium" | "Hard"
    completedAt: string
  }[]
}

export function ProgressTracker() {
  const [stats, setStats] = useState<ProgressStats>({
    totalProblems: 120,
    solvedProblems: 28,
    easyProblems: { total: 40, solved: 21 },
    mediumProblems: { total: 60, solved: 6 },
    hardProblems: { total: 20, solved: 1 },
    currentStreak: 6,
    longestStreak: 12,
    lastPracticed: "2023-04-18",
    recentlyCompletedProblems: [
      {
        id: "123",
        title: "Two Sum",
        difficulty: "Easy",
        completedAt: "2023-04-18"
      },
      {
        id: "456",
        title: "Valid Parentheses",
        difficulty: "Easy",
        completedAt: "2023-04-17"
      },
      {
        id: "789",
        title: "Merge Two Sorted Lists",
        difficulty: "Medium",
        completedAt: "2023-04-16"
      }
    ]
  })
  
  const [activeTab, setActiveTab] = useState("overview")
  const [progressAnimation, setProgressAnimation] = useState(0)
  
  // Animate progress on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressAnimation(stats.solvedProblems / stats.totalProblems * 100)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [stats.solvedProblems, stats.totalProblems])
  
  const getDifficultyColor = (difficulty: "Easy" | "Medium" | "Hard") => {
    switch (difficulty) {
      case "Easy": return "bg-green-500"
      case "Medium": return "bg-yellow-500"
      case "Hard": return "bg-red-500"
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Progress
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant={activeTab === "overview" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === "history" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              History
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{stats.solvedProblems} / {stats.totalProblems} problems</span>
              </div>
              <Progress value={progressAnimation} className="h-2" />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {Math.round(stats.solvedProblems / stats.totalProblems * 100)}% Complete
                </span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                    {stats.easyProblems.solved} Easy
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                    {stats.mediumProblems.solved} Medium
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                    {stats.hardProblems.solved} Hard
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Difficulty Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Difficulty Breakdown</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-green-700">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      Easy
                    </span>
                    <span className="text-xs font-medium">{stats.easyProblems.solved} / {stats.easyProblems.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full" 
                      style={{ width: `${stats.easyProblems.solved / stats.easyProblems.total * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-yellow-700">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      Medium
                    </span>
                    <span className="text-xs font-medium">{stats.mediumProblems.solved} / {stats.mediumProblems.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full rounded-full" 
                      style={{ width: `${stats.mediumProblems.solved / stats.mediumProblems.total * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-red-700">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      Hard
                    </span>
                    <span className="text-xs font-medium">{stats.hardProblems.solved} / {stats.hardProblems.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ width: `${stats.hardProblems.solved / stats.hardProblems.total * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-blue-50 border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                    <div className="text-xl font-bold">{stats.currentStreak} days</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg bg-purple-50 border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                    <div className="text-xl font-bold">{stats.longestStreak} days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recently Completed</h4>
              <span className="text-xs text-muted-foreground">
                Last practiced: {formatDate(stats.lastPracticed)}
              </span>
            </div>
            
            <div className="space-y-3">
              {stats.recentlyCompletedProblems.map(problem => (
                <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getDifficultyColor(problem.difficulty)}`}>
                      <Code className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{problem.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Completed on {formatDate(problem.completedAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`
                    ${problem.difficulty === "Easy" ? "bg-green-100 text-green-700 border-green-200" : 
                      problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : 
                      "bg-red-100 text-red-700 border-red-200"}
                  `}>
                    {problem.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              View Full History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 