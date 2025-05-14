import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Define custom User type with GitHub fields
interface UserWithGitHub {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  resetToken: string | null;
  resetTokenExp: Date | null;
  bio: string | null;
  hasOnboarded: boolean;
  preferredLanguage: string | null;
  profilePic: string | null;
  username: string | null;
  bannerImage: string | null;
  githubUsername: string | null;
  githubAccessToken: string | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the latest user data including GitHub fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as UserWithGitHub | null;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      githubConnected: !!user.githubUsername && !!user.githubAccessToken,
      githubUsername: user.githubUsername,
    }, { status: 200 });
  } catch (error) {
    console.error('Error refreshing GitHub connection status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 