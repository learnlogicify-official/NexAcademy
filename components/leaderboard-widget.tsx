"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, ArrowRight } from "lucide-react"

// Mock data for leaderboard
const leaderboardData = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 3250,
    rank: 1,
  },
  {
    id: 2,
    name: "Sarah Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 2980,
    rank: 2,
  },
  {
    id: 3,
    name: "Jamie Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 2450,
    rank: 3,
    isCurrentUser: true,
  },
  {
    id: 4,
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 2100,
    rank: 4,
  },
  {
    id: 5,
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    xp: 1950,
    rank: 5,
  },
]

export function LeaderboardWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Leaderboard</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderboardData.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 rounded-lg p-2 ${user.isCurrentUser ? "bg-secondary" : ""}`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {user.rank === 1 ? (
                <Trophy className="h-4 w-4 text-yellow-500" />
              ) : user.rank === 2 ? (
                <Trophy className="h-4 w-4 text-gray-400" />
              ) : user.rank === 3 ? (
                <Trophy className="h-4 w-4 text-amber-700" />
              ) : (
                user.rank
              )}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">
                {user.name}
                {user.isCurrentUser && <span className="ml-1 text-xs text-muted-foreground">(You)</span>}
              </p>
            </div>
            <div className="text-sm font-medium tabular-nums">{user.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

