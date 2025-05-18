import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Function to check if PlatformData table exists
async function checkPlatformDataTable() {
  try {
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'PlatformData'
      );
    `;
    
    // @ts-ignore - We know this returns a boolean
    return tableExists[0].exists;
  } catch (error) {
    console.error('Error checking if PlatformData table exists:', error);
    return false;
  }
}

// Function to fetch platform data using raw SQL
async function fetchPlatformData(userId: string, platform?: string) {
  try {
    if (platform) {
      // Fetch data for a specific platform
      const data = await prisma.$queryRaw`
        SELECT id, "userId", platform, data, "createdAt", "updatedAt"
        FROM "PlatformData"
        WHERE "userId" = ${userId} AND platform = ${platform}
        ORDER BY "updatedAt" DESC;
      `;
      return data;
    } else {
      // Fetch data for all platforms
      const data = await prisma.$queryRaw`
        SELECT id, "userId", platform, data, "createdAt", "updatedAt"
        FROM "PlatformData"
        WHERE "userId" = ${userId}
        ORDER BY "updatedAt" DESC;
      `;
      return data;
    }
  } catch (error) {
    console.error('Error fetching platform data:', error);
    return [];
  }
}

// Function to store platform data using raw SQL
async function storePlatformData(userId: string, platform: string, data: any) {
  try {
    // First, check if the record exists
    const existingRecord = await prisma.$queryRaw`
      SELECT id FROM "PlatformData" 
      WHERE "userId" = ${userId} AND platform = ${platform}
      LIMIT 1;
    `;
    
    // Convert the data to JSON string
    const jsonData = JSON.stringify(data);
    
    if (Array.isArray(existingRecord) && existingRecord.length > 0) {
      // @ts-ignore - We know this returns an object with an id
      const recordId = existingRecord[0].id;
      
      // Update the existing record
      await prisma.$executeRaw`
        UPDATE "PlatformData"
        SET data = ${jsonData}::jsonb, "updatedAt" = NOW()
        WHERE id = ${recordId};
      `;
      return { id: recordId, updated: true };
    } else {
      // Insert a new record
      const id = uuidv4();
      
      await prisma.$executeRaw`
        INSERT INTO "PlatformData" (id, "userId", platform, data, "createdAt", "updatedAt")
        VALUES (${id}, ${userId}, ${platform}, ${jsonData}::jsonb, NOW(), NOW());
      `;
      return { id, updated: false };
    }
  } catch (error) {
    console.error('Error storing platform data:', error);
    throw error;
  }
}

// Function to delete platform data using raw SQL
async function deletePlatformData(userId: string, platform: string) {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM "PlatformData"
      WHERE "userId" = ${userId} AND platform = ${platform};
    `;
    return result;
  } catch (error) {
    console.error('Error deleting platform data:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { platform, platformData } = body as { platform: string; platformData: any };

    if (!platform || !platformData) {
      return NextResponse.json(
        { error: 'Platform and platformData are required' },
        { status: 400 }
      );
    }

    try {
      // Check if PlatformData table exists
      const tableExists = await checkPlatformDataTable();
      if (!tableExists) {
        return NextResponse.json({
          success: false,
          message: 'PlatformData table does not exist',
        }, { status: 503 });
      }

      // Store the data
      const result = await storePlatformData(user.id, platform, platformData);
      

      return NextResponse.json({
        success: true,
        message: 'Platform data saved successfully',
        result
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error saving platform data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save platform data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      // Check if PlatformData table exists
      const tableExists = await checkPlatformDataTable();
      if (!tableExists) {
        return NextResponse.json({
          platformData: [],
          message: 'PlatformData table does not exist',
        });
      }

      const searchParams = request.nextUrl.searchParams;
      const platform = searchParams.get('platform');
      const refresh = searchParams.get('refresh') === 'true';

      // If refresh is requested, call the profile-data endpoint to refresh the data
      if (refresh) {
        try {
          
          // First, get all platform handles
          const handlesResponse = await fetch(`${request.nextUrl.origin}/api/user/platform-handles`, {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });
          
          if (!handlesResponse.ok) {
            throw new Error('Failed to fetch platform handles');
          }
          
          const handlesData = await handlesResponse.json();
          const handles = handlesData.handles || [];
          
          if (handles.length === 0) {
            return NextResponse.json({
              platformData: [],
              message: 'No platform handles found to refresh',
            });
          }
          
          // Build query params for profile-data
          const params = handles.map((handle: any) => {
            // Map platform IDs for API request
            let platformParam = handle.platform;
            if (platformParam === 'geeksforgeeks') platformParam = 'gfg';
            if (platformParam === 'codingninjas') platformParam = 'codingninjas';
            
            return `${platformParam}=${encodeURIComponent(handle.handle)}`;
          }).join('&');
          
          // Call profile-data endpoint to refresh platform data
          const profileResponse = await fetch(`${request.nextUrl.origin}/api/user/profile-data?${params}`, {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
            },
          });
          
          if (!profileResponse.ok) {
            throw new Error('Failed to refresh profile data');
          }
          
        } catch (refreshError) {
          console.error('Error refreshing platform data:', refreshError);
          // Continue execution to at least return the existing data
        }
      }

      // Fetch platform data using raw SQL
      const platformData = await fetchPlatformData(user.id, platform || undefined);
      
      // Type assertion to handle platformData.length safely
      const platformDataArray = Array.isArray(platformData) ? platformData : [];
      

      return NextResponse.json({
        platformData,
        refreshed: refresh,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        platformData: [],
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
      });
    }
  } catch (error: any) {
    console.error('Error fetching platform data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch platform data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      );
    }

    try {
      // Check if PlatformData table exists
      const tableExists = await checkPlatformDataTable();
      if (!tableExists) {
        return NextResponse.json({
          success: true,
          message: 'PlatformData table does not exist, but operation succeeded',
        });
      }

      // Delete platform data
      await deletePlatformData(user.id, platform);
      

      return NextResponse.json({
        success: true,
        message: 'Platform data deleted successfully',
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error deleting platform data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete platform data' },
      { status: 500 }
    );
  }
} 