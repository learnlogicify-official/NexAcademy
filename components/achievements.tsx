"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Award, Target } from "lucide-react"

interface Achievement {
  id: number
  title: string
  description: string
  progress: number
  reward: string
}

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Achievements & Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
              <div className="flex h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-medium text-primary">
                {achievement.progress}%
              </div>
            </div>

            <Progress value={achievement.progress} className="h-2" />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Award className="h-3.5 w-3.5" />
                <span>Reward: {achievement.reward}</span>
              </div>

              {achievement.progress === 100 ? (
                <Button size="sm" className="h-7 gap-1 text-xs">
                  Claim Reward
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

