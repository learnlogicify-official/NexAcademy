import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all problems that the user has successfully solved
    const solvedProblems = await prisma.problemSubmission.findMany({
      where: {
        userId: session.user.id,
        status: 'ACCEPTED' // or whatever status indicates a successful submission
      },
      select: {
        problemId: true
      }
    });

    const solvedProblemIds = solvedProblems.map(sub => sub.problemId);

    // Get a random unsolved problem
    const unsolvedProblems = await prisma.question.findMany({
      where: {
        codingQuestion: { isNot: null },
        id: { notIn: solvedProblemIds }
      },
      select: {
        id: true
      }
    });

    if (unsolvedProblems.length === 0) {
      return NextResponse.json(
        { error: 'No unsolved problems found' },
        { status: 404 }
      );
    }

    // Pick a random problem from the unsolved ones
    const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
    const randomProblem = unsolvedProblems[randomIndex];

    // Get the base URL from the request URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Create the redirect URL
    const redirectUrl = `${baseUrl}/nexpractice/problem/${randomProblem.id}`;

    // Redirect to the problem page
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error fetching random problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random problem' },
      { status: 500 }
    );
  }
} 