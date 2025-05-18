"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ProblemCategory {
  name: string
  count: number
  color: string
  textColor: string
  percentage: number
}

interface PlatformProblem {
  id: string
  name: string
  color: string
  icon: string
  count: number
  percentage: number
}

interface ProblemsSolvedCardProps {
  totalSolved?: number
  totalProblems?: number
  categories?: ProblemCategory[]
  className?: string
  platformType?: string // add platform type to determine if it's LeetCode
  easyCount?: number
  mediumCount?: number
  hardCount?: number
  platforms?: PlatformProblem[] // add platforms for platform distribution
}

export function ProblemsSolvedCard({
  totalSolved = 87,
  totalProblems = 3520,
  categories,
  className,
  platformType = "",
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  platforms = [],
}: ProblemsSolvedCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [animateProgress, setAnimateProgress] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Delay animation start to ensure DOM is ready
    const timer = setTimeout(() => {
      setAnimateProgress(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])


  // Prepare categories based on platform type
  const finalCategories = categories || (
    platformType.toLowerCase() === "leetcode" 
    ? [
        {
          name: "Easy",
          count: easyCount,
          color: "#4ade80",
          textColor: "text-emerald-500",
          percentage: totalSolved > 0 ? Math.round((easyCount / totalSolved) * 100) : 0,
        },
        {
          name: "Medium",
          count: mediumCount,
          color: "#fbbf24",
          textColor: "text-amber-500",
          percentage: totalSolved > 0 ? Math.round((mediumCount / totalSolved) * 100) : 0,
        },
        {
          name: "Hard",
          count: hardCount,
          color: "#f87171",
          textColor: "text-red-500",
          percentage: totalSolved > 0 ? Math.round((hardCount / totalSolved) * 100) : 0,
        },
        {
          name: "Others",
          count: Math.max(0, totalSolved - (easyCount + mediumCount + hardCount)),
          color: "#60a5fa",
          textColor: "text-blue-500",
          percentage: totalSolved > 0 ? Math.round(((Math.max(0, totalSolved - (easyCount + mediumCount + hardCount))) / totalSolved) * 100) : 0,
        }
      ]
    : [
        {
          name: "Easy",
          count: easyCount,
          color: "#4ade80",
          textColor: "text-emerald-500",
          percentage: totalSolved > 0 ? Math.round((easyCount / totalSolved) * 100) : 0,
        },
        {
          name: "Medium",
          count: mediumCount,
          color: "#fbbf24",
          textColor: "text-amber-500",
          percentage: totalSolved > 0 ? Math.round((mediumCount / totalSolved) * 100) : 0,
        },
        {
          name: "Hard",
          count: hardCount,
          color: "#f87171",
          textColor: "text-red-500",
          percentage: totalSolved > 0 ? Math.round((hardCount / totalSolved) * 100) : 0,
        },
        {
          name: "Others",
          count: Math.max(0, totalSolved - (easyCount + mediumCount + hardCount)),
          color: "#60a5fa",
          textColor: "text-blue-500",
          percentage: totalSolved > 0 ? Math.round(((Math.max(0, totalSolved - (easyCount + mediumCount + hardCount))) / totalSolved) * 100) : 0,
        }
      ]
  );

  // Calculate radius and circumference for the radial chart
  const radius = 70
  const circumference = 2 * Math.PI * radius

  // Ensure all percentages are valid numbers and calculate segments
  const validCategories = finalCategories.map((cat) => ({
    ...cat,
    percentage: isNaN(cat.percentage) ? 0 : cat.percentage,
  }))

  // Calculate starting and ending positions for each segment
  const segments = validCategories.reduce(
    (acc, category, index) => {
      const dashLength = (category.percentage / 100) * circumference
      const offset = index === 0 ? 0 : acc[index - 1].offset + acc[index - 1].length

      acc.push({
        offset: offset,
        length: dashLength,
      })

      return acc
    },
    [] as Array<{ offset: number; length: number }>,
  )

  return (
    <Card className={`bg-white dark:bg-[#18181b] border-0 shadow-md h-full ${className ?? ''}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/40 backdrop-blur-sm pb-3 w-full">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Problems Solved ({totalSolved})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isClient && (
          <div className="flex flex-col h-full justify-between space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Radial Chart */}
              <div className="relative w-[180px] h-[180px] flex-shrink-0">
                <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="#d1d5db" strokeWidth="12" />

                  {/* Colored Segments */}
                  {validCategories.map((category, index) => (
                    <circle
                      key={category.name}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={category.color}
                      strokeWidth="12"
                      strokeDasharray={`${segments[index].length} ${circumference - segments[index].length}`}
                      strokeDashoffset={`${-segments[index].offset}`}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                  >
                    {totalSolved}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xs text-gray-700 dark:text-gray-400"
                  >
                    Problems Solved
                  </motion.div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex-grow w-full space-y-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Difficulty Breakdown</div>
                {validCategories.map((category, index) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className={`text-sm ${category.textColor} dark:text-${category.textColor.split('-')[1]}-400`}>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.count}</span>
                        <span className="text-xs text-gray-700 dark:text-gray-500">({category.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          backgroundColor: category.color,
                          width: animateProgress ? `${category.percentage}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Distribution */}
            {platforms.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-3">Platform Distribution</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-shrink-0 h-8 w-8 mr-3 rounded bg-white dark:bg-gray-700 p-1 flex items-center justify-center">
                        <img src={platform.icon} alt={platform.name} className="h-6 w-6" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{platform.name}</div>
                          <div className="text-sm font-semibold" style={{ color: platform.color }}>{platform.count}</div>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              backgroundColor: platform.color,
                              width: animateProgress ? `${platform.percentage}%` : "0%" 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Stats */}
            <div className="mt-auto pt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{totalSolved}</div>
                <div className="text-xs text-gray-700 dark:text-gray-400">Total Solved</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((totalSolved / (totalProblems || 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-400">Completion</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{totalProblems - totalSolved}</div>
                <div className="text-xs text-gray-700 dark:text-gray-400">Remaining</div>
              </div>
            </div>

            
          </div>
        )}
      </CardContent>
    </Card>
  )
}
