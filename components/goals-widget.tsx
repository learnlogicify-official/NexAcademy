"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Trophy, Target, ArrowRight } from "lucide-react";

// Mock data for goals
const goals = [
  {
    id: 1,
    title: "Complete 2 lessons today",
    progress: 50,
    target: 2,
    current: 1,
    reward: "50 XP",
    type: "daily",
  },
  {
    id: 2,
    title: "Earn 500 XP this week",
    progress: 70,
    target: 500,
    current: 350,
    reward: "Coding Streak Badge",
    type: "weekly",
  },
  {
    id: 3,
    title: "Complete React Essentials course",
    progress: 45,
    target: 100,
    current: 45,
    reward: "React Master Badge",
    type: "course",
  },
];

export function GoalsWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Goals</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {goal.type === "daily" ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : goal.type === "weekly" ? (
                  <Target className="h-4 w-4 text-purple-500" />
                ) : (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium">{goal.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Reward: {goal.reward}
              </span>
              {goal.progress === 100 ? (
                <Button size="sm" className="h-7 gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" /> Claim
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
