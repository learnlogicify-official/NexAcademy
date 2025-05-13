"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Flame, X, Calendar, Award, Star } from "lucide-react"
import { getStreakCalendarData } from "@/app/actions/streak-actions"
import { cn } from "@/lib/utils"

// Type definitions
interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentStreak: number
  highestStreak: number
  sampleActiveDays?: boolean[] // Add sample active days prop
}

// Helper function to generate the current week's days
const getCurrentWeekDays = () => {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the date of the Sunday that starts this week
  const startOfWeekDate = new Date(today)
  startOfWeekDate.setDate(today.getDate() - currentDay)
  
  // Generate an array of dates for the entire week (Sun to Sat)
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeekDate)
    date.setDate(startOfWeekDate.getDate() + i)
    weekDays.push(date)
  }
  
  return weekDays
}

// Format day name abbreviation
const formatDayName = (date: Date): string => {
  const days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
  return days[date.getDay()]
}

export function StreakModal({
  isOpen,
  onClose,
  userId,
  currentStreak,
  highestStreak,
  sampleActiveDays
}: StreakModalProps) {
  const [weekDays, setWeekDays] = useState<Date[]>(getCurrentWeekDays())
  const [activeWeekDays, setActiveWeekDays] = useState<boolean[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  
  // Add some debug logging
  console.log('[StreakModal] Rendering with props:', {
    isOpen,
    userId,
    currentStreak,
    highestStreak,
    hasSampleDays: !!sampleActiveDays,
    weekDays: weekDays.map(d => d.toDateString())
  });
  
  // Initialize weekDays and activeWeekDays when modal first opens
  useEffect(() => {
    if (isOpen && !hasAttemptedFetch) {
      console.log('[StreakModal] Modal opened, initializing week days and checking streak:', currentStreak);
      
      // Generate days for this week
      const currentWeekDays = getCurrentWeekDays()
      setWeekDays(currentWeekDays)
      
      // Initialize all days as inactive
      setActiveWeekDays(Array(7).fill(false))
    }
  }, [isOpen, hasAttemptedFetch, currentStreak]);
  
  // Use sample active days if provided
  useEffect(() => {
    if (sampleActiveDays) {
      // If sample data is provided, use it directly
      const currentWeekDays = getCurrentWeekDays()
      setWeekDays(currentWeekDays)
      setActiveWeekDays(sampleActiveDays)
      setIsLoading(false)
      setHasAttemptedFetch(true)
    } else if (currentStreak > 0 && weekDays.length > 0) {
      // If we have a current streak but no sample data, generate sample active days
      // based on the current streak value
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Generate active days based on streak (today and previous days)
      const generatedActiveDays = weekDays.map(day => {
        const checkDay = new Date(day)
        checkDay.setHours(0, 0, 0, 0)
        
        // Check if this day is within the streak
        const diffTime = today.getTime() - checkDay.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        return diffDays >= 0 && diffDays < currentStreak
      })
      
      console.log('[StreakModal] Generated active days based on streak:', generatedActiveDays, 'currentStreak:', currentStreak)
      setActiveWeekDays(generatedActiveDays)
    }
  }, [sampleActiveDays, currentStreak, weekDays])
  
  // Load user's streak calendar data
  const fetchStreakData = useCallback(async () => {
    // Skip if we have sample data or already attempted fetch
    if (sampleActiveDays || !isOpen || hasAttemptedFetch) return
    
    setIsLoading(true)
    try {
      // Get the current date
      const now = new Date()
      const month = now.getMonth() + 1 // 1-12
      const year = now.getFullYear()
      
      // Get all days of current week
      const currentWeekDays = getCurrentWeekDays()
      setWeekDays(currentWeekDays)
      
      // Fetch user's streak calendar for current month using server action
      const calendar = await getStreakCalendarData(month, year)
      
      // Calculate which days should be active based on the current streak
      // This should only include days that are actually part of the streak
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalize to start of day
      
      // If currentStreak is 1, only today should be active
      // If currentStreak is 2, today and yesterday should be active, etc.
      const activeDays = currentWeekDays.map(day => {
        // Normalize to start of day for comparison
        const checkDay = new Date(day)
        checkDay.setHours(0, 0, 0, 0)
        
        // Check if this day is within the current streak
        // Calculate the difference in days from today
        const diffTime = today.getTime() - checkDay.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        // A day is part of the streak if:
        // 1. It's today (diffDays = 0)
        // 2. It's within the streak count days back from today
        // 3. The user had activity on that day (check calendar)
        const isWithinStreakRange = diffDays >= 0 && diffDays < currentStreak
        const dayNum = checkDay.getDate()
        const dayMonth = checkDay.getMonth() + 1
        const hasActivityOnDay = dayMonth === month && calendar?.days?.[dayNum]?.hasActivity
        
        // Only mark as active if the day is within streak range and has activity
        return isWithinStreakRange && hasActivityOnDay
      })
      
      setActiveWeekDays(activeDays)
    } catch (error) {
      console.error("Error fetching streak data:", error)
      // Initialize with empty data
      setActiveWeekDays(Array(7).fill(false))
    } finally {
      setIsLoading(false)
      setHasAttemptedFetch(true)
    }
  }, [isOpen, hasAttemptedFetch, sampleActiveDays, currentStreak])
  
  useEffect(() => {
    if (isOpen && !sampleActiveDays) {
      fetchStreakData()
    } else if (!isOpen) {
      // Reset the fetch attempt flag when modal is closed
      setHasAttemptedFetch(false)
    }
  }, [isOpen, fetchStreakData, sampleActiveDays])
  
  // Format today's date for title
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('[StreakModal] Dialog open state changing to:', open);
        if (!open) onClose();
      }}
      data-dialog-name="streak-modal"
    >
      <DialogContent 
        className="max-w-md sm:max-w-lg rounded-xl border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-200 p-0 overflow-hidden transition-all duration-300 ease-in-out animate-fadeIn"
        data-dialog-content="streak-modal" 
      >
        <DialogTitle className="sr-only">Daily Streak Information</DialogTitle>
        
        {/* Explicit close button that calls onClose directly */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 bg-slate-200/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-300/50 dark:border-slate-700/50 shadow-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors" />
        </button>
        
        {/* Also add a text close button at the bottom for better UX */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm transition-all duration-200 border border-slate-200 dark:border-slate-700"
          >
            Close
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl animate-slow-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-indigo-300/10 blur-xl animate-slow-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <div className="p-6 pt-10 pb-6 text-center border-b border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400 animate-slow-pulse" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient-slow">Daily Streak Achievement</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Keep your momentum going!</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Streak counter */}
            <div className="flex flex-col items-center justify-center px-6 py-8 border-b md:border-b-0 md:border-r border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-slate-900/50">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 shadow-[0_0_25px_rgba(99,102,241,0.2)] relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                  <Flame className="h-14 w-14 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <Star className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> 
                <span>Best streak: <span className="text-slate-700 dark:text-slate-300 font-medium">{highestStreak} days</span></span>
              </div>
            </div>
            
            {/* Right side - Weekly view */}
            <div className="px-6 py-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900">
              <div className="flex items-center gap-2 mb-5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Week</h3>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-indigo-100/80 dark:border-indigo-900/30 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="flex justify-between mb-4">
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-center animate-fadeIn"
                      style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                    >
                      {formatDayName(day)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    const isActive = activeWeekDays[index]
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 animate-fadeIn",
                          isToday && "ring-2 ring-indigo-400/50 dark:ring-indigo-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900",
                          isActive 
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                            : "bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                        )}
                        style={{ animationDelay: `${0.7 + index * 0.05}s` }}
                      >
                        {isActive && (
                          <Check className="h-5 w-5 text-white stroke-[3] animate-fadeIn" style={{ animationDelay: `${0.9 + index * 0.05}s` }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-5 pb-5 border-t border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-b from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/80">
            <div className="text-center animate-fadeIn" style={{ animationDelay: '1s' }}>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Come back tomorrow to maintain your streak!
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Solve one problem daily to grow your streak
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 