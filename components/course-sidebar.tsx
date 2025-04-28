"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Star, Award, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseSidebarProps {
  xpEarned: number
  totalXP: number
  level: number
  streak: number
  className?: string
}

export function CourseSidebar({ xpEarned, totalXP, level, streak, className }: CourseSidebarProps) {
  // Calculate next level XP
  const nextLevelXP = Math.ceil(totalXP / 10)
  const currentLevelXP = xpEarned % nextLevelXP
  const levelProgress = (currentLevelXP / nextLevelXP) * 100

  // Mock achievements data
  const achievements = [
    {
      name: "Fast Learner",
      description: "Complete 3 modules in a single day",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      unlocked: true,
    },
    {
      name: "Perfect Score",
      description: "Get 100% on any test level",
      icon: <Star className="h-5 w-5 text-amber-500" />,
      unlocked: true,
    },
    {
      name: "Coding Streak",
      description: "Study for 7 consecutive days",
      icon: <Flame className="h-5 w-5 text-red-500" />,
      unlocked: streak >= 7,
    },
    {
      name: "Module Master",
      description: "Complete all modules in a course",
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      unlocked: false,
    },
  ]

  return (
    <div className={cn("space-y-6 p-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Level {level}</div>
                <div className="text-xs text-muted-foreground">Intermediate</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{xpEarned} XP</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Next Level</span>
              <span>
                {currentLevelXP}/{nextLevelXP} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold">{Math.floor((xpEarned / totalXP) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Course</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 mb-2">
                <Flame className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  achievement.unlocked ? "bg-muted" : "bg-muted/50 opacity-60"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    achievement.unlocked ? "bg-primary/10" : "bg-muted-foreground/10"
                  }`}
                >
                  {achievement.icon}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {achievement.name}
                    {achievement.unlocked && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
