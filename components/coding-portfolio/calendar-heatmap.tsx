"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays, isSameDay, addDays, isSameMonth } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Info, Code, CheckCircle, XCircle, Clock, AlertTriangle, Zap, BarChart } from "lucide-react"

interface ActivityDetail {
  type: string
  title: string
  xp: number
  timestamp: string
  status?: string | null
  color?: string
}

interface VerdictSummary {
  status: string
  readableStatus: string
  count: number
  color: string
}

interface ActivityData {
  date: string
  count: number
  details?: ActivityDetail[]
  verdictSummary?: VerdictSummary[]
  verdictCounts?: {
    [key: string]: number
  }
}

interface ProfileHeatmapProps {
  data: ActivityData[]
  submissionStats?: {
    status: string
    readableStatus: string
    count: number
    color: string
  }[]
}

export function CalendarHeatmap({ data, submissionStats }: ProfileHeatmapProps) {
  // Generate calendar grid properly
  const today = new Date()
  const startDate = subDays(today, 364) // Go back ~1 year

  // Find the first Sunday before or on our start date - this is our actual grid start
  let gridStartDate = startDate
  while (gridStartDate.getDay() !== 0) {
    // 0 = Sunday
    gridStartDate = subDays(gridStartDate, 1)
  }

  // Process dates to avoid duplicates - generate a clean 53x7 grid (53 weeks max)
  const calendarGrid: Date[][] = []

  // Generate grid row by row (each row = 1 week)
  let currentDate = gridStartDate
  while (currentDate <= today) {
    const week: Date[] = []

    // Fill in days for this week (Sun-Sat)
    for (let i = 0; i < 7; i++) {
      // Only add dates up to today
      if (currentDate <= today) {
        week.push(new Date(currentDate))
      } else {
        // For future dates, add null
        week.push(null as any) // Using any to allow null in the grid
      }

      // Move to next day
      currentDate = addDays(currentDate, 1)
      }
      
    // Add this week to the grid if it has at least one non-null day
    if (week.some((d) => d !== null)) {
      calendarGrid.push(week)
    }
  }

  // Use calendarGrid instead of weeks
  const weeks = calendarGrid

  // Get activity level for a specific date
  const getActivityLevel = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity) return 0
    
    return activity.count
  }

  // Get dominant verdict for a date (for coloring)
  const getDominantVerdict = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity || !activity.verdictSummary || activity.verdictSummary.length === 0) {
      return null
    }

    // Find the verdict with the highest count
    return activity.verdictSummary.reduce((prev, current) => (prev.count > current.count ? prev : current))
    }
    
  // Get color based on activity level for activity mode
  const getActivityColor = (level: number) => {
    if (level === 0) return "bg-gray-200 dark:bg-[#2C2C2C]"
    if (level === 1) return "bg-green-200 dark:bg-green-900"
    if (level === 2) return "bg-green-400 dark:bg-green-700"
    if (level === 3) return "bg-green-500 dark:bg-green-600"
    return "bg-green-600 dark:bg-green-500"
  }

  // Get activity details for a specific date
  const getActivityDetails = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity || !activity.details) return []

    return activity.details
  }

  // Get verdict summary for a date
  const getVerdictSummary = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity || !activity.verdictSummary) {
      // If verdictSummary isn't available, try to compute from verdictCounts
      if (activity?.verdictCounts) {
        return Object.entries(activity.verdictCounts).map(([status, count]) => ({
          status,
          readableStatus: getReadableStatus(status),
          count,
          color: getColorForStatus(status),
        }))
      }
      return []
    }

    return activity.verdictSummary
  }
  
  // Helper function to get readable status
  const getReadableStatus = (status: string | null) => {
    if (!status) return "Unknown"

    // Replace underscores with spaces and capitalize each word
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Helper function to get color for status
  const getColorForStatus = (status: string | null) => {
    switch (status) {
      case "ACCEPTED":
        return "#4ade80" // green
      case "WRONG_ANSWER":
        return "#f87171" // red
      case "TIME_LIMIT_EXCEEDED":
        return "#fbbf24" // amber
      case "COMPILATION_ERROR":
        return "#a78bfa" // purple
      case "RUNTIME_ERROR":
        return "#fb7185" // rose
      case "MEMORY_LIMIT_EXCEEDED":
        return "#60a5fa" // blue
      default:
        return "#94a3b8" // slate
    }
  }
  
  // Get month labels with their positions
  const getMonthLabels = () => {
    const months = []
    let currentMonth = null
    let monthStartWeek = 0

    for (let i = 0; i < weeks.length; i++) {
      // Get the first non-null date in this week
      const firstValidDate = weeks[i].find((d) => d !== null)
      if (!firstValidDate) continue
      
      const month = format(firstValidDate, "MMM")
      if (month !== currentMonth) {
        if (currentMonth !== null) {
          // Add the previous month with its span
          months.push({
            month: currentMonth,
            startWeek: monthStartWeek,
            endWeek: i - 1,
          })
        }
        currentMonth = month
        monthStartWeek = i
      }
    }

    // Add the last month
    if (currentMonth !== null) {
      months.push({
        month: currentMonth,
        startWeek: monthStartWeek,
        endWeek: weeks.length - 1,
      })
    }

    return months
  }

  const monthLabels = getMonthLabels()
  
  // Calculate fixed width for each week
  const weekWidth = 14 // Width of each week column in pixels
  const weekGap = 2 // Gap between weeks in pixels
  const monthGap = 8 // Gap between months in pixels
  
  // Calculate activity stats
  const totalDays = data.length
  const activeDays = data.filter((day) => day.count > 0).length
  const totalActivities = data.reduce((sum, day) => sum + day.count, 0)
  const activityPercentage = Math.round((activeDays / totalDays) * 100)

  // Get verdict icon
  const getVerdictIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "WRONG_ANSWER":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "TIME_LIMIT_EXCEEDED":
        return <Clock className="h-3 w-3 text-amber-500" />
      case "COMPILATION_ERROR":
        return <AlertTriangle className="h-3 w-3 text-purple-500" />
      case "RUNTIME_ERROR":
        return <Zap className="h-3 w-3 text-rose-500" />
      case "MEMORY_LIMIT_EXCEEDED":
        return <Code className="h-3 w-3 text-blue-500" />
      default:
        return <Info className="h-3 w-3 text-slate-500" />
    }
  }

  // Format total counts for each verdict type
  const getVerdictTotals = () => {
    if (!submissionStats || submissionStats.length === 0) return null

    const totals: Record<string, number> = {}
    let total = 0

    submissionStats.forEach((stat) => {
      totals[stat.status] = stat.count
      total += stat.count
    })

    return { totals, total }
  }

  const verdictTotals = getVerdictTotals()
  
  return (
    <div className="w-full bg-white dark:bg-[#121212] p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Coding Activity</h3>
        </div>
      </div>
        
      {/* Compact Verdict Stats */}
      {verdictTotals && (
        <div className="flex flex-wrap gap-2 mb-4">
          {submissionStats?.map((stat, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800/70 px-2 py-1 rounded"
            >
              {getVerdictIcon(stat.status)}
              <span className="font-medium" style={{ color: stat.color }}>
                {stat.readableStatus}
              </span>
              <span>{stat.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800/70 px-2 py-1 rounded">
            <BarChart className="h-3 w-3 text-gray-500" />
            <span className="font-medium">Total:</span>
            <span>{verdictTotals.total}</span>
          </div>
        </div>
      )}

      <div className="min-w-[600px] max-w-[890px] overflow-x-auto custom-scrollbar">
        <div className="flex flex-col">
          <div className="flex gap-[2px]">
            {weeks.map((week, weekIndex) => {
              // Check if this week starts a new month
              const isNewMonth = weekIndex > 0 && !isSameMonth(weeks[weekIndex][0], weeks[weekIndex - 1][0])

              return (
                <div
                  key={weekIndex}
                  className="flex flex-col gap-[2px]"
                  style={{
                    marginLeft: isNewMonth ? `${monthGap}px` : "0px",
                    width: `${weekWidth}px`,
                  }}
                >
                  {week.map((day, dayIndex) => {
                    // Skip rendering for null days
                    if (day === null) {
                      return <div key={dayIndex} className="h-3 w-3" /> // Empty placeholder
                    }
                    
                    const activityLevel = getActivityLevel(day)
                    const isToday = isSameDay(day, today)
                    const isFutureDay = day > today
                    
                    // Color cells based on activity level
                    let cellColor = "bg-gray-200 dark:bg-[#2C2C2C]"
                    if (!isFutureDay && activityLevel > 0) {
                      cellColor = getActivityColor(activityLevel)
                    }

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <motion.div
                              className={`h-3 w-3 rounded-[2px] ${cellColor} ${
                                isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""
                              } hover:opacity-80 transition-opacity`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: isFutureDay ? 0.2 : 1 }}
                        transition={{
                          delay: weekIndex * 0.01 + dayIndex * 0.002,
                          duration: 0.2,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="w-64">
                            {isFutureDay ? (
                              <p className="text-xs">Future date</p>
                            ) : activityLevel === 0 ? (
                              <p className="text-sm">{format(day, "MMMM d, yyyy")} - No submissions</p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm font-medium border-b pb-1">{format(day, "MMMM d, yyyy")}</p>

                                <div className="flex flex-col gap-1.5">
                                  {/* Verdict Summary */}
                                  {getVerdictSummary(day).map((verdict, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: verdict.color }} />
                                      <div className="flex-1 flex justify-between items-center">
                                        <span className="text-xs font-medium">{verdict.readableStatus}</span>
                                        <span className="text-xs">{verdict.count} submissions</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="text-xs text-right text-gray-500">
                                  {activityLevel} total submissions
                                </div>
                          </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              )
            })}
          </div>
            
          <div className="flex mt-2">
            {monthLabels.map((label, i) => {
              // Calculate the width of this month based on number of weeks
              const weeksInMonth = label.endWeek - label.startWeek + 1
              const monthWidth = weeksInMonth * weekWidth + (weeksInMonth - 1) * weekGap

              return (
                <div
                  key={i}
                  className="text-xs text-gray-500 dark:text-gray-400"
                  style={{
                    width: `${monthWidth}px`,
                    marginLeft: i === 0 ? 0 : `${monthGap}px`,
                    textAlign: "center",
                  }}
                >
                  {label.month}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Color Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-0.5 mx-2">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-[#2C2C2C]"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
            </div>
            <span>More</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <span className="mr-4">
              Active days: <strong>{activeDays}</strong> ({activityPercentage}%)
            </span>
            <span className="mr-4">
              Total submissions: <strong>{totalActivities}</strong>
            </span>
            <span>
              Daily average: <strong>{(totalActivities / Math.max(1, activeDays)).toFixed(1)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 
