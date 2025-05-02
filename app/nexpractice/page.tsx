"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Code, Blocks, Trophy, Star, BrainCircuit, Rocket, BookOpen, Clock, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function NexPracticePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Example practice problems
  const practiceProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Arrays",
      completedBy: 7894,
      accuracy: 76,
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      category: "Trees",
      completedBy: 4532,
      accuracy: 68,
    },
    {
      id: 3,
      title: "Merge Sort Implementation",
      difficulty: "Medium",
      category: "Sorting",
      completedBy: 3921,
      accuracy: 62,
    },
    {
      id: 4,
      title: "Dynamic Programming Challenge",
      difficulty: "Hard",
      category: "DP",
      completedBy: 2145,
      accuracy: 48,
    }
  ]

  // Example coding challenges
  const codingChallenges = [
    {
      id: 101,
      title: "Weekly Challenge: String Manipulation",
      deadline: "3 days left",
      participants: 324,
      prize: 200,
      xp: 500
    },
    {
      id: 102,
      title: "Algorithm Speedrun",
      deadline: "5 days left",
      participants: 186,
      prize: 150,
      xp: 350
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500"
      case "medium": return "bg-yellow-500"
      case "hard": return "bg-red-500"
      default: return "bg-blue-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">NexPractice</h1>
          <p className="text-muted-foreground">Sharpen your coding skills with practice problems and challenges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">24/100</p>
              </div>
              <Code className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Challenges Won</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Trophy className="h-8 w-8 text-amber-500 opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Coding Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500 opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">4,250</p>
              </div>
              <Star className="h-8 w-8 text-purple-500 opacity-80" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="practice" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="practice" className="gap-2">
              <Code className="h-4 w-4" />
              <span>Practice</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-2">
              <Blocks className="h-4 w-4" />
              <span>Code Editor</span>
            </TabsTrigger>
          </TabsList>

          {/* Practice Problems Tab */}
          <TabsContent value="practice" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Practice Problems</h2>
              <Button size="sm">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practiceProblems.map((problem) => (
                <Card key={problem.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{problem.title}</h3>
                        <div className="flex gap-2 mt-2 mb-4">
                          <Badge className={`${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </Badge>
                          <Badge variant="outline">{problem.category}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <BrainCircuit className="h-3 w-3 mr-1" />
                          {problem.completedBy.toLocaleString()} solved
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Rocket className="h-3 w-3 mr-1" />
                          {problem.accuracy}% accuracy
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Solve Problem</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Coding Challenges</h2>
              <Button size="sm">View All</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {codingChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-medium">{challenge.title}</h3>
                        <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {challenge.deadline}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {challenge.participants} participants
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm font-medium flex items-center text-amber-500">
                          <Trophy className="h-4 w-4 mr-1" />
                          {challenge.prize} NexCoins
                        </div>
                        <div className="text-sm flex items-center text-purple-500">
                          <Star className="h-4 w-4 mr-1" />
                          {challenge.xp} XP
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button size="sm">Join Challenge</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Code Editor Tab */}
          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 text-gray-200 rounded-md p-6 font-mono text-sm overflow-auto">
                  <pre className="whitespace-pre">
                    <code>
                      {`// Welcome to the NexPractice Code Editor
// Start writing your code here

function solution(input) {
  // Your solution here
  let result = [];
  
  // Example code
  for (let i = 0; i < input.length; i++) {
    result.push(input[i] * 2);
  }
  
  return result;
}

// Test your solution
const testInput = [1, 2, 3, 4, 5];
console.log(solution(testInput)); // Expected: [2, 4, 6, 8, 10]
`}
                    </code>
                  </pre>
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline">Reset</Button>
                  <Button>Run Code</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 