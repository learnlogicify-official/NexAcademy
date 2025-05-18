"use client"
import React, { createContext, useContext } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface UserStats {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  freezeCount: number
  lastActivityDate: string | null
}

const UserStatsContext = createContext<UserStats | null>(null)

export const useUserStats = () => useContext(UserStatsContext)

export const UserStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: xpData } = useSWR("/api/user/xp", fetcher)
  const { data: streakData } = useSWR("/api/user/streak", fetcher)

  const value: UserStats = {
    xp: xpData?.xp ?? 0,
    level: xpData?.level ?? 1,
    currentStreak: streakData?.currentStreak ?? 0,
    longestStreak: streakData?.longestStreak ?? 0,
    freezeCount: streakData?.freezeCount ?? 0,
    lastActivityDate: streakData?.lastActivityDate ?? null,
  }

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  )
} 