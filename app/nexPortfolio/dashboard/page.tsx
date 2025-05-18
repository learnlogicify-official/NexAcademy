import { CodingDashboard } from "@/components/coding-portfolio/dashboard"
import UserBanner from "@/components/coding-portfolio/user-banner"
import { StatsCards } from "@/components/coding-portfolio/stats-card"
import { ConnectedPlatforms } from "@/components/coding-portfolio/connected-platforms"
import { getUserProblemStats } from "@/app/actions/nexpractice-actions"
import { PlatformData, getPlatformData } from "@/lib/platform-service"
import { PlatformProfile, ContestData } from "@/components/coding-portfolio/types"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Convert PlatformData to PlatformProfile format
function mapPlatformDataToProfile(platform: PlatformData): PlatformProfile {
  // Extract contest history from rawData if available
  const contestHistory: ContestData[] = platform.rawData?.contestHistory || platform.rawData?.contests || [];
  
  // Map the contest history to match our ContestData interface
  const mappedContestHistory = Array.isArray(contestHistory) ? 
    contestHistory.map((contest: any) => ({
      name: contest.name || contest.contest || 'Unknown Contest',
      date: contest.date || new Date().toISOString().split('T')[0], // Fallback to today
      rank: contest.rank || contest.position || contest.standing || 0,
      rating: contest.rating || contest.newRating || undefined,
      position: contest.position,
      standing: contest.standing
    })) : [];

  return {
    platform: platform.id,
    username: platform.username,
    totalSolved: platform.problems || 0,
    rank: platform.rank || 'N/A',
    rating: typeof platform.rawData?.rating === 'number' ? platform.rawData.rating : 0,
    contests: platform.rawData?.contests?.length || platform.rawData?.contestCount || 0,
    problemsByDifficulty: platform.rawData?.problemsByDifficulty || {},
    contestHistory: mappedContestHistory,
    activityHeatmap: platform.activityData || platform.rawData?.activityHeatmap || [],
    stats: {
      streak: platform.rawData?.streak || 0,
      totalActiveDays: platform.rawData?.totalActiveDays || 0
    },
    data: platform.rawData
  };
}

