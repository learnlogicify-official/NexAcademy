"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"

export interface CalendarData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ActivityCalendarProps {
  data: CalendarData[]
  blockSize?: number
  blockMargin?: number
  blockRadius?: number
  fontSize?: number
  hideMonthLabels?: boolean
  showWeekdayLabels?: boolean
  hideTotalCount?: boolean
  hideColorLegend?: boolean
  weekStart?: 0 | 1 // 0 for Sunday, 1 for Monday
  theme?: {
    light: string[]
    dark: string[]
  }
  year?: number
  monthSpacing?: number // Spacing between months in pixels
}

export function ActivityCalendar({
  data,
  blockSize = 12,
  blockMargin = 4,
  blockRadius = 2,
  fontSize = 12,
  hideMonthLabels = false,
  showWeekdayLabels = true,
  hideTotalCount = false,
  hideColorLegend = false,
  weekStart = 0,
  theme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  },
  year = new Date().getFullYear(),
  monthSpacing = 10, // Default spacing between months
}: ActivityCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const isDarkMode = document.documentElement.classList.contains("dark")

  // Create a date map for quick lookups
  const dateMap = new Map<string, CalendarData>()
  data.forEach((item) => {
    dateMap.set(item.date, item)
  })

  // Calculate the first and last day to show
  const firstDay = new Date(year, 0, 1)
  const lastDay = new Date(year, 11, 31)

  // Adjust to start from the first day of the week
  const calendarStart = startOfWeek(firstDay, { weekStartsOn: weekStart as 0 | 1 })

  // Generate the calendar grid with month information
  const calendarData: {
    date: Date
    isFirstDayOfMonth: boolean
    monthIndex: number
    month: string
  }[] = []

  let currentDate = calendarStart
  while (currentDate <= lastDay) {
    calendarData.push({
      date: new Date(currentDate),
      isFirstDayOfMonth: currentDate.getDate() === 1,
      monthIndex: currentDate.getMonth(),
      month: format(currentDate, "MMM"),
    })
    currentDate = addDays(currentDate, 1)
  }

  // Group by weeks
  const weeks: (typeof calendarData)[] = []
  let currentWeek: typeof calendarData = []

  calendarData.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
    currentWeek.push(day)
  })

  // Add the last week if it has any days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const lastDay = currentWeek[currentWeek.length - 1]
      currentWeek.push({
        date: addDays(lastDay.date, 1),
        isFirstDayOfMonth: false,
        monthIndex: lastDay.monthIndex,
        month: lastDay.month,
      })
    }
    weeks.push(currentWeek)
  }

  // Get color for a level
  const getColorForLevel = (level: number) => {
    const colors = isDarkMode ? theme.dark : theme.light
    return colors[level] || colors[0]
  }

  // Find weeks that start a new month
  const monthStartWeeks: number[] = []
  weeks.forEach((week, weekIndex) => {
    // Check if this week contains the first day of a month
    const containsFirstDayOfMonth = week.some((day) => day.isFirstDayOfMonth)
    if (containsFirstDayOfMonth) {
      monthStartWeeks.push(weekIndex)
    }
  })

  // Get month labels with consistent spacing
  const getMonthLabels = () => {
    // First, identify all months present in the calendar
    const monthsPresent: number[] = []
    for (let i = 0; i < 12; i++) {
      // Check if this month is in our date range
      const monthStart = new Date(year, i, 1)
      const monthEnd = new Date(year, i + 1, 0)

      if (monthStart <= lastDay && monthEnd >= calendarStart) {
        monthsPresent.push(i)
      }
    }

    // Calculate the total width available for the calendar
    const totalWeeks = weeks.length
    const totalWidth = totalWeeks * (blockSize + blockMargin)

    // Calculate the width available for each month (equal distribution)
    const monthWidth = totalWidth / monthsPresent.length

    // Create evenly spaced month labels
    const labels: { name: string; position: number }[] = []

    monthsPresent.forEach((monthIndex, i) => {
      const monthName = new Date(year, monthIndex, 1).toLocaleString("default", { month: "short" })

      // Position each month label at a consistent interval
      // Add a significant right offset to move labels far to the right within each month section
      const rightOffset = monthWidth * 0.7 // Position at 70% into each month section (much further right)

      labels.push({
        name: monthName,
        position: i * monthWidth + rightOffset,
      })
    })

    return labels
  }

  const monthLabels = getMonthLabels()

  // Get weekday labels
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  if (weekStart === 1) {
    // Reorder for Monday start
    weekdayLabels.push(weekdayLabels.shift()!)
  }

  // Calculate total contributions
  const totalCount = data.reduce((sum, day) => sum + day.count, 0)
  const activeDays = data.filter((day) => day.count > 0).length

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        {!hideMonthLabels && (
          <div className="flex text-xs text-gray-500 dark:text-gray-400 mb-1 pl-10 relative h-4">
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${month.position}px`,
                }}
              >
                {month.name}
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          {/* Weekday labels */}
          {showWeekdayLabels && (
            <div
              className="flex flex-col justify-around text-xs text-gray-500 dark:text-gray-400 pr-2"
              style={{ fontSize: `${fontSize}px`, width: "30px" }}
            >
              {weekdayLabels.map((day, i) => (
                <div key={i} style={{ height: `${blockSize}px` }}>
                  {i % 2 === 0 ? day[0] : ""}
                </div>
              ))}
            </div>
          )}

          {/* Calendar grid */}
          <div className="relative">
            <div
              className="grid gap-y-[4px]"
              style={{
                gridTemplateRows: `repeat(7, ${blockSize}px)`,
                gap: `${blockMargin}px`,
              }}
            >
              {/* Render by row (day of week) */}
              {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                <div key={dayOfWeek} className="flex">
                  {weeks.map((week, weekIndex) => {
                    const day = week[dayOfWeek]
                    if (!day) return null

                    const dateStr = format(day.date, "yyyy-MM-dd")
                    const dataForDay = dateMap.get(dateStr)
                    const level = dataForDay?.level || 0
                    const count = dataForDay?.count || 0
                    const isToday = isSameDay(day.date, new Date())

                    // Check if this week starts a new month (except the first week)
                    const isMonthStart = monthStartWeeks.includes(weekIndex) && weekIndex > 0

                    return (
                      <div
                        key={`${weekIndex}-${dayOfWeek}`}
                        style={{
                          marginLeft: isMonthStart ? `${monthSpacing}px` : `${blockMargin}px`,
                          marginRight: 0,
                        }}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`${isToday ? "ring-1 ring-primary" : ""} hover:ring-1 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all duration-200 hover:scale-110`}
                                style={{
                                  width: `${blockSize}px`,
                                  height: `${blockSize}px`,
                                  backgroundColor: getColorForLevel(level),
                                  borderRadius: `${blockRadius}px`,
                                }}
                                onMouseEnter={() => setHoveredDate(dateStr)}
                                onMouseLeave={() => setHoveredDate(null)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{format(day.date, "EEEE, MMMM d, yyyy")}</div>
                                <div>
                                  {count} {count === 1 ? "contribution" : "contributions"}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center mt-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
          {!hideColorLegend && (
            <div className="flex items-center">
              <span>Less</span>
              <div className="flex mx-1 gap-[2px]">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      width: `${blockSize - 2}px`,
                      height: `${blockSize - 2}px`,
                      backgroundColor: getColorForLevel(level),
                      borderRadius: `${blockRadius}px`,
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          )}

          {!hideTotalCount && (
            <div className="text-xs">
              <span className="mr-4">
                {totalCount} contributions in {year}
              </span>
              <span>
                {activeDays} active {activeDays === 1 ? "day" : "days"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
