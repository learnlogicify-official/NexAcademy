"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTierProgress, getTierDescription } from "@/lib/level-tiers"

interface ProfileLevelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  userData: {
    name?: string
    avatar?: string
    level?: number
    levelTitle?: string
    tier?: string
    tierEmoji?: string
    currentXP?: number
    nextLevelXP?: number
    streak?: number
    achievements?: number
    daysActive?: number
  }
}

export function ProfileLevelCard({ userData, className, ...props }: ProfileLevelCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Use default values for undefined properties
  const level = userData?.level || 1
  const currentXP = userData?.currentXP || 0
  const nextLevelXP = userData?.nextLevelXP || 1000
  const tierDescription = getTierDescription(level)
  const tierProgress = getTierProgress(level)

  // Calculate XP percentage
  const xpPercentage = Math.min(100, Math.round((currentXP / nextLevelXP) * 100))

  // Format numbers with commas - handle undefined values
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "0"
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Get tier color
  const getTierColor = (tier: string | undefined) => {
    if (!tier) return "from-slate-400 to-slate-600"

    switch (tier) {
      case "Bronze Tier":
        return "from-amber-700 to-amber-900"
      case "Silver Tier":
        return "from-slate-400 to-slate-600"
      case "Gold Tier":
        return "from-yellow-400 to-yellow-600"
      case "Platinum Tier":
        return "from-cyan-400 to-cyan-600"
      case "Diamond Tier":
        return "from-purple-400 to-purple-600"
      case "Elite Tier":
        return "from-indigo-600 to-indigo-800"
      case "Legendary Tier":
        return "from-red-600 to-red-800"
      case "Grandmaster Tier":
        return "from-amber-400 to-amber-600"
      default:
        return "from-slate-400 to-slate-600"
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <div className={`bg-gradient-to-r ${getTierColor(userData?.tier)} h-16 relative`}>
        <div className="absolute -bottom-10 left-4">
          <div className="relative">
            <div className="rounded-full border-4 border-card bg-background">
              <Image
                src={userData?.avatar || "/placeholder.svg?height=64&width=64"}
                alt={userData?.name || "User"}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-foreground text-xs font-bold text-white shadow-md">
              {level}
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pt-12 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{userData?.levelTitle || `Level ${level}`}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {userData?.tier || "Bronze Tier"} {userData?.tierEmoji || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{tierDescription}</p>
          </div>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {/* XP Progress */}
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="mb-1.5 cursor-help"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium">
                      {formatNumber(currentXP)} / {formatNumber(nextLevelXP)} XP
                    </span>
                  </div>
                  <Progress value={xpPercentage} className="h-2" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{formatNumber(nextLevelXP - currentXP)} XP to next level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Tier Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Tier Progress</span>
            <span className="font-medium">{Math.round(tierProgress)}%</span>
          </div>
          <Progress value={tierProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
