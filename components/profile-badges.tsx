"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, parseISO } from "date-fns"
import { Award, Check, Lock } from "lucide-react"

interface Badge {
  id: number
  name: string
  description: string
  icon: string
  earnedAt: string
  isPrimary: boolean
}

interface ProfileBadgesProps {
  badges: Badge[]
}

// Mock locked badges
const lockedBadges = [
  {
    id: 101,
    name: "Algorithm Master",
    description: "Solve 50 algorithm problems",
    icon: "🧠",
    progress: 74,
  },
  {
    id: 102,
    name: "Full Stack Developer",
    description: "Complete both frontend and backend courses",
    icon: "🔄",
    progress: 45,
  },
  {
    id: 103,
    name: "Database Wizard",
    description: "Complete all database-related assignments with excellence",
    icon: "💾",
    progress: 30,
  },
  {
    id: 104,
    name: "30-Day Streak",
    description: "Maintain a coding streak for 30 consecutive days",
    icon: "🔥",
    progress: 10,
  },
  {
    id: 105,
    name: "Community Leader",
    description: "Help 20 other students in the forum",
    icon: "👑",
    progress: 25,
  },
]

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  const [userBadges, setUserBadges] = useState(badges)
  const [activeTab, setActiveTab] = useState("earned")

  const setPrimaryBadge = (badgeId: number) => {
    setUserBadges(
      userBadges.map((badge) => ({
        ...badge,
        isPrimary: badge.id === badgeId,
      })),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Badges & Achievements
        </h2>
        <Tabs defaultValue="earned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="earned">Earned ({badges.length})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({lockedBadges.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="earned" className="mt-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {userBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`flex flex-col items-center rounded-lg border p-4 text-center transition-all hover:shadow-md ${
                badge.isPrimary ? "border-primary bg-primary/5" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
                      {badge.icon}
                      {badge.isPrimary && (
                        <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm font-medium">{badge.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{format(parseISO(badge.earnedAt), "MMM d, yyyy")}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                disabled={badge.isPrimary}
                onClick={() => setPrimaryBadge(badge.id)}
              >
                {badge.isPrimary ? "Primary Badge" : "Set as Primary"}
              </Button>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="locked" className="mt-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {lockedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className="flex flex-col items-center rounded-lg border border-dashed p-4 text-center opacity-70 hover:opacity-100 transition-opacity"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 text-3xl">
                      {badge.icon}
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${badge.progress}%` }}></div>
                    </div>
                    <p className="mt-1 text-xs text-right">{badge.progress}% complete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm font-medium">{badge.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${badge.progress}%` }}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>
    </div>
  )
}

