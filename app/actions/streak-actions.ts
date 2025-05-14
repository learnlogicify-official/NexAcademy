"use server"

import { getUserStreak, getUserStreakCalendar } from "@/lib/streak-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * Server action to get the current user's streak data
 * 
 * @param timezoneOffset Optional timezone offset in minutes from client
 */
export async function getCurrentUserStreak(timezoneOffset?: number) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezeCount: 0
    }
  }
  
  return getUserStreak(session.user.id, timezoneOffset)
}

/**
 * Server action to get streak calendar data for a specific month
 * 
 * @param month Month (1-12)
 * @param year Year
 * @param timezoneOffset Optional timezone offset in minutes from client
 */
export async function getStreakCalendarData(
  month: number, 
  year: number, 
  timezoneOffset?: number
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      month,
      year,
      days: {}
    }
  }
  
  return getUserStreakCalendar(session.user.id, month, year, timezoneOffset)
}

/**
 * Server action to get user ID from session
 */
export async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
} 