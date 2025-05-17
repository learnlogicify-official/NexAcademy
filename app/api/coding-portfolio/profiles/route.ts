import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlatformProfile } from "@/components/coding-portfolio/types";

export async function GET() {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access coding profile data" },
        { status: 401 }
      );
    }
    
    // Get the user's ID from the session
    const userId = session.user.id;
    
    // Get all platform data for the user
    const platformData = await prisma.platformData.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Format the data for the frontend
    const profiles: PlatformProfile[] = platformData.map(platform => {
      // The platform.data field contains the raw data from the platform's API
      const data = platform.data as any;
      
      return {
        platform: platform.platform,
        username: data.username || '',
        totalSolved: data.totalSolved || 0,
        rank: data.rank || 'N/A',
        rating: data.rating || 0,
        contests: data.contests || 0,
        badges: data.badges || 0,
        score: data.score || 0,
        problemsByDifficulty: data.problemsByDifficulty || {},
        contestHistory: data.contestHistory || [],
        activityHeatmap: data.activityHeatmap || [],
        stats: data.stats || {},
        data: data.rawData || data, // Include the raw data for reference
        error: data.error
      };
    });
    
    // Get all connected platforms from UserPlatformHandle regardless of data
    const connectedPlatforms = await prisma.userPlatformHandle.findMany({
      where: {
        userId: userId,
      }
    });
    
    // For platforms that are connected but have no data, add minimal profile records
    for (const platform of connectedPlatforms) {
      const exists = profiles.some(p => p.platform === platform.platform);
      if (!exists) {
        profiles.push({
          platform: platform.platform,
          username: platform.handle,
          error: 'No data available yet. Try refreshing the data.'
        });
      }
    }
    
    return NextResponse.json(profiles);
    
  } catch (error) {
    console.error("Error fetching platform profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform profiles" },
      { status: 500 }
    );
  }
} 