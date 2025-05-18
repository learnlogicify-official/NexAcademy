"use client"

import { Code, Trophy, Calendar, Flame, CheckCircle2, Star, Zap, BarChart3, Award, Medal } from "lucide-react"
import { PlatformData } from "@/lib/platform-service"

interface StatsCardsProps {
  totalSolved?: number
  totalSubmissions?: number
  streak?: number
  maxStreak?: number
  totalContests?: number
  activeDays?: number
  platforms?: PlatformData[]
}

export function StatsCards({ 
  totalSolved = 632,
  totalSubmissions,
  streak = 7, 
  maxStreak = 14, 
  totalContests = 0, 
  activeDays = 147,
  platforms = [],
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0
}: StatsCardsProps & { easyCount?: number, mediumCount?: number, hardCount?: number }) {
  // Use totalSubmissions if provided, otherwise fall back to totalSolved
  const displayCount = totalSubmissions || totalSolved;
  
  // Calculate daily average based on heatmap data date range
  const calculateDailyAverage = () => {
    // Default value if we can't calculate
    let dailyAvg = (displayCount / (activeDays || 1)).toFixed(1);
    
    // Extract all dates from all platforms' heatmap data
    const allDates: string[] = [];
    platforms.forEach(platform => {
      const data: any = platform.rawData || {};
      const heatmapArr = data.activityHeatmap || data.heatmap || data.apiheatmap || [];
      
      if (Array.isArray(heatmapArr)) {
        heatmapArr.forEach((item: any) => {
          let date: string | null = null;
          
          if (item.date) {
            date = item.date;
          } else if (item.day) {
            date = item.day;
          } else if (item.timestamp) {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
              date = d.toISOString().split('T')[0];
            }
          }
          
          if (date) {
            allDates.push(date);
          }
        });
      }
    });
    
    // If we have dates, find the earliest and latest
    if (allDates.length > 0) {
      // Sort dates chronologically
      allDates.sort();
      
      // Get the earliest and latest dates
      const earliestDate = new Date(allDates[0]);
      const latestDate = new Date(allDates[allDates.length - 1]);
      
      // Calculate the total number of days in the range
      const totalDays = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calculate problems per day
      if (totalDays > 0) {
        dailyAvg = (displayCount / totalDays).toFixed(1);
      }
    }
    
    return dailyAvg;
  };
  
  const dailyAverage = calculateDailyAverage();
  
  // --- Weekly trend calculation (total submissions week-over-week) ---
  function calculateWeeklyTrend() {
    // Merge all heatmap data from all connected platforms
    const allHeatmap: Array<{ date: string, count: number }> = [];
    platforms.forEach(platform => {
      const data: any = platform.rawData || {};
      const heatmapArr = data.activityHeatmap || data.heatmap || data.apiheatmap || [];
      if (Array.isArray(heatmapArr)) {
        heatmapArr.forEach((item: any) => {
          let date: string | null = null;
          let count: number | null = null;
          if (item.date && (item.count !== undefined)) {
            date = item.date;
            count = item.count;
          } else if (item.day && (item.submissions !== undefined)) {
            date = item.day;
            count = item.submissions;
          } else if (item.timestamp) {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
              date = d.toISOString().split('T')[0];
              count = item.count || 1;
            }
          }
          if (date && count !== null) {
            allHeatmap.push({ date, count });
          }
        });
      }
    });
    // Build a map of date => count (sum across platforms)
    const dateMap = new Map<string, number>();
    allHeatmap.forEach(({ date, count }) => {
      dateMap.set(date, (dateMap.get(date) || 0) + count);
    });
    // Get today
    const today = new Date();
    // Helper to format date as YYYY-MM-DD
    const format = (d: Date) => d.toISOString().split('T')[0];
    // Get last 7 days and previous 7 days
    let currentWeek = 0;
    let previousWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      currentWeek += dateMap.get(format(d)) || 0;
    }
    for (let i = 7; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      previousWeek += dateMap.get(format(d)) || 0;
    }
    // Calculate trend percentage
    if (previousWeek === 0 && currentWeek === 0) return 0;
    if (previousWeek === 0) return 100;
    return Math.round(((currentWeek - previousWeek) / Math.max(1, previousWeek)) * 100);
  }

  const weeklyTrend = calculateWeeklyTrend();
  
  // Difficulty breakdown for progress bar
  const easy = easyCount || 0;
  const medium = mediumCount || 0;
  const hard = hardCount || 0;
  const total = easy + medium + hard;
  const easyPct = total > 0 ? (easy / total) * 100 : 0;
  const mediumPct = total > 0 ? (medium / total) * 100 : 0;
  const hardPct = total > 0 ? (hard / total) * 100 : 0;
  
  // For Active Days card
  const problemsPerDay = activeDays > 0 ? (displayCount / activeDays).toFixed(1) : '0';
  const consistentPct = Math.round((activeDays / 365) * 100);
  
  // Calculate platform-wise contest counts for the contests card
  const platformContestCounts: Record<string, number> = {};
  let topPlatforms: {id: string, name: string, count: number, color: string, percentage?: number}[] = [];
  
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      const data: any = platform.rawData || {};
      let count = 0;
      
      if (platform.id === 'hackerrank') {
        if (Array.isArray(data.ratingHistory)) {
          data.ratingHistory.forEach((entry: any) => {
            if (Array.isArray(entry.events)) {
              count += entry.events.length;
            }
          });
        }
      } else if (platform.id === 'hackerearth') {
        if (Array.isArray(data.ratingHistory)) {
          count += data.ratingHistory.length;
        }
      } else {
        if (Array.isArray(data.contests)) {
          count += data.contests.length;
        } else if (Array.isArray(data.contestHistory)) {
          count += data.contestHistory.length;
        } else if (typeof data.contests === 'number') {
          count += data.contests;
        }
      }
      
      if (count > 0) {
        platformContestCounts[platform.id] = count;
        topPlatforms.push({
          id: platform.id,
          name: platform.name,
          count,
          color: platform.color || '#f59e0b'
        });
      }
    });
  
  // Sort platforms by contest count (descending)
  topPlatforms = topPlatforms
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Get top 3 platforms
  
  // Calculate percentages for the top platforms
  topPlatforms.forEach(platform => {
    platform['percentage'] = totalContests > 0 ? (platform.count / totalContests) * 100 : 0;
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Problems Solved Card - Blue (Knowledge) */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-4 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-blue-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-semibold text-blue-50 uppercase tracking-wide">Problems</div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-400 text-white shadow-lg shadow-blue-700/50">
              <Code className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline">
            <div className="text-3xl font-bold text-white">{displayCount}</div>
            <div className="ml-2 text-xs text-blue-100 font-medium">solved</div>
          </div>

          {/* Mini visualization */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-col items-center w-1/3">
              <div className="w-8 h-8 bg-blue-200/30 rounded-full flex items-center justify-center mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-100" />
              </div>
              <div className="text-[10px] text-center text-blue-100">Daily Avg</div>
              <div className="text-xs font-medium text-white">{dailyAverage}</div>
              {/* Weekly trend percentage */}
              
            </div>
            
            <div className="w-px h-10 bg-blue-400/30"></div>
            
            <div className="flex flex-col items-center w-2/3">
              {/* Stacked progress bar for difficulty */}
              <div className="w-full h-2 rounded-full mb-1 flex overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: `${easyPct}%` }}></div>
                <div className="h-full bg-yellow-400" style={{ width: `${mediumPct}%` }}></div>
                <div className="h-full bg-red-400" style={{ width: `${hardPct}%` }}></div>
              </div>
              <div className="flex justify-between w-full text-[10px] text-blue-100">
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Active Days Card - Green (Growth) */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-emerald-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-semibold text-emerald-50 uppercase tracking-wide">Active Days</div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400 text-white shadow-lg shadow-emerald-700/50">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline">
            <div className="text-3xl font-bold text-white">{activeDays}</div>
            <div className="ml-2 text-xs text-emerald-100 font-medium">days</div>
          </div>

          {/* Mini calendar visualization - improved */}
          <div className="mt-4 grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, weekday) => (
              <div key={weekday} className="flex flex-col gap-1">
                {[...Array(3)].map((_, week) => {
                  // Generate an activity pattern that looks more realistic
                  const isActive = (weekday + week) % 4 < 2;
                  return (
                    <div
                      key={week}
                      className={`h-2 rounded-sm ${
                        isActive 
                          ? "bg-emerald-200 bg-opacity-90" 
                          : "bg-emerald-200 bg-opacity-20"
                      } group-hover:${isActive ? 'bg-opacity-100' : 'bg-opacity-30'} transition-colors duration-300`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Consistency metrics */}
          <div className="mt-3 flex justify-between items-center text-xs text-emerald-100">
            <div className="flex items-center">
              <Zap className="w-3 h-3 mr-1 text-emerald-200" />
              <span>{consistentPct}% consistent</span>
            </div>
            <div>~{problemsPerDay} problems/day</div>
          </div>
        </div>
      </div>

      {/* Contests Card - Gold (Achievement) */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-4 border border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-amber-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-amber-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-semibold text-amber-50 uppercase tracking-wide">Contests</div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-white shadow-lg shadow-amber-700/50">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline">
            <div className="text-3xl font-bold text-white">{totalContests}</div>
            <div className="ml-2 text-xs text-amber-100 font-medium">participated</div>
          </div>

          {/* Contest performance visualization */}
          <div className="mt-4 flex flex-col gap-2">
            {/* Stacked progress bar for platform distribution */}
            <div className="space-y-2">
              {/* Stacked progress bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex">
                {topPlatforms.length > 0 ? (
                  topPlatforms.map((platform, i) => (
              <div
                key={i}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${platform.percentage}%`,
                        backgroundColor: platform.color,
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full h-full bg-amber-200/20"></div>
                )}
              </div>
              
              {/* Platform labels */}
              <div className="flex justify-between w-full">
                {topPlatforms.length > 0 ? (
                  topPlatforms.map((platform, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] text-amber-100">{platform.name}</span>
                      <span className="text-[10px] font-medium text-amber-100">{platform.count}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] mx-auto text-amber-100 italic">No platform data</span>
                )}
              </div>
          </div>

            {topPlatforms.length === 0 && totalContests > 0 && (
              <div className="mt-1 text-[10px] text-center text-amber-100">
                Connect platforms to see distribution
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak Card - Red (Fire/Consistency) */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 p-4 border border-rose-500/30 hover:border-rose-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-rose-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-rose-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-semibold text-rose-50 uppercase tracking-wide">Streak</div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-400 text-white shadow-lg shadow-rose-700/50">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline">
            <div className="text-3xl font-bold text-white">{streak}</div>
            <div className="ml-2 text-xs text-rose-100 font-medium">days</div>
          </div>

          {/* Improved flame visualization */}
          <div className="mt-4 flex items-end justify-between h-8">
            {[...Array(7)].map((_, i) => {
              // If streak is too large for visualization, adapt
              const effectiveStreak = Math.min(streak, 7);
              const height = i < effectiveStreak ? 100 : (i === effectiveStreak ? 60 : 30);
              return (
                <div key={i} className="flex flex-col items-center gap-0.5 w-6">
                  <div 
                    className={`w-3 bg-gradient-to-t from-rose-500 to-rose-300 rounded-sm transition-all duration-300 ${i < effectiveStreak ? 'opacity-100' : 'opacity-40'}`}
                    style={{ height: `${height}%` }}
                  >
                    {i < effectiveStreak && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/70 blur-[1px]" />
                    )}
                  </div>
                  <span className="text-[9px] text-rose-200">{i+1}</span>
              </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between items-center text-xs text-rose-100">
            <div className="flex items-center">
              <div className="mr-1 px-1.5 py-0.5 rounded-full bg-rose-400/20">
                {streak}
              </div>
              <span>Current</span>
            </div>
            <div className="flex items-center">
              <span>Best</span>
              <div className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-400/20">
                {maxStreak}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
