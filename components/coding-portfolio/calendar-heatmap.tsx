"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, isSameDay, isSameMonth, differenceInDays } from "date-fns"

interface ActivityPoint {
  date: string;
  count: number;
  platform?: string; // Optional platform identifier
}

interface CalendarHeatmapProps {
  data: ActivityPoint[];
  colorScheme?: 'green' | 'blue' | 'purple' | 'amber'; // Color scheme options
}

export function CalendarHeatmap({ data, colorScheme = 'green' }: CalendarHeatmapProps) {
  const [weeks, setWeeks] = useState<(Date | null)[][]>([])
  const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map())
  const [platformMap, setPlatformMap] = useState<Map<string, string>>(new Map())
  const [maxCount, setMaxCount] = useState(0)
  
  // Generate calendar data structure
  useEffect(() => {
    if (!data || data.length === 0) return
    
    // Create a map of date to count
    const map = new Map<string, number>()
    const platformsMap = new Map<string, string>()
    let max = 0
    
    data.forEach(point => {
      // Format to YYYY-MM-DD if not already
      let dateStr = point.date;
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      
      const currentCount = map.get(dateStr) || 0
      const newCount = currentCount + point.count
      map.set(dateStr, newCount)
      
      // Save platform info if available
      if (point.platform) {
        platformsMap.set(dateStr, point.platform)
      }
      
      // Track max count for color intensity
      if (newCount > max) max = newCount
    })
    
    setActivityMap(map)
    setPlatformMap(platformsMap)
    setMaxCount(max > 0 ? max : 1)
    
    // Generate weeks for the last 16 weeks (112 days)
    const today = new Date()
    const daysAgo = new Date()
    daysAgo.setDate(today.getDate() - 111) // Go back approximately 16 weeks
    
    // Start from Sunday of the week containing daysAgo
    const startDate = new Date(daysAgo)
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Move to Sunday
    
    // Generate weeks
    const weeksArray: (Date | null)[][] = []
    let currentWeek: (Date | null)[] = []
    
    // Fill in any missing days at the beginning to align with days of week
    for (let i = 0; i < startDate.getDay(); i++) {
      currentWeek.push(null) // Null represents an empty cell
    }
    
    // Generate the grid day by day until we reach today
    const currentDate = new Date(startDate)
    while (differenceInDays(currentDate, today) <= 0) {
      const dayOfWeek = currentDate.getDay()
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
      
      currentWeek.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Add the last week if it's not empty
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek)
    }
    
    setWeeks(weeksArray)
  }, [data])
  
  // Get activity level for a specific date (0-4)
  const getActivityLevel = (date: Date): number => {
    const dateString = format(date, "yyyy-MM-dd")
    const count = activityMap.get(dateString) || 0
    
    if (count === 0) return 0
    
    // Determine level based on percentage of max
    const percentage = count / maxCount
    if (percentage <= 0.25) return 1
    if (percentage <= 0.5) return 2
    if (percentage <= 0.75) return 3
    return 4
  }
  
  // Get color based on activity level
  const getActivityColor = (level: number): string => {
    const schemeBase = colorScheme === 'blue' ? 'blue' : 
                      colorScheme === 'purple' ? 'indigo' : 
                      colorScheme === 'amber' ? 'amber' : 'green';
    
    if (level === 0) return "bg-slate-200 dark:bg-slate-700/50"
    if (level === 1) return `bg-${schemeBase}-200 dark:bg-${schemeBase}-900/70`
    if (level === 2) return `bg-${schemeBase}-300 dark:bg-${schemeBase}-800/70`
    if (level === 3) return `bg-${schemeBase}-400 dark:bg-${schemeBase}-700/70`
    return `bg-${schemeBase}-500 dark:bg-${schemeBase}-600/70`
  }
  
  // Get safe CSS classname for activity level
  const getSafeActivityColor = (level: number): string => {
    switch(colorScheme) {
      case 'blue':
        if (level === 0) return "bg-slate-200 dark:bg-slate-700/50"
        if (level === 1) return "bg-blue-200 dark:bg-blue-900/70"
        if (level === 2) return "bg-blue-300 dark:bg-blue-800/70"
        if (level === 3) return "bg-blue-400 dark:bg-blue-700/70"
        return "bg-blue-500 dark:bg-blue-600/70"
      case 'purple':
        if (level === 0) return "bg-slate-200 dark:bg-slate-700/50"
        if (level === 1) return "bg-indigo-200 dark:bg-indigo-900/70"
        if (level === 2) return "bg-indigo-300 dark:bg-indigo-800/70"
        if (level === 3) return "bg-indigo-400 dark:bg-indigo-700/70"
        return "bg-indigo-500 dark:bg-indigo-600/70"
      case 'amber':
        if (level === 0) return "bg-slate-200 dark:bg-slate-700/50"
        if (level === 1) return "bg-amber-200 dark:bg-amber-900/70"
        if (level === 2) return "bg-amber-300 dark:bg-amber-800/70"
        if (level === 3) return "bg-amber-400 dark:bg-amber-700/70"
        return "bg-amber-500 dark:bg-amber-600/70"
      default: // Green
        if (level === 0) return "bg-slate-200 dark:bg-slate-700/50"
        if (level === 1) return "bg-green-200 dark:bg-green-900/70"
        if (level === 2) return "bg-green-300 dark:bg-green-800/70"
        if (level === 3) return "bg-green-400 dark:bg-green-700/70"
        return "bg-green-500 dark:bg-green-600/70"
    }
  }
  
  // Get month labels with their positions
  const getMonthLabels = () => {
    const months: { month: string; startWeek: number; endWeek: number }[] = []
    let currentMonth: string | null = null
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
  
  // Calculate activity stats
  const totalDays = activityMap.size
  const totalActivities = Array.from(activityMap.values()).reduce((sum, count) => sum + count, 0)
  
  const today = new Date()
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
        
      <div className="overflow-x-auto pr-2 scrollbar-hide">
        <div className="flex flex-col min-w-[650px]">
          <div className="flex gap-[2px]">
            {weeks.map((week, weekIndex) => {
              // Check if this week starts a new month
              const isNewMonth = weekIndex > 0 && 
                weeks[weekIndex][0] && 
                weeks[weekIndex-1][0] && 
                !isSameMonth(weeks[weekIndex][0] as Date, weeks[weekIndex-1][0] as Date)

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
                    let cellColor = getSafeActivityColor(activityLevel);
                    
                    // Format date for tooltip
                    const formattedDate = format(day, "MMM d, yyyy");
                    const count = activityMap.get(format(day, "yyyy-MM-dd")) || 0;

                    return (
                      <motion.div
                        key={dayIndex}
                        className={`h-3 w-3 rounded-[2px] ${cellColor} relative group/cell cursor-pointer
                          ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: isFutureDay ? 0.2 : 1 }}
                        whileHover={{ scale: 1.5, zIndex: 10 }}
                        transition={{
                          delay: weekIndex * 0.01 + dayIndex * 0.002,
                          duration: 0.2,
                          whileHover: { type: "spring", stiffness: 300, damping: 10 }
                        }}
                        title={`${formattedDate}: ${count} submissions`}
                      >
                        {/* Enhanced tooltip */}
                        <motion.div 
                          className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded invisible 
                            group-hover/cell:visible opacity-0 group-hover/cell:opacity-100 min-w-[100px] z-20 pointer-events-none shadow-lg"
                          initial={{ opacity: 0, y: 5 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          <div className="font-semibold">{formattedDate}</div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span>Submissions:</span>
                            <span className={count > 0 ? "text-green-400" : "text-slate-400"}>
                              {count}
                            </span>
                          </div>
                          {/* Arrow */}
                          <div className="absolute left-1/2 bottom-0 -mb-1 w-2 h-2 bg-slate-800 transform rotate-45 -translate-x-1/2"></div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              );
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
                  className="text-xs text-slate-500 dark:text-slate-400"
                  style={{
                    width: `${monthWidth}px`,
                    marginLeft: i === 0 ? 0 : `${monthGap}px`,
                    textAlign: "center",
                  }}
                >
                  {label.month}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Color Legend and Stats */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
        <div className="flex items-center">
          <span className="text-slate-500 dark:text-slate-400 mr-2">Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700/50"></div>
            {colorScheme === 'green' && (
              <>
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/70"></div>
                <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/70"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/70"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600/70"></div>
              </>
            )}
            {colorScheme === 'blue' && (
              <>
                <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/70"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-800/70"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700/70"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-600/70"></div>
              </>
            )}
            {colorScheme === 'purple' && (
              <>
                <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-900/70"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-300 dark:bg-indigo-800/70"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-400 dark:bg-indigo-700/70"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-600/70"></div>
              </>
            )}
            {colorScheme === 'amber' && (
              <>
                <div className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/70"></div>
                <div className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800/70"></div>
                <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700/70"></div>
                <div className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-600/70"></div>
              </>
            )}
          </div>
          <span className="text-slate-500 dark:text-slate-400 ml-2">More</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <span className="mr-4">Days: <strong>{totalDays}</strong></span>
          <span>Activities: <strong>{totalActivities}</strong></span>
        </div>
      </div>
    </div>
  )
} 