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
        // Map platform names for the fetchers if needed
        let fetcherPlatform = platform.platform;
        
        // Handle special cases for platform name mappings
        if (platform.platform === 'gfg') {
          fetcherPlatform = 'geeksforgeeks';
        } 
        // Standardize on codingninjas instead of codestudio
        else if (platform.platform === 'codestudio') {
          fetcherPlatform = 'codingninjas';
          console.log(`Normalizing platform name from codestudio to codingninjas for ${platform.handle}`);
        }
        
        // Fetch the latest data from the platform
        const platformData = await fetchPlatformData(
          fetcherPlatform,
          platform.handle,
          null,
          host // Pass the server host for API calls
        );
        
        // Skip storing if there was an error
        if (platformData.error) {
          console.warn(`Error fetching ${platform.platform} data: ${platformData.error}`);
          return {
            platform: platform.platform,
            success: false,
            error: platformData.error
          };
        }
        
        // Always store using the standardized platform name
        const dbPlatformName = platform.platform === 'codestudio' ? 'codingninjas' : platform.platform;
        
        // Update the platform data in the database
        await prisma.platformData.upsert({
          where: {
            id: await prisma.platformData.findFirst({
              where: {
                userId: platform.userId,
                platform: dbPlatformName
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
            platform: dbPlatformName,
            data: platformData,
          },
        });
        
        return {
          platform: platform.platform,
          success: true
        };
      } catch (error) {
        console.error(`Error updating data for ${platform.platform}:`, error);
        return {
          platform: platform.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    // Count successful and failed updates
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    // Create a detailed message including which platforms failed
    const failedPlatforms = results
      .filter(r => !r.success)
      .map(r => r.platform);

    const successMessage = successful > 0 
      ? `Successfully refreshed data from ${successful} platforms`
      : 'No platforms were successfully refreshed';
      
    const failureMessage = failed > 0 
      ? `. Failed to fetch data from ${failed} platforms: ${failedPlatforms.join(', ')}`
      : '';
    
    // Return a summary
    return NextResponse.json({
      message: successMessage + failureMessage,
      successful,
      failed,
      failedPlatforms,
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