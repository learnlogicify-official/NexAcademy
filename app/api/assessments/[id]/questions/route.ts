import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number().default(0),
  questions: z.array(z.string())
});

const updateQuestionsSchema = z.object({
  sections: z.array(sectionSchema)
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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
    const assessmentId = params.id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Validate body
    const body = await req.json();
    const validation = updateQuestionsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sections } = validation.data;

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

    // Only allow creator or admin to modify assessment
    if (assessment.createdBy.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "You don't have permission to modify this assessment" },
        { status: 403 }
      );
    }

    // Update assessment with new sections in a transaction
    const updatedAssessment = await prisma.$transaction(async (tx) => {
      // First, delete all existing sections
      await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          sections: {
            deleteMany: {},
            create: sections.map((section, index) => ({
              title: section.title,
              description: section.description,
              order: section.order ?? index,
              questions: {
                connect: section.questions.map(questionId => ({ id: questionId }))
              }
            }))
          }
        }
      });

      // Return the updated assessment with all relations
      return tx.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          sections: {
            include: {
              questions: true
            }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment
    });
  } catch (error) {
    console.error("Error updating assessment questions:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Unique constraint violation" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update assessment questions" },
      { status: 500 }
    );
  }
}