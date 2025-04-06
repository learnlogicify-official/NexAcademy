"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Code } from "lucide-react"
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns"
import { motion } from "framer-motion"

interface ActivityData {
  date: string
  count: number
  details?: {
    type: string
    title: string
    xp: number
  }[]
}

interface ActivityHeatmapProps {
  data: ActivityData[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [activityType, setActivityType] = useState("all")

  // Generate dates for the last 16 weeks (112 days)
  const today = new Date()
  const startDate = subDays(today, 111)

  const dateRange = eachDayOfInterval({ start: startDate, end: today })

  // Group dates by week and day
  const weeks = []
  let currentWeek = []

  for (let i = 0; i < dateRange.length; i++) {
    const dayOfWeek = dateRange[i].getDay()

    // Start a new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(dateRange[i])

    // Push the last week
    if (i === dateRange.length - 1) {
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
    if (level === 0) return "bg-muted hover:bg-muted/80"
    if (level <= 2) return "bg-primary/20 hover:bg-primary/30"
    if (level <= 4) return "bg-primary/40 hover:bg-primary/50"
    if (level <= 6) return "bg-primary/60 hover:bg-primary/70"
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Activity Heatmap
        </CardTitle>
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="course">Course Progress</SelectItem>
            <SelectItem value="coding">Coding Sessions</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="h-3 w-3 rounded-[3px] bg-muted"></div>
                  <div className="h-3 w-3 rounded-[3px] bg-primary/20"></div>
                  <div className="h-3 w-3 rounded-[3px] bg-primary/40"></div>
                  <div className="h-3 w-3 rounded-[3px] bg-primary/60"></div>
                  <div className="h-3 w-3 rounded-[3px] bg-primary/80"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-flow-col gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-flow-row gap-1">
                  {week.map((day, dayIndex) => {
                    const activityLevel = getActivityLevel(day)
                    const activityDetails = getActivityDetails(day)
                    const isToday = isSameDay(day, today)

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`h-3 w-3 rounded-[3px] ${getActivityColor(activityLevel)} ${
                                isToday ? "ring-1 ring-primary ring-offset-1" : ""
                              }`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: weekIndex * 0.01 + dayIndex * 0.01 }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                              {activityLevel === 0 ? (
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span>{data.reduce((sum, day) => sum + day.count, 0)} activities in the last 16 weeks</span>
            </div>
            <div className="text-muted-foreground">{data.filter((d) => d.count > 0).length} active days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

