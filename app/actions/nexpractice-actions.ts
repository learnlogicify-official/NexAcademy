"use server"

import { getUserStreak } from "@/lib/streak-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export interface ActivityData {
  date: string;
  count: number;
}

/**
 * Server action to get user's problem solving stats
 */
export async function getUserProblemStats() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      totalSolved: 0,
      streak: 0,
      activityData: [] as ActivityData[]
    }
  }
  
  // Get total solved problems count and streak data
  try {
    // Get total solved problems (from accepted submissions)
    const totalSolvedQuery = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "problemId") as count
      FROM "ProblemSubmission"
      WHERE "userId" = ${session.user.id} 
      AND status = 'ACCEPTED'
    ` as any[];
    
    const totalSolved = parseInt(totalSolvedQuery[0]?.count || '0');
    
    // Get streak data
    const streakData = await getUserStreak(session.user.id);
    
    // Get user's activity data from platform data
    let activityData: ActivityData[] = [];
    
    try {
      // Get platform data for this user
      const platformsData = await prisma.platformData.findMany({
        where: {
          userId: session.user.id
        }
      });
      
      // If we have platform data, extract activity
      if (platformsData.length > 0) {
        // Collect all activity data from all platforms
        platformsData.forEach(platformData => {
          try {
            const data = platformData.data as any;
            
            // Look for activity data in different possible fields
            const rawActivity = data.activityData || data.submissions || data.activity || [];
            
            if (Array.isArray(rawActivity) && rawActivity.length > 0) {
              // Extract and normalize activity data
              rawActivity.forEach((item: any) => {
                let date: string | null = null;
                let count: number | null = null;
                
                // Handle different possible formats
                if (typeof item === 'object') {
                  // Most common format {date: string, count: number}
                  if (item.date && (item.count !== undefined)) {
                    date = item.date;
                    count = item.count;
                  }
                  // Format with day and submissions {day: string, submissions: number}
                  else if (item.day && (item.submissions !== undefined)) {
                    date = item.day;
                    count = item.submissions;
                  }
                  // Format with timestamp {timestamp: string/number, count: number}
                  else if (item.timestamp) {
                    const timestamp = new Date(item.timestamp);
                    if (!isNaN(timestamp.getTime())) {
                      date = timestamp.toISOString().split('T')[0];
                      count = item.count || 1;
                    }
                  }
                  
                  // Add to activity data if we found valid date and count
                  if (date && count !== null && count > 0) {
                    activityData.push({ date, count });
                  }
                }
              });
            }
          } catch (err) {
            console.error(`Error extracting activity data for platform ${platformData.platform}:`, err);
          }
        });
      }
      
      // If no platform data activity, try to get from ProblemSubmission
      if (activityData.length === 0) {
        try {
          const submissionResults = await prisma.$queryRaw`
            SELECT 
              DATE("submittedAt") as date,
              COUNT(*) as count 
            FROM "ProblemSubmission"
            WHERE "userId" = ${session.user.id}
            AND "submittedAt" > NOW() - INTERVAL '90 days'
            GROUP BY DATE("submittedAt")
            ORDER BY date DESC
          ` as any[];
          
          activityData = submissionResults.map((row: any) => ({
            date: row.date.toISOString().split('T')[0],
            count: parseInt(row.count)
          }));
        } catch (err) {
          console.error('Error fetching submission activity data:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching platform activity data:', err);
    }
    
    // If still no activity data and in development, generate mock data
    if (activityData.length === 0 && process.env.NODE_ENV === 'development') {
      activityData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0
      }));
    }
    
    return {
      totalSolved,
      streak: streakData.currentStreak || 0,
      activityData
    }
  } catch (error) {
    console.error('Error fetching problem stats:', error);
    return {
      totalSolved: 0,
      streak: 0,
      activityData: [] as ActivityData[]
    }
  }
} 