// This is now a Server Component
export default async function CodingPortfolioDashboardPage() {
  const session = await getServerSession(authOptions)
  // Fetch real data from server actions
  const { totalSolved, streak } = await getUserProblemStats()
  const platforms = await getPlatformData()
  
  // Calculate total problems solved from all platforms with better fallbacks
  const platformTotalSolved = platforms
    .filter(platform => platform.connected)
    .reduce((sum, platform) => {
      // First check if platform.problems is available (this is what platform-service sets)
      if (platform.problems && platform.problems > 0) {
        return sum + platform.problems;
      }
      
      // If not, try to get from rawData
      const rawData = platform.rawData || {};
      const rawTotalSolved = rawData.totalSolved || 0;
      
      return sum + rawTotalSolved;
    }, 0);
  
  // Extract difficulty breakdowns from platforms
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      const data = platform.rawData || {};
      
      // Check for LeetCode format
      if (platform.id === "leetcode") {
        // LeetCode typically provides these directly
        easyCount += data.problemsByDifficulty.easy || 0;
        mediumCount += data.problemsByDifficulty.medium || 0;
        hardCount += data.problemsByDifficulty.hard || 0;
      } 
      // Check for CodeForces format (maps problem ratings to difficulty levels)
      else if (platform.id === "codeforces" && data.problemsByDifficulty) {
        // In CodeForces, typically:
        // - 800-1200 can be considered "Easy"
        // - 1300-1900 can be considered "Medium"
        // - 2000+ can be considered "Hard"
        Object.entries(data.problemsByDifficulty).forEach(([rating, count]) => {
          const ratingNum = parseInt(rating);
          if (!isNaN(ratingNum)) {
            if (ratingNum <= 1200) {
              easyCount += Number(count);
            } else if (ratingNum <= 1900) {
              mediumCount += Number(count);
            } else {
              hardCount += Number(count);
            }
          }
        });
      } 
      // Check for other platforms with problemsByDifficulty in different format
      else if (data.problemsByDifficulty) {
        // Check for standard naming: easy, medium, hard
        easyCount += data.problemsByDifficulty.easy || 0;
        easyCount += data.problemsByDifficulty.basic || 0;
        easyCount += data.problemsByDifficulty.school || 0;
        mediumCount += data.problemsByDifficulty.medium || 0;
        hardCount += data.problemsByDifficulty.hard || 0;
      }
    });
  
  
  // Use platform total if available, otherwise fall back to the stats value
  const combinedTotalSolved = platformTotalSolved > 0 ? platformTotalSolved : totalSolved
  
  // Extract platform problem counts for distribution visualization
  const platformProblems = platforms
    .filter(platform => platform.connected && platform.problems && platform.problems > 0)
    .map(platform => ({
      id: platform.id,
      name: platform.name,
      icon: platform.icon,
      color: platform.color,
      count: platform.problems || 0,
      percentage: platformTotalSolved > 0 ? Math.round((platform.problems || 0) / platformTotalSolved * 100) : 0
    }));
  
  // --- Strict active days calculation using only heatmap/apiheatmap ---
  const uniqueDates = new Set<string>()
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      // Try to get heatmap or apiheatmap from the platform's data
      const data: any = (platform as any).rawData || (platform as any).data || {};
      // DEBUG: Log the full rawData for each platform
      const heatmapArr = data.activityHeatmap || data.heatmap || data.apiheatmap || [];
      if (Array.isArray(heatmapArr)) {
        heatmapArr.forEach((item: any) => {
          // Normalize to {date, count}
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
          if (date && count && count > 0) {
            uniqueDates.add(date);
          }
        })
      }
    })
  const activeDaysCount = uniqueDates.size

  // --- Contest Count ---
  let totalContests = 0;
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      const data: any = platform.rawData || {};
      if (platform.id === 'hackerrank') {
        if (Array.isArray(data.ratingHistory)) {
          data.ratingHistory.forEach((entry: any) => {
            if (Array.isArray(entry.events)) {
              totalContests += entry.events.length;
            }
          });
        }
      } else if (platform.id === 'hackerearth') {
        if (Array.isArray(data.ratingHistory)) {
          totalContests += data.ratingHistory.length;
        }
      } else if (platform.id === 'codingninjas') {
        // Special handling for CodingNinjas
        if (data.contests && typeof data.contests === 'object') {
          // Get attendance count from attended field
          if (typeof data.contests.attended === 'number') {
            totalContests += data.contests.attended;
          } else if (data.contestCount && typeof data.contestCount === 'number') {
            totalContests += data.contestCount;
          }
        }
      } else {
        if (Array.isArray(data.contests)) {
          totalContests += data.contests.length;
        } else if (Array.isArray(data.contestHistory)) {
          totalContests += data.contestHistory.length;
        } else if (typeof data.contests === 'number') {
          totalContests += data.contests;
        }
      }
    });

  // --- Streaks from heatmap/apiheatmap ---
  function calculateStreaks(dateSet: Set<string>): { current: number, max: number } {
    if (dateSet.size === 0) return { current: 0, max: 0 };

    // Find the range of dates
    const sortedDates = Array.from(dateSet).sort();
    const start = new Date(sortedDates[0]);
    const end = new Date(sortedDates[sortedDates.length - 1]);

    // Helper to format date as YYYY-MM-DD
    const format = (d: Date) => d.toISOString().split('T')[0];

    // Best streak calculation
    let maxStreak = 0;
    let tempStreak = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (dateSet.has(format(d))) {
        tempStreak += 1;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak calculation: only count if today is in the set
    let current = 0;
    const todayStr = format(new Date());
    if (dateSet.has(todayStr)) {
      let d = new Date();
      while (dateSet.has(format(d))) {
        current += 1;
        d.setDate(d.getDate() - 1);
      }
    } else {
      // If today has no activity, check if yesterday does to maintain the streak
      const yesterdayStr = format(new Date(Date.now() - 86400000));
      if (dateSet.has(yesterdayStr)) {
        let d = new Date(Date.now() - 86400000); // yesterday
        while (dateSet.has(format(d))) {
          current += 1;
          d.setDate(d.getDate() - 1);
        }
      } else {
        current = 0;
      }
    }

    return { current, max: maxStreak };
  }

  // Merge all activity dates into a single set
  const allActivityDates = new Set<string>();
  
  // Process all platforms
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      const data: any = platform.rawData || {};
      const heatmapArr = data.activityHeatmap || data.heatmap || data.apiheatmap || [];
      
      if (Array.isArray(heatmapArr)) {
        heatmapArr.forEach((item: any) => {
          let date: string | null = null;
          let count: number | null = null;
          
          // Handle different date formats
          if (item.date && (typeof item.count === 'number' || typeof item.value === 'number')) {
            date = item.date;
            count = typeof item.count === 'number' ? item.count : item.value;
          } else if (item.day && (typeof item.submissions === 'number' || typeof item.value === 'number')) {
            date = item.day;
            count = typeof item.submissions === 'number' ? item.submissions : item.value;
          } else if (item.timestamp) {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
              date = d.toISOString().split('T')[0];
              count = typeof item.count === 'number' ? item.count : 1;
            }
          }
          
          if (date && count && count > 0) {
            allActivityDates.add(date);
          }
        });
      }
    });
  
  // Calculate streaks once based on all activity dates
  const { current: currentStreak, max: maxStreak } = calculateStreaks(allActivityDates);
  
  // --- Process heatmap data for the activity calendar ---
  // Extract and normalize all heatmap data from connected platforms
  const allHeatmapData: Array<{ date: string, count: number }> = [];
  platforms
    .filter(platform => platform.connected)
    .forEach(platform => {
      const data: any = platform.rawData || {};
      // Get heatmap data from various possible sources in the data
      const heatmapArr = data.apiHeatMap || data.activityHeatmap || data.heatmap || [];
      
      if (Array.isArray(heatmapArr)) {
        heatmapArr.forEach((item: any) => {
          // Normalize to {date, count}
          let date: string | null = null;
          let count: number | null = null;
          if (platform.id === "codechef") {
            // For codechef, use item.value
            if (item.date && (item.value !== undefined)) {
              date = item.date;
              count = item.value;
            } else if (item.day && (item.value !== undefined)) {
              date = item.day;
              count = item.value;
            } else if (item.timestamp) {
              const d = new Date(item.timestamp);
              if (!isNaN(d.getTime())) {
                date = d.toISOString().split('T')[0];
                count = item.value || 1;
              }
            }
          } else {
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
          }
          
          if (date && count !== null) {
            allHeatmapData.push({ date, count });
          }
        });
      }
    });
  
  

  // Merge heatmap data by date (sum counts for the same date across platforms)
  const dateMap = new Map<string, number>();
  allHeatmapData.forEach(item => {
    const existing = dateMap.get(item.date) || 0;
    dateMap.set(item.date, existing + item.count);
  });
  // Display the sum of counts in dateMap
  const totalCount = Array.from(dateMap.values()).reduce((sum, count) => sum + count, 0);

  // Convert to the format needed for the ActivityCalendar component
  const calendarData = Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
    level: getLevelForCount(count)
  }));

 
  
  // Helper function to determine activity level based on count
  function getLevelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  // --- Weekly trend calculation (total submissions week-over-week, for Stats Card) ---
  function calculateStatsCardWeeklyTrend(platforms: any[]): number {
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

  const statsCardWeeklyTrend = calculateStatsCardWeeklyTrend(platforms);

  return (
    <div className="relative p-2 md:p-4 lg:p-6 pb-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        <UserBanner session={session ?? undefined} />
        
        <div className="grid grid-cols-1 gap-5">
          <StatsCards 
            activeDays={activeDaysCount} 
            totalSubmissions={combinedTotalSolved}
            totalContests={totalContests}
            streak={currentStreak}
            maxStreak={maxStreak}
            platforms={platforms}
            easyCount={easyCount}
            mediumCount={mediumCount}
            hardCount={hardCount}
          />
          
          <ConnectedPlatforms platforms={platforms} />
          
          <CodingDashboard 
            totalSolved={combinedTotalSolved} 
            activeDays={activeDaysCount}
            totalContests={totalContests}
            streak={currentStreak}
            maxStreak={maxStreak}
            calendarData={calendarData}
            easyCount={easyCount}
            mediumCount={mediumCount}
            hardCount={hardCount}
            platformProblems={platformProblems}
            platforms={platforms.filter(p => p.connected).map(mapPlatformDataToProfile)}
          />
        </div>
      </div>
    </div>
  )
}
