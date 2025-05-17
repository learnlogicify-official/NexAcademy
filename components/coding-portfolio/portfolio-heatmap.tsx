"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, subDays, isSameDay, addDays, isSameMonth } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Filter, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Interfaces
export interface ActivityData {
  date: string
  count: number
}

export interface PortfolioHeatmapProps {
  data: ActivityData[]
  weeklyTrend?: number
  statsCardWeeklyTrend?: number
}

export function PortfolioHeatmap({ data, weeklyTrend, statsCardWeeklyTrend }: PortfolioHeatmapProps) {
  const [timeRange, setTimeRange] = useState<"month" | "quarter">("quarter")

  // Generate calendar grid properly
  const today = new Date()
  const startDate = subDays(today, 364) // Go back ~1 year
  
  // Find the first Sunday before or on our start date - this is our actual grid start
  let gridStartDate = startDate
  while (gridStartDate.getDay() !== 0) { // 0 = Sunday
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
    if (week.some(d => d !== null)) {
      calendarGrid.push(week)
    }
  }
  
  // Use calendarGrid instead of weeks
  const weeks = calendarGrid

  // Get activity level for a specific date
  const getActivityLevel = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const activity = data.find((d) => d.date === dateString)
    // Support both 'count' and 'value' keys (for CodeChef apiHeatMap)
    if (!activity) return 0;
    if (typeof activity.count === 'number') return activity.count;
    if (typeof (activity as any).value === 'number') return (activity as any).value;
    return 0;
  }

  // Get color based on activity level
  const getActivityColor = (level: number) => {
    if (level === 0) return "bg-gray-200 dark:bg-[#2C2C2C]"
    if (level === 1) return "bg-blue-200 dark:bg-blue-900"
    if (level === 2) return "bg-blue-400 dark:bg-blue-700"
    if (level === 3) return "bg-blue-500 dark:bg-blue-600"
    return "bg-blue-600 dark:bg-blue-500"
  }

  // Get month labels with their positions
  const getMonthLabels = () => {
    const months = []
    let currentMonth = null
    let monthStartWeek = 0

    for (let i = 0; i < weeks.length; i++) {
      // Get the first non-null date in this week
      const firstValidDate = weeks[i].find(d => d !== null)
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

  // Filter data according to time range
  const filterDataByTimeRange = () => {
    const filteredData = [...data];
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
      default:
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    return filteredData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate && itemDate <= now;
    });
  }

  // Calculate activity stats
  const filteredData = filterDataByTimeRange()
  
  // Count unique active days (using Set to get unique dates)
  const activeDates = new Set(filteredData.filter(day => day.count > 0).map(day => day.date))
  const activeDays = activeDates.size
  
  // Sum all counts for total activities
  const totalActivities = filteredData.reduce((sum, day) => sum + day.count, 0)
  
  const activityPercentage = Math.round((activeDays / Math.max(filteredData.length, 1)) * 100)

  // Calculate total submissions from all data (sum of all counts)
  const totalSubmissions = data.reduce((sum, day) => {
    if (typeof day.count === 'number') return sum + day.count;
    if (typeof (day as any).value === 'number') return sum + (day as any).value;
    return sum;
  }, 0)

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Coding Activity</h3>
        </div>
       
      </div>

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
                      return <div key={dayIndex} className="h-3 w-3" />; // Empty placeholder
                    }
                    
                    const activityLevel = getActivityLevel(day)
                    const isToday = isSameDay(day, today)
                    const isFutureDay = day > today
                    
                    // Color cells based on activity level
                    let cellColor = "bg-gray-200 dark:bg-[#2C2C2C]";
                    if (!isFutureDay && activityLevel > 0) {
                      cellColor = getActivityColor(activityLevel);
                    }

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`h-3 w-3 rounded-[2px] ${cellColor} ${
                                isToday ? "ring-1 ring-blue-500 ring-offset-1 ring-offset-background" : ""
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
                                <div className="text-sm">{activityLevel} submissions</div>
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
              <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-600"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
            </div>
            <span>More</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <span>Total submissions: <strong>{totalSubmissions}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
} 