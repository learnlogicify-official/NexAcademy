import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Only fetch a few users, specifically just their IDs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      },
      take: 5 // Limit to 5 users for security
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 