import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // Fetch assessment with related data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        createdBy: true,
        folder: true
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only allow creator or admin to view assessment details
    if (assessment.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "You don't have permission to view this assessment" },
        { status: 403 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
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
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: validation.data,
      include: {
        createdBy: true,
        folder: true
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