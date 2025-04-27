import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { updateAssessmentTotalMarks } from "@/lib/utils/assessment-marks";

// Define schema for the request body
const addQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      sectionMark: z.number().optional().nullable()
    })
  )
});

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

/**
 * POST - Add questions to a specific section directly
 * This endpoint is optimized for adding questions to an existing section
 * Instead of updating the entire assessment, it only creates the new section-question relationships
 */
export async function POST(
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
    console.log("Received body for adding questions to section:", body);
    
    const validation = addQuestionsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors }, 
        { status: 400 }
      );
    }
    
    const { questions } = validation.data;
    if (!questions.length) {
      return NextResponse.json({ message: "No questions to add" }, { status: 200 });
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

    // Check if the section exists
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

    // Check for existing relationships to avoid duplicates
    const existingRelationships = await prismaAny.sectionQuestion.findMany({
      where: {
        sectionId,
        questionId: {
          in: existingQuestionIds
        }
      },
      select: {
        questionId: true
      }
    });

    const existingRelationshipIds = existingRelationships.map((r: { questionId: string }) => r.questionId);
    
    // Filter out questions that already have relationships
    const newQuestionData = questions
      .filter(q => existingQuestionIds.includes(q.id))
      .filter(q => !existingRelationshipIds.includes(q.id))
      .map((q, index) => ({
        sectionId,
        questionId: q.id,
        order: index,
        sectionMark: q.sectionMark
      }));

    console.log(`Adding ${newQuestionData.length} new questions to section ${sectionId}`);

    // Create the relationships in bulk for better performance
    if (newQuestionData.length > 0) {
      try {
        const result = await prismaAny.sectionQuestion.createMany({
          data: newQuestionData,
          skipDuplicates: true
        });

        console.log(`Created ${result.count} section-question relationships`);

        // Update the assessment's total marks after adding questions
        const updatedAssessment = await updateAssessmentTotalMarks(assessmentId);

        return NextResponse.json({
          message: `Added ${result.count} questions to the section`,
          addedCount: result.count,
          skippedCount: questions.length - result.count,
          totalMarks: updatedAssessment.totalMarks
        });
      } catch (error) {
        console.error("Error creating section-question relationships:", error);
        throw error;
      }
    } else {
      return NextResponse.json({
        message: "No new questions to add (all questions already in section)",
        addedCount: 0,
        skippedCount: questions.length
      });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}