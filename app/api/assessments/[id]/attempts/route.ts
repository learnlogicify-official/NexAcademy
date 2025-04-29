import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const latest = searchParams.get('latest');
    const assessmentId = params.id;

    if (!userId || !assessmentId) {
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    // Build query
    const where = {
      userId,
      assessmentId,
    };

    if (latest === '1') {
      // Only return the latest in-progress attempt if it exists, otherwise latest attempt
      const attempts = await (prisma as any).attempt.findMany({
        where,
        orderBy: [{ startedAt: 'desc' }],
        take: 1,
      });
      // If the latest attempt is in-progress, return it, else return empty array
      if (attempts.length > 0 && attempts[0].status === 'in-progress') {
        return NextResponse.json(attempts, { status: 200 });
      } else {
        return NextResponse.json([], { status: 200 });
      }
    } else {
      // Return all attempts for this user and assessment
      const attempts = await (prisma as any).attempt.findMany({
        where,
        orderBy: [{ startedAt: 'desc' }],
      });
      return NextResponse.json(attempts, { status: 200 });
    }
  } catch (error) {
    console.error('GET attempts error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Log request details for debugging
    const body = await req.json();
    const userId = String(body.userId || '');
    const assessmentId = String(params.id || '');
    
    console.log("API DEBUG - Received request with:");
    console.log("userId:", userId);
    console.log("assessmentId:", assessmentId);
    
    if (!userId || !assessmentId) {
      return NextResponse.json({ error: 'Missing userId or assessmentId' }, { status: 400 });
    }

    // Verify these IDs exist before trying to create the relationship
    const userExists = await prisma.user.findUnique({ where: { id: userId }});
    const assessmentExists = await prisma.assessment.findUnique({ where: { id: assessmentId }});
    
    if (!userExists) {
      return NextResponse.json({ error: `User with ID ${userId} does not exist` }, { status: 404 });
    }
    
    if (!assessmentExists) {
      return NextResponse.json({ error: `Assessment with ID ${assessmentId} does not exist` }, { status: 404 });
    }
    
    try {
      // We confirmed the model name is 'attempt' (lowercase) in our debug route
      // Use type assertion to fix the linter error, since we confirmed the model exists
      const attempt = await (prisma as any).attempt.create({
        data: {
          userId,
          assessmentId,
          status: 'in-progress',
          startedAt: new Date(),
        },
      });
      return NextResponse.json(attempt, { status: 201 });
    } catch (error) {
      console.error("Prisma error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (outerError) {
    console.error("API route error:", outerError);
    return NextResponse.json(
      { error: outerError instanceof Error ? outerError.message : String(outerError) },
      { status: 500 }
    );
  }
} 