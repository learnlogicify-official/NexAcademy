import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Define GitHub repository type
interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

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

    // Get the GitHub access token from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as UserWithGitHub | null;

    if (!user || !user.githubAccessToken || !user.githubUsername) {
      return NextResponse.json(
        { error: 'GitHub account not connected', connected: false },
        { status: 200 }
      );
    }

    // Fetch public repositories from GitHub API
    const response = await fetch(`https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=10`, {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      
      if (response.status === 401) {
        // Token might be expired or revoked
        return NextResponse.json(
          { error: 'GitHub authentication failed', connected: false },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch GitHub repositories' },
        { status: response.status }
      );
    }

    const repos = await response.json() as GitHubRepo[];
    
    // Transform the data for our frontend
    const transformedRepos = repos.map((repo) => ({
      name: repo.name,
      description: repo.description || 'No description available',
      tags: [repo.language].filter(Boolean),
      repoUrl: repo.html_url,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));

    return NextResponse.json({ repositories: transformedRepos, connected: true }, { status: 200 });
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 