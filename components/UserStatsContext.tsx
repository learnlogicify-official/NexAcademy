"use client"
import React, { createContext, useContext } from "react"
import { useQuery, gql } from "@apollo/client"
import { useSession } from "next-auth/react"

// Basic query for user stats
const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      xp
      streak
    }
  }
`;

interface PlatformHandle {
  id: string
  platform: string
  handle: string
}

export interface UserStats {
  xp: number
  level: number
  streak: number
  platformHandles: PlatformHandle[]
  loading: boolean
}

// Default stats when data is not available
const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  platformHandles: [],
  loading: true
}

const UserStatsContext = createContext<UserStats>(defaultStats)

export const useUserStats = () => useContext(UserStatsContext)

export const UserStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  // Simple query with basic error handling
  const { data, loading, error } = useQuery(GET_USER_STATS, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
    errorPolicy: 'all',
    onError: (error) => {
      console.error("GraphQL error:", error.message);
    }
  });
  
  // Derive user stats from data or use defaults
  const userStats: UserStats = {
    xp: data?.userStats?.xp ?? 0,
    level: 1, // Keep level for backward compatibility
    streak: data?.userStats?.streak ?? 0,
    platformHandles: [], // Not fetching platform handles for efficiency
    loading: isAuthenticated && loading && !data
  };

  return (
    <UserStatsContext.Provider value={userStats}>
      {children}
    </UserStatsContext.Provider>
  )
}

// Helper function to refetch user stats when needed
export const refetchUserStats = (client: any) => {
  return client.refetchQueries({
    include: [GET_USER_STATS],
  });
}; 