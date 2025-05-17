import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET: Retrieve the user's platform handles
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get all platform handles for the user
    const handles = await prisma.userPlatformHandle.findMany({
      where: { userId }
    });

    
    return NextResponse.json({ handles });
  } catch (error) {
    console.error('Error retrieving platform handles:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve platform handles' },
      { status: 500 }
    );
  }
}

/**
 * POST: Add or update a platform handle
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { platform, handle } = await request.json();
    
    if (!platform || !handle) {
      return NextResponse.json(
        { error: 'Platform and handle are required' },
        { status: 400 }
      );
    }

    // Check if handle already exists
    const existingHandle = await prisma.userPlatformHandle.findFirst({
      where: {
        userId,
        platform
      }
    });

    // Always mark as verified when saving
    // We can implement actual verification later if needed
    const verified = true;
    let result;
    
    if (existingHandle) {
      // Update existing handle
      result = await prisma.userPlatformHandle.update({
        where: { id: existingHandle.id },
        data: {
          handle,
          verified,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new handle
      result = await prisma.userPlatformHandle.create({
        data: {
          id: uuidv4(),
          userId,
          platform,
          handle,
          verified,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    return NextResponse.json({ success: true, handle: result });
  } catch (error) {
    console.error('Error saving platform handle:', error);
    return NextResponse.json(
      { error: 'Failed to save platform handle' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a platform handle
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform');
    
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      );
    }

    // Delete the platform handle
    const result = await prisma.userPlatformHandle.deleteMany({
      where: {
        userId,
        platform
      }
    });
    
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform handle:', error);
    return NextResponse.json(
      { error: 'Failed to delete platform handle' },
      { status: 500 }
    );
  }
} 