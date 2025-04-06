"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, eachDayOfInterval, subDays, isSameDay, startOfWeek, addDays } from "date-fns"
import { motion } from "framer-motion"

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

  // Generate dates for the last year (365 days)
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
    if (level === 0) return "bg-primary/5 hover:bg-primary/10"
    if (level === 1) return "bg-primary/20 hover:bg-primary/30"
    if (level === 2) return "bg-primary/35 hover:bg-primary/45"
    if (level === 3) return "bg-primary/50 hover:bg-primary/60"
    if (level === 4) return "bg-primary/65 hover:bg-primary/75"
    return "bg-primary/80 hover:bg-primary/90"
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

  // Get month labels
  const getMonthLabels = () => {
    const months = []
    let currentMonth = null

    for (let i = 0; i < weeks.length; i++) {
      const month = format(weeks[i][0], "MMM")
      if (month !== currentMonth) {
        months.push({
          month,
          index: i,
        })
        currentMonth = month
      }
    }

    return months
  }

  const monthLabels = getMonthLabels()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[750px]">
          <div className="flex mb-1">
            <div className="w-8"></div>
            <div className="flex-1 flex">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground"
                  style={{
                    marginLeft: i === 0 ? 0 : `${(label.index - monthLabels[i - 1].index - 1) * 16}px`,
                    paddingLeft: i === 0 ? 0 : "8px",
                  }}
                >
                  {label.month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            <div className="w-8 flex flex-col justify-around text-xs text-muted-foreground">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
            </div>

            <div className="flex-1 flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
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
                              className={`h-4 w-4 rounded-[3px] ${
                                isFutureDay ? "bg-transparent" : getActivityColor(activityLevel)
                              } ${
                                isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

