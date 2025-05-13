import { prisma } from '@/lib/prisma';

// XP points constants for different achievements
export const XP_REWARDS = {
  CORRECT_SUBMISSION: 25, // Easy problem (default)
  MEDIUM_DIFFICULTY: 50,  // Medium difficulty problem
  HARD_DIFFICULTY: 100,   // Hard difficulty problem
  VERY_HARD_DIFFICULTY: 100, // Very hard difficulty problem
  ASSESSMENT_COMPLETION: 25,
  STREAK_DAY: 5,
  PROFILE_COMPLETION: 15,
  FIRST_SUBMISSION: 15    // First correct solution bonus
};

// Level thresholds - each index represents XP needed for that level
// e.g., LEVEL_THRESHOLDS[3] = 150 means 150 XP needed for level 3
export const LEVEL_THRESHOLDS = [
  0,    // Level 0 (Not used)
  0,    // Level 1 (Starting level)
  50,   // Level 2
  150,  // Level 3
  300,  // Level 4
  500,  // Level 5
  750,  // Level 6
  1050, // Level 7
  1400, // Level 8
  1800, // Level 9
  2250  // Level 10
];

/**
 * Calculate the user level based on XP
 * @param xp Current XP points
 * @returns The user's level
 */
export function calculateLevel(xp: number): number {
  // Find the highest level where the user has enough XP
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 1; // Default to level 1
}

/**
 * Check if tables exist before trying to use them
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
        AND table_name = 'UserXP'
      ) as "userXPExists",
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserXPEvent'
      ) as "userXPEventExists"
    `;
    
    // Safely check properties of result object
    const resultObj = result as any;
    tablesExist = resultObj[0]?.userXPExists === true && 
                  resultObj[0]?.userXPEventExists === true;
    
    tablesChecked = true;
    return tablesExist;
  } catch (error) {
    console.error('Error checking if XP tables exist:', error);
    tablesChecked = true;
    tablesExist = false;
    return false;
  }
}

/**
 * Check if a user has already received XP for a specific event
 * @param userId User ID
 * @param questionId Question ID (optional)
 * @param eventType Type of event
 * @returns Boolean indicating if user has already received XP
 */
