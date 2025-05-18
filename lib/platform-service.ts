"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export interface PlatformData {
  id: string
  name: string
  icon: string
  color: string
  username: string
  connected: boolean
  problems?: number
  rank?: string
  activityData?: Array<{ date: string, count: number }>
  rawData?: any
}

// Mock for platform connections until the real table is created
type PlatformConnection = {
  id: string
  userId: string
  platform: string
  username: string
  problemCount?: number
  ranking?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Get connected platforms data for the current user
 */
export async function getPlatformData(): Promise<PlatformData[]> {
  const session = await getServerSession(authOptions)
  
  // Define all supported platforms with default values
  const platforms: PlatformData[] = [
    {
      id: "leetcode",
      name: "LeetCode",
      icon: "/images/platforms/leetcode.svg",
      color: "#FFA116",
      username: "",
      connected: false,
    },
    {
      id: "codechef",
      name: "CodeChef",
      icon: "/images/platforms/codechef.svg",
      color: "#5B4638",
      username: "",
      connected: false,
    },
    {
      id: "codeforces",
      name: "CodeForces",
      icon: "/images/platforms/codeforces.svg",
      color: "#1F8ACB",
      username: "",
      connected: false,
    },
    {
      id: "geeksforgeeks",
      name: "GeeksForGeeks",
      icon: "/images/platforms/gfg.svg",
      color: "#2F8D46",
      username: "",
      connected: false,
    },
    {
      id: "hackerrank",
      name: "HackerRank",
      icon: "/images/platforms/hackerrank.svg",
      color: "#00EA64",
      username: "",
      connected: false,
    },
    {
      id: "hackerearth",
      name: "HackerEarth",
      icon: "/images/platforms/hackerearth.svg",
      color: "#2C3454",
      username: "",
      connected: false,
    },
    {
      id: "codingninjas",
      name: "Coding Ninjas",
      icon: "/images/platforms/codingninjas.svg",
      color: "#FC4F41",
      username: "",
      connected: false,
    },
  ]
  
  // If no authenticated user, return default platforms
  if (!session?.user?.id) {
    return platforms;
  }
  
  try {
    // Try to get data from PlatformData table
    const platformsData = await prisma.platformData.findMany({
      where: {
        userId: session.user.id
      }
    });
    
    // If we have real platform data, use it
    if (platformsData.length > 0) {
      return platforms.map(platform => {
        const platformData = platformsData.find(p => p.platform.toLowerCase() === platform.id.toLowerCase());
        
        if (platformData) {
          // Parse the data JSON to extract relevant information
          const data = platformData.data as any;
          
          // Extract username, problems, ranking and activity from the data JSON
          const username = data.username || "";
          // Try to get totalSolved from multiple possible fields
          const problems = data.totalSolved || data.problemsSolved || data.problems || 0;
          const rank = data.rank || data.rating || "N/A";
          
          // Extract activity data if available
          let activityData = undefined;
          if (data.activityData || data.submissions) {
            // Use the first available activity data source
            const rawActivity = data.activityData || data.submissions || [];
            
            // Normalize to our date/count format
            activityData = rawActivity.map((item: any) => {
              // Handle different possible formats
              if (typeof item === 'object') {
                // Most common format {date: string, count: number}
                if (item.date && (item.count !== undefined)) {
                  return {
                    date: item.date,
                    count: item.count
                  };
                }
                // Format with day and submissions {day: string, submissions: number}
                else if (item.day && (item.submissions !== undefined)) {
                  return {
                    date: item.day,
                    count: item.submissions
                  };
                }
              }
              
              // Fallback for formats we can't recognize
              return null;
            }).filter(Boolean); // Remove nulls
          }
          
          return {
            ...platform,
            username,
            connected: true,
            problems,
            rank,
            activityData,
            rawData: data
          };
        }
        
        return platform;
      });
    }
    
    // If database is empty but we're in development, use mock data for easier testing
   
    
    return platforms;
  } catch (error) {
    console.error('Error fetching platform data:', error);
    return platforms;
  }
}

/**
 * Generate mock activity data for development/testing
 */
function generateMockActivityData(days: number, platform: string) {
  const data = [];
  const today = new Date();
  const platformMultiplier = platform === 'leetcode' ? 1.5 : 
                            platform === 'codeforces' ? 2.0 : 1.0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // More activity on weekends and random spikes
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const randomFactor = Math.random();
    
    // Random count with more on weekends and occasional spikes
    // Zero count on some days (about 30% of days)
    let count = 0;
    if (randomFactor > 0.3) {
      count = Math.max(1, Math.round(
        (isWeekend ? 3 : 1) * 
        (randomFactor > 0.9 ? 4 : 1) * // Spike on 10% of days
        platformMultiplier * 
        Math.random() * 3)
      );
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return data;
} 