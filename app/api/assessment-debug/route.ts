import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get list of valid model names in Prisma client
    const modelNames = Object.keys(prisma).filter(key => !key.startsWith('_'));
    
    // Check if we have an assessment model
    if ('assessment' in prisma) {
      const assessments = await (prisma as any).assessment.findMany({
        select: {
          id: true,
          name: true,
          status: true
        },
        take: 10
      });
      return NextResponse.json({ assessments, modelNames });
    } else {
      return NextResponse.json({ 
        error: 'Assessment model not found in Prisma client',
        availableModels: modelNames
      });
    }
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 