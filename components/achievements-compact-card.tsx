"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  earnedAt: string
  isPrimary: boolean
}

interface AchievementsCompactCardProps {
  achievements: Achievement[]
  className?: string
}

export function AchievementsCompactCard({ achievements, className }: AchievementsCompactCardProps) {
  // Sort achievements - primary ones first, then by date
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  })

  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-4">
          {/* Featured Achievements */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Featured</h3>
            <div className="grid grid-cols-2 gap-3">
              {sortedAchievements
                .filter((a) => a.isPrimary)
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[#1a1a1a] rounded-lg p-3 flex flex-col items-center text-center"
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="text-sm font-medium text-gray-200">{achievement.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recent</h3>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {sortedAchievements
                  .filter((a) => !a.isPrimary)
                  .slice(0, 12)
                  .map((achievement, index) => (
                    <Tooltip key={achievement.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                          className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-xl cursor-help"
                        >
                          {achievement.icon}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1">
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
