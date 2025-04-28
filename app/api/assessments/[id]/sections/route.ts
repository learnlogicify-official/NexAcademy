import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sections } = await req.json();
    
    console.log('Received sections update request:', { assessmentId: params.id, sections });
    
    await prisma.$transaction(async (tx) => {
      for (const section of sections) {
        console.log(`Updating section ${section.id}:`, {
          shuffleQuestions: section.shuffleQuestions,
          timeLimitEnabled: section.timeLimitEnabled,
          timeLimit: section.timeLimit
        });
        
        await tx.section.update({
          where: { id: section.id },
          data: {
            shuffleQuestions: section.shuffleQuestions,
            timeLimitEnabled: section.timeLimitEnabled,
            timeLimit: section.timeLimit
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating section settings:', error);
    return NextResponse.json(
      { error: 'Failed to update section settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}