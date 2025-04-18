import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const { folderId, subfolderId, ...updateData } = data;

    // Validate required fields
    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    console.log('Updating question with data:', { id, ...data });

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question: updateData.question,
        type: updateData.type,
        options: updateData.options || [],
        correctAnswer: updateData.correctAnswer || null,
        testCases: updateData.testCases || null,
        expectedOutput: updateData.expectedOutput || null,
        marks: updateData.marks || 1,
        singleAnswer: updateData.singleAnswer || false,
        shuffleAnswers: updateData.shuffleAnswers || false,
        status: updateData.status || 'DRAFT',
        hidden: updateData.hidden || false,
        folderId,
        subfolderId: subfolderId || null,
      },
      include: {
        folder: true,
        subfolder: true
      }
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
} 