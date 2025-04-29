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

interface ProblemsSolvedCardProps {
  totalSolved?: number
  totalProblems?: number
  categories?: ProblemCategory[]
  className?: string
}

export function ProblemsSolvedCard({
  totalSolved = 87,
  totalProblems = 3520,
  categories = [
    {
      name: "Easy",
      count: 42,
      color: "#4ade80",
      textColor: "text-emerald-500",
      percentage: 48,
    },
    {
      name: "Medium",
      count: 35,
      color: "#fbbf24",
      textColor: "text-amber-500",
      percentage: 40,
    },
    {
      name: "Hard",
      count: 10,
      color: "#f87171",
      textColor: "text-red-500",
      percentage: 12,
    },
  ],
  className,
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

  // Calculate radius and circumference for the radial chart
  const radius = 70
  const circumference = 2 * Math.PI * radius

  // Ensure all percentages are valid numbers and calculate segments
  const validCategories = categories.map((cat) => ({
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
    <Card className={`bg-[#121212] border-0 shadow-md w-full h-[360px] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
          Problems Solved
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isClient && (
          <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Radial Chart */}
              <div className="relative w-[180px] h-[180px] flex-shrink-0">
                <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="#2a2a2a" strokeWidth="12" />

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
                    className="text-3xl font-bold text-white"
                  >
                    {totalSolved}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-sm text-gray-400"
                  >
                    Problems Solved
                  </motion.div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex-grow w-full space-y-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Difficulty Breakdown</div>
                {validCategories.map((category, index) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className={`text-sm ${category.textColor}`}>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{category.count}</span>
                        <span className="text-xs text-gray-500">({category.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
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

            {/* Additional Stats */}
            <div className="mt-auto pt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{totalSolved}</div>
                <div className="text-xs text-gray-400">Total Solved</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {Math.round((totalSolved / (totalProblems || 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Completion</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{totalProblems - totalSolved}</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
