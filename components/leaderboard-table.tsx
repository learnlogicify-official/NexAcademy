"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Medal, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

interface LeaderboardUser {
  id: number
  name: string
  avatar: string
  level: {
    number: number
    title: string
  }
  xp: number
  rank: number
  badges: {
    name: string
    icon: string
  }[]
  coursesCompleted: number
  isCurrentUser: boolean
}

interface LeaderboardTableProps {
  data: LeaderboardUser[]
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-sm font-medium">{rank}</span>
    }
  }

  // Find the current user in the data
  const currentUser = data.find((user) => user.isCurrentUser)

  // Check if current user is not in the top 10
  const currentUserNotInTop = currentUser && !data.slice(0, 10).some((user) => user.isCurrentUser)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Level</th>
              <th className="px-4 py-3 text-left text-sm font-medium">XP</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Badges</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((user) => (
              <motion.tr
                key={user.id}
                className={`border-b transition-colors hover:bg-muted/50 ${
                  user.isCurrentUser ? "relative bg-primary/5 outline outline-2 outline-primary/20" : ""
                }`}
                onMouseEnter={() => setHoveredRow(user.id)}
                onMouseLeave={() => setHoveredRow(null)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <td className="px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getRankIcon(user.rank)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.name}
                        {user.isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.coursesCompleted} courses completed</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="level-badge">Level {user.level.number}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.level.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3">
                  <div className="xp-badge rounded-full px-2 py-1 text-xs font-medium text-white">
                    {user.xp.toLocaleString()} XP
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-1">
                    {user.badges.slice(0, 3).map((badge, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-lg">
                              {badge.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{badge.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {user.badges.length > 3 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                              +{user.badges.length - 3}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              {user.badges.slice(3).map((badge, index) => (
                                <p key={index}>
                                  {badge.icon} {badge.name}
                                </p>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={hoveredRow === user.id ? "default" : "ghost"} className="gap-1" asChild>
                    <a href={`/profile/${user.id}`}>
                      <span>View Profile</span>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show current user if not in top 10 */}
      {currentUserNotInTop && currentUser && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-muted-foreground">Your Ranking</div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
              <tbody>
                <motion.tr
                  className="relative bg-primary/5 outline outline-2 outline-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <td className="px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">{currentUser.rank}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>
                          {currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {currentUser.name}
                          <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {currentUser.coursesCompleted} courses completed
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="level-badge">Level {currentUser.level.number}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{currentUser.level.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-3">
                    <div className="xp-badge rounded-full px-2 py-1 text-xs font-medium text-white">
                      {currentUser.xp.toLocaleString()} XP
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-1">
                      {currentUser.badges.slice(0, 3).map((badge, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-lg">
                                {badge.icon}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{badge.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {currentUser.badges.length > 3 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                +{currentUser.badges.length - 3}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {currentUser.badges.slice(3).map((badge, index) => (
                                  <p key={index}>
                                    {badge.icon} {badge.name}
                                  </p>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="gap-1" asChild>
                      <a href="/profile">
                        <span>View Profile</span>
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

