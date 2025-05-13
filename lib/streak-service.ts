import { prisma } from '@/lib/prisma';
import { XP_REWARDS } from './xp-service';
import { awardXP } from './xp-service';

// Number of hours to consider a day still valid (e.g. until 4AM next day)
const STREAK_GRACE_PERIOD_HOURS = 4;

// Enable debug logging
const DEBUG_STREAK = true;
const log = (...args: any[]) => {
  if (DEBUG_STREAK) {
    console.log('[Streak Service]', ...args);
  }
};

// TypeScript interfaces to match the Prisma schema
interface UserStreakData {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  freezeCount: number;
  updatedAt: Date;
}

interface DailyActivityData {
  id: string;
  userId: string;
  activityDate: Date;
  xpEarned: number;
  submissionCount: number;
  practiceCount: number;
  eventCount: number;
}

/**
 * Check if the UserStreak and DailyActivity tables exist in the database
 */
let tablesChecked = false;
let tablesExist = false;

async function checkTablesExist() {
  if (tablesChecked) return tablesExist;
  
  try {
    // Use raw query to check if tables exist
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserStreak'
      ) as "userStreakExists",
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'DailyActivity'
      ) as "dailyActivityExists"
    `;
    
    // Safely check properties of result object
    const resultObj = result as any;
    tablesExist = resultObj[0]?.userStreakExists === true && 
                  resultObj[0]?.dailyActivityExists === true;
    
    log('Tables exist check:', tablesExist);
    
    tablesChecked = true;
    return tablesExist;
  } catch (error) {
    console.error('Error checking if streak tables exist:', error);
    tablesChecked = true;
    tablesExist = false;
    return false;
  }
}

/**
 * Record daily activity for a user, updating their streak information
 * 
 * @param userId User ID
 * @param activityType Type of activity (submission, practice, etc.)
 * @param xpEarned XP earned in this activity session
 */
export async function recordActivity(
  userId: string,
  activityType: 'submission' | 'practice' | 'assessment' | 'event',
  xpEarned = 0
): Promise<{
  currentStreak: number;
  streakUpdated: boolean;
  streakMaintained: boolean;
  freezeUsed: boolean;
  longestStreak?: number;
}> {
  try {
    log('Recording activity for user:', userId, 'type:', activityType);
    
    // Check if tables exist before trying to use them
    if (!await checkTablesExist()) {
      log('Streak tables do not exist yet. Skipping streak updates.');
      return {
        currentStreak: 0,
        streakUpdated: false,
        streakMaintained: false,
        freezeUsed: false,
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    // First, record today's activity - this is simpler and less likely to fail
    try {
      // Check if activity exists for today
      const existingActivity = await prisma.$queryRaw<DailyActivityData[]>`
        SELECT * FROM "DailyActivity" 
        WHERE "userId" = ${userId} AND "activityDate" = ${today}
      `.then(results => results[0] || null);
      
      log('Existing activity for today:', existingActivity);
      
      if (existingActivity) {
        // Update existing activity
        log('Updating existing activity');
        
        // Use different queries based on activity type instead of dynamic column names
        if (activityType === 'submission') {
          await prisma.$executeRaw`
            UPDATE "DailyActivity" 
            SET 
              "xpEarned" = "xpEarned" + ${xpEarned},
              "submissionCount" = "submissionCount" + 1,
              "eventCount" = "eventCount" + 1
            WHERE "userId" = ${userId} AND "activityDate" = ${today}
          `;
        } else if (activityType === 'practice') {
          await prisma.$executeRaw`
            UPDATE "DailyActivity" 
            SET 
              "xpEarned" = "xpEarned" + ${xpEarned},
              "practiceCount" = "practiceCount" + 1,
              "eventCount" = "eventCount" + 1
            WHERE "userId" = ${userId} AND "activityDate" = ${today}
          `;
        } else if (activityType === 'assessment') {
          await prisma.$executeRaw`
            UPDATE "DailyActivity" 
            SET 
              "xpEarned" = "xpEarned" + ${xpEarned},
              "eventCount" = "eventCount" + 1
            WHERE "userId" = ${userId} AND "activityDate" = ${today}
          `;
        } else {
          await prisma.$executeRaw`
            UPDATE "DailyActivity" 
            SET 
              "xpEarned" = "xpEarned" + ${xpEarned},
              "eventCount" = "eventCount" + 1
            WHERE "userId" = ${userId} AND "activityDate" = ${today}
          `;
        }
      } else {
        // Create new activity
        log('Creating new activity record');
        const activityId = generateCuid();
        await prisma.$executeRaw`
          INSERT INTO "DailyActivity" (
            id, "userId", "activityDate", "xpEarned", 
            "submissionCount", "practiceCount", "eventCount"
          )
          VALUES (
            ${activityId}, 
            ${userId}, 
            ${today}, 
            ${xpEarned}, 
            ${activityType === 'submission' ? 1 : 0}, 
            ${activityType === 'practice' ? 1 : 0}, 
            1
          )
        `;
        log('Created new activity record with ID:', activityId);
      }
    } catch (activityError) {
      console.error('Error recording daily activity:', activityError);
      // Continue with streak processing even if activity recording fails
    }
    
    // Now handle streak logic
    let userStreak = null;
    let streakMaintained = false;
    let streakUpdated = false;
    let streakBroken = false;
    let freezeUsed = false;
    
    try {
      // Get current streak if it exists
      userStreak = await prisma.$queryRaw<UserStreakData[]>`
        SELECT * FROM "UserStreak" WHERE "userId" = ${userId}
      `.then(results => results[0] || null);
      
      log('Current streak record:', userStreak);
      
      if (userStreak) {
        // Determine streak status based on last activity date
        if (userStreak.lastActivityDate) {
          const lastActivity = new Date(userStreak.lastActivityDate);
          lastActivity.setHours(0, 0, 0, 0);
          
          const dayDifference = getDayDifference(lastActivity, today);
          log('Days since last activity:', dayDifference);
          
          // Streak is broken if more than 1 day has passed
          streakBroken = dayDifference > 1;
          
          // Same-day activities maintain streak
          streakMaintained = dayDifference === 0;
          
          // Streak is updated if exactly 1 day has passed
          streakUpdated = dayDifference === 1;
          
          // Use streak freeze if available and needed
          if (streakBroken && userStreak.freezeCount > 0) {
            log('Using streak freeze');
            streakBroken = false;
            freezeUsed = true;
            streakUpdated = true;
            
            // Update the streak with new values
            const newStreakCount = userStreak.currentStreak + 1;
            const newLongestStreak = Math.max(userStreak.longestStreak, newStreakCount);
            
            await prisma.$executeRaw`
              UPDATE "UserStreak"
              SET 
                "currentStreak" = ${newStreakCount},
                "longestStreak" = ${newLongestStreak},
                "lastActivityDate" = ${today},
                "freezeCount" = ${userStreak.freezeCount - 1},
                "updatedAt" = NOW()
              WHERE "userId" = ${userId}
            `;
            
            userStreak.currentStreak = newStreakCount;
            userStreak.longestStreak = newLongestStreak;
            userStreak.lastActivityDate = today;
            userStreak.freezeCount -= 1;
            
            log('Streak updated with freeze:', userStreak);
          } else if (streakUpdated) {
            // Simply increment the streak
            log('Incrementing streak');
            const newStreakCount = userStreak.currentStreak + 1;
            const newLongestStreak = Math.max(userStreak.longestStreak, newStreakCount);
            
            await prisma.$executeRaw`
              UPDATE "UserStreak"
              SET 
                "currentStreak" = ${newStreakCount},
                "longestStreak" = ${newLongestStreak},
                "lastActivityDate" = ${today},
                "updatedAt" = NOW()
              WHERE "userId" = ${userId}
            `;
            
            userStreak.currentStreak = newStreakCount;
            userStreak.longestStreak = newLongestStreak;
            userStreak.lastActivityDate = today;
            
            log('Streak incremented to:', userStreak.currentStreak);
            
            // Award XP for streak day
            await awardXP(
              userId,
              null,
              'streak_day',
              XP_REWARDS.STREAK_DAY,
              `${userStreak.currentStreak}-day streak`
            );
            
            // Check for streak milestones
            if (userStreak.currentStreak % 7 === 0) {
              // Weekly milestone
              log('Awarding weekly milestone XP');
              await awardXP(
                userId,
                null,
                'streak_milestone',
                userStreak.currentStreak / 7 * 10,
                `${userStreak.currentStreak}-day streak milestone`
              );
            }
            
            if (userStreak.currentStreak === 30 || userStreak.currentStreak === 60 || userStreak.currentStreak === 90) {
              // Monthly milestone
              log('Awarding monthly milestone XP and streak freeze');
              
              // Award XP
              await awardXP(
                userId,
                null,
                'streak_milestone',
                25,
                `${userStreak.currentStreak}-day streak milestone`
              );
              
              // Award streak freeze
              await prisma.$executeRaw`
                UPDATE "UserStreak"
                SET "freezeCount" = "freezeCount" + 1
                WHERE "userId" = ${userId}
              `;
              
              userStreak.freezeCount += 1;
            }
          } else if (streakMaintained) {
            // Just update the last activity date
            log('Maintaining streak - updating last activity date');
            await prisma.$executeRaw`
              UPDATE "UserStreak"
              SET 
                "lastActivityDate" = ${today},
                "updatedAt" = NOW()
              WHERE "userId" = ${userId}
            `;
            
            userStreak.lastActivityDate = today;
          } else if (streakBroken) {
            // Reset streak
            log('Streak broken - resetting to 1');
            await prisma.$executeRaw`
              UPDATE "UserStreak"
              SET 
                "currentStreak" = 1,
                "lastActivityDate" = ${today},
                "updatedAt" = NOW()
              WHERE "userId" = ${userId}
            `;
            
            userStreak.currentStreak = 1;
            userStreak.lastActivityDate = today;
          }
        } else {
          // No previous activity date, so just update it
          log('No previous activity date - updating streak');
          await prisma.$executeRaw`
            UPDATE "UserStreak"
            SET 
              "lastActivityDate" = ${today},
              "updatedAt" = NOW()
            WHERE "userId" = ${userId}
          `;
          
          userStreak.lastActivityDate = today;
        }
      } else {
        // Create a new streak for this user
        log('Creating first streak for user');
        const streakId = generateCuid();
        
        try {
          await prisma.$executeRaw`
            INSERT INTO "UserStreak" (
              id, "userId", "currentStreak", "longestStreak", 
              "lastActivityDate", "freezeCount", "updatedAt"
            )
            VALUES (
              ${streakId}, ${userId}, 1, 1, 
              ${today}, 0, NOW()
            )
          `;
          
          log('New streak created with ID:', streakId);
          
          userStreak = {
            id: streakId,
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today,
            freezeCount: 0,
            updatedAt: new Date()
          };
          
          // This is a new streak
          streakUpdated = true;
        } catch (createError) {
          console.error('Error creating first streak:', createError);
          // Try to fetch if it was created anyway due to race condition
          userStreak = await prisma.$queryRaw<UserStreakData[]>`
            SELECT * FROM "UserStreak" WHERE "userId" = ${userId}
          `.then(results => results[0] || null);
          
          if (!userStreak) {
            throw createError; // Re-throw if we couldn't create or find a streak
          }
        }
      }
    } catch (streakError) {
      console.error('Error processing streak:', streakError);
      // If we have a partial userStreak object, use it. Otherwise return defaults
      if (!userStreak) {
        return {
          currentStreak: 0,
          streakUpdated: false,
          streakMaintained: false,
          freezeUsed: false,
          longestStreak: 0
        };
      }
    }
    
    const result = {
      currentStreak: userStreak.currentStreak,
      longestStreak: userStreak.longestStreak,
      streakUpdated,
      streakMaintained,
      freezeUsed,
    };
    
    log('Final streak result:', result);
    return result;
  } catch (error) {
    console.error('Error in recordActivity:', error);
    return {
      currentStreak: 0,
      streakUpdated: false,
      streakMaintained: false,
      freezeUsed: false,
      longestStreak: 0
    };
  }
}

/**
 * Get user's streak information 
 */
export async function getUserStreak(userId: string) {
  try {
    log('Getting streak for user:', userId);
    
    // Check if tables exist before trying to use them
    if (!await checkTablesExist()) {
      log('Streak tables do not exist yet. Returning default streak info.');
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezeCount: 0,
      };
    }
    
    // Get user streak using direct query
    const userStreak = await prisma.$queryRaw<UserStreakData[]>`
      SELECT * FROM "UserStreak" WHERE "userId" = ${userId}
    `.then(results => results[0] || null);
    
    log('Found user streak:', userStreak);
    
    if (!userStreak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezeCount: 0,
      };
    }
    
    // Check if streak should be reset due to inactivity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (userStreak.lastActivityDate) {
      const lastActivity = new Date(userStreak.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      
      const dayDifference = getDayDifference(lastActivity, today);
      log('Day difference for streak check:', dayDifference);
      
      // If more than one day has passed and no freeze is available, reset streak
      if (dayDifference > 1 && userStreak.freezeCount === 0) {
        log('Resetting streak due to inactivity');
        await prisma.$executeRaw`
          UPDATE "UserStreak"
          SET "currentStreak" = 0, "updatedAt" = NOW()
          WHERE "userId" = ${userId}
        `;
        
        return {
          ...userStreak,
          currentStreak: 0
        };
      }
      // If more than one day but user has a freeze, don't reset yet
      // We'll apply the freeze when they next do an activity
    }
    
    return userStreak;
  } catch (error) {
    console.error('Error getting user streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezeCount: 0,
    };
  }
}

/**
 * Get user's streak calendar for a specific month
 */
export async function getUserStreakCalendar(userId: string, month: number, year: number) {
  try {
    // Check if tables exist before trying to use them
    if (!await checkTablesExist()) {
      log('Streak tables do not exist yet. Returning empty calendar.');
      return {
        month,
        year,
        days: {},
      };
    }
    
    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the requested month
    
    const activities = await prisma.$queryRaw<DailyActivityData[]>`
      SELECT * FROM "DailyActivity"
      WHERE "userId" = ${userId}
      AND "activityDate" >= ${startDate}
      AND "activityDate" <= ${endDate}
      ORDER BY "activityDate" ASC
    `;
    
    // Create a map for each day of the month
    const daysInMonth = endDate.getDate();
    const calendar: Record<number, {
      hasActivity: boolean;
      xpEarned: number;
      submissions: number;
      practices: number;
    }> = {};
    
    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      calendar[day] = {
        hasActivity: false,
        xpEarned: 0,
        submissions: 0,
        practices: 0,
      };
    }
    
    // Fill in days with activities
    activities.forEach((activity) => {
      const day = new Date(activity.activityDate).getDate();
      
      calendar[day] = {
        hasActivity: true,
        xpEarned: activity.xpEarned,
        submissions: activity.submissionCount,
        practices: activity.practiceCount,
      };
    });
    
    return {
      month,
      year,
      days: calendar,
    };
  } catch (error) {
    console.error('Error getting user streak calendar:', error);
    return {
      month,
      year,
      days: {},
    };
  }
}

/**
 * Get the top streaks leaderboard
 */
export async function getStreakLeaderboard(limit = 10) {
  try {
    // Check if tables exist before trying to use them
    if (!await checkTablesExist()) {
      log('Streak tables do not exist yet. Returning empty leaderboard.');
      return [];
    }
    
    const leaderboard = await prisma.$queryRaw<Array<{
      id: string; 
      userId: string;
      currentStreak: number;
      longestStreak: number;
      userName: string | null;
      userProfilePic: string | null;
    }>>`
      SELECT 
        us.id, 
        us."userId", 
        us."currentStreak", 
        us."longestStreak",
        u.name as "userName",
        u."profilePic" as "userProfilePic"
      FROM "UserStreak" us
      JOIN "User" u ON us."userId" = u.id
      WHERE us."currentStreak" > 0
      ORDER BY us."currentStreak" DESC
      LIMIT ${limit}
    `;
    
    return leaderboard.map(entry => ({
      currentStreak: entry.currentStreak,
      longestStreak: entry.longestStreak,
      user: {
        id: entry.userId,
        name: entry.userName,
        profilePic: entry.userProfilePic
      }
    }));
  } catch (error) {
    console.error('Error getting streak leaderboard:', error);
    return [];
  }
}

/**
 * Helper functions
 */

// Get difference in days between two dates
function getDayDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Get the field name for the activity type
function getActivityCountField(activityType: string): string {
  switch (activityType) {
    case 'submission':
      return 'submissionCount';
    case 'practice':
      return 'practiceCount';
    case 'assessment':
      return 'eventCount';
    default:
      return 'eventCount';
  }
}

// Generate a unique ID (simple implementation)
function generateCuid(): string {
  return 'cid_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 