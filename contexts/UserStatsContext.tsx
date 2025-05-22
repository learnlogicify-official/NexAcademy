import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

// Define the GraphQL query for user stats
const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      xp
      streak
    }
  }
`;

interface PlatformHandle {
  id: string;
  platform: string;
  handle: string;
}

interface UserStats {
  xp: number;
  streak: number;
  loading: boolean;
}

const UserStatsContext = createContext<UserStats>({
  xp: 0,
  streak: 0,
  loading: true
});

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useQuery(GET_USER_STATS, {
    // Fetch once and keep the data cached until explicitly invalidated
    fetchPolicy: "cache-first",
    // Don't refetch on component mounts to reduce API calls
    nextFetchPolicy: "cache-only",
  });
  
  // Default values when data is loading
  const userStats = {
    xp: data?.userStats?.xp || 0,
    streak: data?.userStats?.streak || 0,
    loading
  };

  return (
    <UserStatsContext.Provider value={userStats}>
      {children}
    </UserStatsContext.Provider>
  );
}

export const useUserStats = () => useContext(UserStatsContext);

// Helper function to refetch the user stats when needed
export const refetchUserStats = (client: any) => {
  // Refetch the query when needed (e.g., after completing a problem)
  return client.refetchQueries({
    include: [GET_USER_STATS],
  });
}; 