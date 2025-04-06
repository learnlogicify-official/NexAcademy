"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { Award, Check } from "lucide-react"

interface BadgeType {
  id: number
  name: string
  description: string
  icon: string
  earnedAt: string
  isPrimary: boolean
}

interface BadgesGridProps {
  badges: BadgeType[]
}

export function BadgesGrid({ badges }: BadgesGridProps) {
  const [userBadges, setUserBadges] = useState(badges)

  const setPrimaryBadge = (badgeId: number) => {
    setUserBadges(
      userBadges.map((badge) => ({
        ...badge,
        isPrimary: badge.id === badgeId,
      })),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> My Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {userBadges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center rounded-lg border p-4 text-center transition-all hover:shadow-md ${
                      badge.isPrimary ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
                      {badge.icon}
                      {badge.isPrimary && (
                        <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium">{badge.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(badge.earnedAt), "MMM d, yyyy")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      disabled={badge.isPrimary}
                      onClick={() => setPrimaryBadge(badge.id)}
                    >
                      {badge.isPrimary ? "Primary Badge" : "Set as Primary"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

