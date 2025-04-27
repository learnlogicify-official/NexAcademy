import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define schema for the request body
const orderUpdateSchema = z.object({
  sectionId: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
      sectionMark: z.number().optional()
    })
  )
});

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

/**
 * PUT - Update question order within a section
 * This endpoint is optimized for reordering questions within a section
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate IDs
    const { id: assessmentId, sectionId } = params;
    if (!assessmentId || !sectionId) {
      return NextResponse.json({ error: "Assessment ID and Section ID are required" }, { status: 400 });
    }

    // Parse and validate the request body
    const body = await req.json();
    console.log("Received body for updating question order:", body);
    
    const validation = orderUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors }, 
        { status: 400 }
      );
    }
    
    const { questions } = validation.data;
    if (!questions.length) {
      return NextResponse.json({ message: "No questions to reorder" }, { status: 200 });
    }

    // Check if the assessment exists and the user has access
    const assessment = await prismaAny.assessment.findUnique({
      where: { id: assessmentId },
      include: { createdBy: true }
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Only allow creator or admin to modify
    if (assessment.createdBy.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "You don't have permission to modify this assessment" },
        { status: 403 }
      );
    }

    // Check if the section exists and belongs to this assessment
    const section = await prismaAny.section.findUnique({
      where: { 
        id: sectionId,
        assessmentId 
      }
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found in this assessment" }, { status: 404 });
    }

    // Get question IDs to verify they exist
    const questionIds = questions.map(q => q.id);
    const existingQuestions = await prismaAny.question.findMany({
      where: {
        id: {
          in: questionIds
        }
      },
      select: {
        id: true
      }
    });

    const existingQuestionIds = existingQuestions.map((q: { id: string }) => q.id);
    console.log(`Found ${existingQuestions.length} valid questions out of ${questions.length} requested`);

    // Check if any questions don't exist
    const nonExistentQuestions = questionIds.filter(id => !existingQuestionIds.includes(id));
    if (nonExistentQuestions.length > 0) {
      console.warn(`Skipping ${nonExistentQuestions.length} non-existent questions`);
    }

    // Process all updates in a transaction for data consistency
    const result = await prismaAny.$transaction(async (tx: any) => {
      // First, get all existing SectionQuestions to check what exists
      const existingSectionQuestions = await tx.sectionQuestion.findMany({
        where: {
          sectionId,
          questionId: {
            in: existingQuestionIds
          }
        }
      });

      const existingSQMap = new Map();
      existingSectionQuestions.forEach((sq: any) => {
        existingSQMap.set(sq.questionId, sq);
      });

      // Process each question in the request
      for (const [index, question] of questions.entries()) {
        if (!existingQuestionIds.includes(question.id)) {
          continue; // Skip non-existent questions
        }

        const existingSQ = existingSQMap.get(question.id);
        
        if (existingSQ) {
          // Update existing relationship with new order and potentially new sectionMark
          await tx.sectionQuestion.update({
            where: {
              id: existingSQ.id
            },
            data: {
              order: question.order !== undefined ? question.order : index,
              sectionMark: question.sectionMark
            }
          });
        } else {
          // Create new relationship if it doesn't exist
          await tx.sectionQuestion.create({
            data: {
              sectionId,
              questionId: question.id,
              order: question.order !== undefined ? question.order : index,
              sectionMark: question.sectionMark
            }
          });
        }
      }

      return { success: true, updatedCount: questions.length };
    });

    return NextResponse.json({
      message: `Updated order for ${result.updatedCount} questions in the section`,
      updatedCount: result.updatedCount
    });
  } catch (error) {
    console.error("Error in PUT handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 