import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchPlatformData } from "@/lib/coding-portfolio/platform-fetchers";
import { headers } from "next/headers";

export async function POST() {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to refresh your coding data" },
        { status: 401 }
      );
    }
    
    // Get the user's ID from the session
    const userId = session.user.id;
    
    // Get all connected platforms for the user
    const userPlatforms = await prisma.userPlatformHandle.findMany({
      where: {
        userId: userId,
      },
    });
    
    if (userPlatforms.length === 0) {
      return NextResponse.json(
        { message: "No connected platforms found." },
        { status: 200 }
      );
    }
    
    // Get the server host for API calls
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    
    // For each platform, fetch the latest data
    const updatePromises = userPlatforms.map(async (platform) => {
      try {
        // Fetch the latest data from the platform
        const platformData = await fetchPlatformData(
          platform.platform,
          platform.handle,
          null,
          host // Pass the server host for API calls
        );
        
        // Update the platform data in the database
        return prisma.platformData.upsert({
          where: {
            id: await prisma.platformData.findFirst({
              where: {
                userId: platform.userId,
                platform: platform.platform
              },
              select: { id: true }
            }).then(record => record?.id || 'create-new-record')
          },
          update: {
            data: platformData,
            updatedAt: new Date(),
          },
          create: {
            userId: platform.userId,
            platform: platform.platform,
            data: platformData,
          },
        });
      } catch (error) {
        console.error(`Error updating data for ${platform.platform}:`, error);
        return null;
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.allSettled(updatePromises);
    
    // Count successful and failed updates
    const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === null)).length;
    
    // Return a summary
    return NextResponse.json({
      message: `Platform data updated successfully - refreshed ${successful} platforms${failed > 0 ? ` (${failed} failed)` : ''}`,
      successful,
      failed,
      total: userPlatforms.length,
      timestamp: new Date(),
    });
    
  } catch (error) {
    console.error("Error refreshing platform data:", error);
    return NextResponse.json(
      { error: "Failed to refresh platform data" },
      { status: 500 }
    );
  }
} 