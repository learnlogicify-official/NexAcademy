"use server"

import { getUserStreak } from "@/lib/streak-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

/**
 * Server action to get user's problem solving stats
 */
export async function getUserProblemStats() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      totalSolved: 0,
      streak: 0
    }
  }
  
  // Get total solved problems count (accepted submissions count)
  try {
    const totalSolvedQuery = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "problemId") as count
      FROM "ProblemSubmission"
      WHERE "userId" = ${session.user.id} 
      AND status = 'ACCEPTED'
    ` as any[];
    
    const totalSolved = parseInt(totalSolvedQuery[0]?.count || '0');
    
    // Get streak data
    const streakData = await getUserStreak(session.user.id);
    
    return {
      totalSolved,
      streak: streakData.currentStreak || 0
    }
  } catch (error) {
    console.error('Error fetching problem stats:', error);
    return {
      totalSolved: 0,
      streak: 0
    }
  }
} 