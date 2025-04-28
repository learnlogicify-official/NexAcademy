import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

const updateAssessmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "READY", "PUBLISHED", "ARCHIVED"]).optional(),
  totalMarks: z.number().int().positive().optional(),
  passingMarks: z.number().int().min(0).optional(),
  folderId: z.string().min(1).optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  timeBoundEnabled: z.boolean().optional(),
  timeLimitEnabled: z.boolean().optional(),
  navigationMethod: z.string().optional(),
  shuffleWithinQuestions: z.boolean().optional(),
  questionBehaviourMode: z.string().optional(),
  unlimitedAttempts: z.boolean().optional(),
  attemptsAllowed: z.number().int().nullable().optional(),
  reviewDuringAttempt: z.boolean().optional(),
  reviewImmediatelyAfterAttempt: z.boolean().optional(),
  reviewLaterWhileOpen: z.boolean().optional(),
  reviewAfterClose: z.boolean().optional(),
  proctoring: z.enum(["proctoring", "not_proctoring"]).optional(),
  disableRightClick: z.boolean().optional(),
  disableCopyPaste: z.boolean().optional(),
  gradeToPass: z.number().optional(),
  displayDescription: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = new URL(req.url);
    
    // Check if we should include SectionMarks in the response
    const includeSectionMarks = url.searchParams.get('includeSectionMarks') === 'true';
    // Check if we should include order in the response
    const includeOrder = url.searchParams.get('includeOrder') === 'true';
    
    console.log(`Getting assessment ${id} with includeSectionMarks=${includeSectionMarks}, includeOrder=${includeOrder}`);

    // Get assessment data
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        tags: {
          include: {
            tag: true
          }
        },
        sections: {
          orderBy: {
            order: 'asc'
          },
          include: {
            questions: includeOrder ? {
              orderBy: {
                order: 'asc'
              },
              include: {
                question: {
                  include: {
                    mCQQuestion: true,
                    codingQuestion: true
                  }
                }
              }
            } : true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Format the sections to include question data with order if requested
    const formattedSections = assessment.sections.map(section => {
      // Format the questions based on the section.questions data
      const formattedQuestions = section.questions.map((sq: any) => {
        // Include proper order information if requested
        if (includeOrder) {
          return {
            id: sq.questionId,
            sectionMark: sq.sectionMark,
            order: sq.order || 0,
            // Include additional question data if available
            ...(sq.question && {
              name: sq.question.name,
              type: sq.question.type,
              status: sq.question.status,
              marks: sq.question.mCQQuestion?.defaultMark || sq.question.codingQuestion?.defaultMark || 1
            })
          };
        }
        
        // Default format without explicit order
        return {
          id: sq.questionId,
          sectionMark: sq.sectionMark
        };
      });

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        shuffleQuestions: section.shuffleQuestions,
        timeLimitEnabled: section.timeLimitEnabled,
        timeLimit: section.timeLimit,
        questions: formattedQuestions
      };
    });

    // Return the assessment with formatted sections
    return NextResponse.json({
      ...assessment,
      sections: formattedSections
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate assessment ID
    const resolvedParams = await params;
    const assessmentId = resolvedParams.id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = updateAssessmentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check if assessment exists and user has access
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { createdBy: true }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only allow creator or admin to update assessment
    if (assessment.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "You don't have permission to modify this assessment" },
        { status: 403 }
      );
    }

    // Update assessment
    const updatedAssessment = await prismaAny.assessment.update({
      where: { id: assessmentId },
      data: validation.data,
      include: {
        createdBy: true,
        folder: true,
        sections: true
      }
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
} 