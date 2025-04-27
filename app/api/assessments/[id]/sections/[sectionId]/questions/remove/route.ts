import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { updateAssessmentTotalMarks } from "@/lib/utils/assessment-marks";

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

// Define schema for the request body
const removeQuestionsSchema = z.object({
  questionIds: z.array(z.string())
});

/**
 * POST - Remove questions from a specific section directly
 * This endpoint is optimized for removing questions from an existing section
 * Instead of updating the entire assessment, it only deletes the specific section-question relationships
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
    console.log("Received body for removing questions from section:", body);
    
    const validation = removeQuestionsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors }, 
        { status: 400 }
      );
    }
    
    const { questionIds } = validation.data;
    if (!questionIds.length) {
      return NextResponse.json({ message: "No questions to remove" }, { status: 200 });
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

    // Verify the section exists in this assessment
    const section = await prismaAny.section.findUnique({
      where: {
        id: sectionId,
        assessmentId
      }
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found in this assessment" }, { status: 404 });
    }

    console.log(`Removing ${questionIds.length} questions from section ${sectionId}`);

    // Delete the relationships directly
    try {
      const result = await prismaAny.sectionQuestion.deleteMany({
        where: {
          sectionId,
          questionId: {
            in: questionIds
          }
        }
      });

      console.log(`Deleted ${result.count} section-question relationships`);

      // Update the assessment's total marks after removing questions
      const updatedAssessment = await updateAssessmentTotalMarks(assessmentId);

      return NextResponse.json({
        message: `Removed ${result.count} questions from the section`,
        removedCount: result.count,
        totalMarks: updatedAssessment.totalMarks
      });
    } catch (error) {
      console.error("Error deleting section-question relationships:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}