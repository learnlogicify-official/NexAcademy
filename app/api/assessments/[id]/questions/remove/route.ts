import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const removeQuestionsSchema = z.object({
  sectionId: z.string(),
  questionIds: z.array(z.string())
});

export async function POST(
  request: Request,
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

    // Get assessment ID from URL params
    const assessmentId = params.id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Validate body
    const body = await request.json();
    const validation = removeQuestionsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sectionId, questionIds } = validation.data;
    
    // Verify the section belongs to the assessment
    const section = await prisma.$queryRaw`
      SELECT id FROM "Section"
      WHERE id = ${sectionId}
      AND "assessmentId" = ${assessmentId}
      LIMIT 1
    `;

    if (!section || (Array.isArray(section) && section.length === 0)) {
      return NextResponse.json(
        { error: "Section not found or doesn't belong to this assessment" },
        { status: 404 }
      );
    }

    // Get the count of matching relationships
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "SectionQuestion"
      WHERE "sectionId" = ${sectionId}
      AND "questionId" IN (${Prisma.join(questionIds)})
    `;
    
    const count = Number((countResult as any)[0].count);

    // Delete the relationships
    await prisma.$executeRaw`
      DELETE FROM "SectionQuestion"
      WHERE "sectionId" = ${sectionId}
      AND "questionId" IN (${Prisma.join(questionIds)})
    `;

    return NextResponse.json({
      success: true,
      message: `Removed ${count} questions from section`,
      removedCount: count
    });
  } catch (error) {
    console.error("Error removing questions from section:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 