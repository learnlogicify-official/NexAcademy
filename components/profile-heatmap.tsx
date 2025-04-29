"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, eachDayOfInterval, subDays, isSameDay, startOfWeek, addDays, isSameMonth } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Info } from "lucide-react"

interface ActivityData {
  date: string
  count: number
  details?: {
    type: string
    title: string
    xp: number
    timestamp: string
  }[]
}

interface ProfileHeatmapProps {
  data: ActivityData[]
}

export function ProfileHeatmap({ data }: ProfileHeatmapProps) {
  const [activityType, setActivityType] = useState("all")

  // Generate dates for the full year (365 days)
  const today = new Date()
  const startDate = subDays(today, 364)

  // Get the start of the week (Sunday) for the startDate
  const firstSunday = startOfWeek(startDate, { weekStartsOn: 0 })

  // Generate all days from the first Sunday to today
  const allDays = eachDayOfInterval({ start: firstSunday, end: today })

  // Group days by week
  const weeks = []
  let currentWeek = []

  for (let i = 0; i < allDays.length; i++) {
    const dayOfWeek = allDays[i].getDay()

    // Start a new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(allDays[i])

    // Push the last week
    if (i === allDays.length - 1) {
      // If the last week is not complete, add empty days
      while (currentWeek.length < 7) {
        currentWeek.push(addDays(allDays[i], currentWeek.length - 6))
      }
      weeks.push(currentWeek)
    }
  }

  // Get activity level for a specific date
  const getActivityLevel = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity) return 0

    // Filter by activity type if needed
    if (activityType !== "all") {
      const filteredDetails = activity.details?.filter((d) => d.type === activityType) || []
      return filteredDetails.length
    }

    return activity.count
  }

  // Get color based on activity level
  const getActivityColor = (level: number) => {
    if (level === 0) return "bg-[#2C2C2C] hover:bg-gray-600"
    if (level === 1) return "bg-green-900 hover:bg-green-800"
    if (level === 2) return "bg-green-700 hover:bg-green-600"
    if (level === 3) return "bg-green-600 hover:bg-green-500"
    return "bg-green-500 hover:bg-green-400"
  }

  // Get activity details for a specific date
  const getActivityDetails = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)

    if (!activity || !activity.details) return []

    if (activityType !== "all") {
      return activity.details.filter((d) => d.type === activityType)
    }

    return activity.details
  }

  // Get month labels with their positions
  const getMonthLabels = () => {
    const months = []
    let currentMonth = null
    let monthStartWeek = 0

    for (let i = 0; i < weeks.length; i++) {
      const month = format(weeks[i][0], "MMM")
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

  return (
    <div className="w-full bg-[#121212] p-4 rounded-lg h-[360px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium text-gray-100">Activity Contributions</h3>
        </div>
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="course">Course Progress</SelectItem>
            <SelectItem value="coding">Coding Sessions</SelectItem>
            <SelectItem value="problem">Problem Solving</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="min-w-[600px] max-w-[890px] overflow-x-auto custom-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3a3a3a #121212",
        }}
      >
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
                    const activityLevel = getActivityLevel(day)
                    const activityDetails = getActivityDetails(day)
                    const isToday = isSameDay(day, today)
                    const isFutureDay = day > today

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`h-3 w-3 rounded-[2px] ${
                                isFutureDay ? "bg-transparent" : getActivityColor(activityLevel)
                              } ${
                                isToday ? "ring-1 ring-green-500 ring-offset-1 ring-offset-background" : ""
                              } transition-colors`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: isFutureDay ? 0.2 : 1 }}
                              transition={{
                                delay: weekIndex * 0.01 + dayIndex * 0.002,
                                duration: 0.2,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                              {isFutureDay ? (
                                <p className="text-xs text-muted-foreground">Future date</p>
                              ) : activityLevel === 0 ? (
                                <p className="text-xs text-muted-foreground">No activity</p>
                              ) : (
                                <>
                                  <p className="text-xs text-muted-foreground">
                                    {activityLevel} {activityLevel === 1 ? "activity" : "activities"}
                                  </p>
                                  {activityDetails.map((detail, i) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-medium">{detail.title}</span>
                                      <span className="ml-1 text-muted-foreground">(+{detail.xp} XP)</span>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
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

              // Calculate the position of this month
              const previousMonthsWeeks = label.startWeek
              const previousMonthsGaps = i // Number of month gaps before this month

              return (
                <div
                  key={i}
                  className="text-xs text-gray-400"
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

      {/* Activity Summary */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#2C2C2C]"></div>
            <span className="text-gray-400">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-900"></div>
            <span className="text-gray-400">1 activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-700"></div>
            <span className="text-gray-400">2 activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-600"></div>
            <span className="text-gray-400">3 activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <span className="text-gray-400">4+ activities</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <div className="text-sm">
            <span className="text-gray-400">Active days: </span>
            <span className="text-gray-200 font-medium">
              {activeDays} ({activityPercentage}%)
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Total activities: </span>
            <span className="text-gray-200 font-medium">{totalActivities}</span>
          </div>
          <div className="text-sm flex items-center gap-1">
            <span className="text-gray-400">Average: </span>
            <span className="text-gray-200 font-medium">{(totalActivities / totalDays).toFixed(1)} per day</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Average activities per day over the last year</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
