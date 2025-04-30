import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Find users matching search query (name or email)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    });
    
    // Get total count for pagination
    const total = await prisma.user.count({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      }
    });

    return NextResponse.json({
      users: users.map(user => ({
        _id: user.id, // Map id to _id for frontend compatibility
        name: user.name || user.email.split('@')[0],
        email: user.email,
        // Using a placeholder for avatar since there's no image field
        avatarUrl: null,
        role: user.role
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 