export async function hasAlreadyReceivedXP(
  userId: string, 
  questionId: string | null, 
  eventType: string
): Promise<boolean> {
  if (!await checkTablesExist()) return false;
  
  try {
    // Use raw query since schema might not be available
    let result;
    
    if (questionId) {
      result = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "UserXPEvent" 
        WHERE "userId" = ${userId} 
        AND "questionId" = ${questionId} 
        AND "eventType" = ${eventType}
      `;
    } else {
      result = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "UserXPEvent" 
        WHERE "userId" = ${userId} 
        AND "eventType" = ${eventType}
      `;
    }
    
    const resultObj = result as any;
    return (resultObj[0]?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking for previous XP awards:', error);
    return false;
  }
}

/**
 * Award XP to a user and create an XP event record
 * Using raw SQL queries for safety since schema may not be applied yet
 */
export async function awardXP(
  userId: string,
  questionId: string | null,
  eventType: string,
  amount: number,
  description?: string
): Promise<{ userXP: any; isNewAward: boolean; newLevel: number | null } | null> {
  // If eventType is 'correct_submission' and questionId is provided, fetch the problem name
  let xpDescription = description;
  if (eventType === 'correct_submission' && questionId) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (question?.name) {
      xpDescription = `Solved ${question.name}`;
    }
  }

  try {
    // Check if the XP tables exist in the database
    if (!await checkTablesExist()) {
      console.warn('XP tables do not exist. Skipping XP award.');
      return null;
    }
    
    // Check if this is a new award
    const alreadyAwarded = await hasAlreadyReceivedXP(userId, questionId, eventType);
    
    if (alreadyAwarded) {
      // User already received XP for this event
      // Get current XP using raw query
      const currentXpResult = await prisma.$queryRaw`
        SELECT xp, level FROM "UserXP" WHERE "userId" = ${userId}
      `;
      
      const resultObj = currentXpResult as any;
      const userXP = resultObj[0] ? {
        userId,
        xp: resultObj[0].xp || 0,
        level: resultObj[0].level || 1
      } : {
        userId,
        xp: 0,
        level: 1
      };
      
      return { 
        userXP,
        isNewAward: false,
        newLevel: null 
      };
    }
    
    // Use a transaction for data consistency
    return await prisma.$transaction(async (tx) => {
      // Get current XP info
      const userXpResult = await tx.$queryRaw`
        SELECT xp, level FROM "UserXP" WHERE "userId" = ${userId}
      `;
      
      const userXpObj = (userXpResult as any)[0];
      const oldLevel = userXpObj?.level || 1;
      const oldXP = userXpObj?.xp || 0;
      
      let userXP;
      
      // Update or create UserXP record
      if (userXpObj) {
        // Update existing record
        const newXp = oldXP + amount;
        await tx.$executeRaw`
          UPDATE "UserXP" 
          SET xp = ${newXp}, "updatedAt" = NOW() 
          WHERE "userId" = ${userId}
        `;
        
        userXP = {
          userId,
          xp: newXp,
          level: oldLevel
        };
      } else {
        // Create new record
        await tx.$executeRaw`
          INSERT INTO "UserXP" (id, "userId", xp, level, "updatedAt")
          VALUES (${generateCuid()}, ${userId}, ${amount}, 1, NOW())
        `;
        
        userXP = {
          userId,
          xp: amount,
          level: 1
        };
      }
      
      // Create XP event record
      const xpEvent = await tx.$executeRaw`
        INSERT INTO "UserXPEvent" (id, "userId", "questionId", "eventType", "awardedXP", description, "createdAt")
        VALUES (
          ${generateCuid()},
          ${userId},
          ${questionId || null},
          ${eventType},
          ${amount},
          ${xpDescription || null},
          NOW()
        )
      `;
      
      // Calculate new level and update if needed
      const newLevel = calculateLevel(userXP.xp);
      
      if (newLevel > oldLevel) {
        await tx.$executeRaw`
          UPDATE "UserXP" 
          SET level = ${newLevel}
          WHERE "userId" = ${userId}
        `;
        
        userXP.level = newLevel;
      }
      
      return {
        userXP,
        isNewAward: true,
        newLevel: newLevel > oldLevel ? newLevel : null
      };
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return null;
  }
}

/**
 * Generate a CUID for new records
 */
function generateCuid(): string {
  return 'c' + Math.random().toString(36).substring(2, 9) + 
         Math.random().toString(36).substring(2, 9);
}

/**
 * Get a user's XP information
 * @param userId User ID
 * @returns XP information or null if not found
 */
export async function getUserXP(userId: string) {
  if (!await checkTablesExist()) {
    return {
      xp: 0,
      level: 1,
      events: []
    };
  }
  
  try {
    // Get user XP info
    const userXpResult = await prisma.$queryRaw`
      SELECT xp, level FROM "UserXP" WHERE "userId" = ${userId}
    `;
    
    const userXpObj = (userXpResult as any)[0];
    
    // Get recent events
    const eventsResult = await prisma.$queryRaw`
      SELECT id, "eventType", "awardedXP", description, "createdAt"
      FROM "UserXPEvent"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    // If user doesn't have an XP record yet, return default values
    if (!userXpObj) {
      return {
        xp: 0,
        level: 1,
        events: eventsResult
      };
    }
    
    return {
      xp: userXpObj.xp || 0,
      level: userXpObj.level || 1,
      events: eventsResult
    };
  } catch (error) {
    console.error('Error getting user XP:', error);
    return {
      xp: 0,
      level: 1,
      events: []
    };
  }
}

/**
 * Get XP leaderboard
 * @param limit Number of users to return
 * @returns Array of users with their XP, ordered by XP
 */
export async function getXPLeaderboard(limit: number = 10) {
  if (!await checkTablesExist()) {
    return [];
  }
  
  try {
    const leaderboardResult = await prisma.$queryRaw`
      SELECT u.id, u.name, u.image, x.xp, x.level
      FROM "UserXP" x
      JOIN "User" u ON x."userId" = u.id
      ORDER BY x.xp DESC
      LIMIT ${limit}
    `;
    
    return leaderboardResult;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
} 