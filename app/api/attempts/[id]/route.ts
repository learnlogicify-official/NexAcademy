import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attemptId = params.id;
    
    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attempt ID' }, { status: 400 });
    }

    // Find the attempt with the given ID
    const attempt = await (prisma as any).attempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          select: {
            id: true,
            name: true,
            duration: true,
            totalMarks: true,
            passingMarks: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!attempt) {
      return NextResponse.json({ error: `Attempt with ID ${attemptId} not found` }, { status: 404 });
    }
    
    return NextResponse.json(attempt, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attemptId = params.id;
    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attempt ID' }, { status: 400 });
    }
    const body = await req.json();
    // Accepts { answers, flags, finish } or { answers } or { flags }
    const { answers, flags, finish } = body;

    // Fetch current attempt
    const attempt = await (prisma as any).attempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      return NextResponse.json({ error: `Attempt with ID ${attemptId} not found` }, { status: 404 });
    }

    // Merge new data into answers JSON
    let updatedAnswers = attempt.answers || {};
    if (answers) {
      updatedAnswers.answers = { ...(updatedAnswers.answers || {}), ...answers };
    }
    if (flags) {
      updatedAnswers.flags = { ...(updatedAnswers.flags || {}), ...flags };
    }

    const updateData: any = { answers: updatedAnswers };
    if (finish) {
      updateData.status = 'completed';
      updateData.endedAt = new Date();
    }

    const updated = await (prisma as any).attempt.update({
      where: { id: attemptId },
      data: updateData,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PATCH attempt error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 