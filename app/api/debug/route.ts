import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Get the assessment with its sections
    const assessment = await prismaAny.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        sections: true
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Execute raw query to check if sections are in the database
    const rawSections = await prisma.$queryRaw`
      SELECT * FROM "Section" WHERE "assessmentId" = ${assessmentId}
    `;

    return NextResponse.json({
      assessment,
      sections: assessment.sections,
      rawSections,
      databaseInfo: {
        url: process.env.DATABASE_URL?.split('@')[1] || 'hidden',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { assessmentId } = await req.json();
    
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check if assessment exists
    const assessment = await prismaAny.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Create a test section using direct SQL
    try {
      await prisma.$executeRaw`
        INSERT INTO "Section" ("id", "title", "description", "order", "assessmentId", "createdAt", "updatedAt")
        VALUES (
          concat('debug-', ${new Date().getTime()}),
          'Debug Test Section',
          'Created via debug endpoint',
          0,
          ${assessmentId},
          NOW(),
          NOW()
        )
      `;
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError },
        { status: 500 }
      );
    }

    // Try to create a section using Prisma model
    try {
      await prismaAny.section.create({
        data: {
          id: `debug-prisma-${new Date().getTime()}`,
          title: "Debug Prisma Section",
          description: "Created via Prisma",
          order: 1,
          assessment: {
            connect: { id: assessmentId }
          }
        }
      });
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);
    }

    // Get the sections after attempting to create them
    const sections = await prisma.$queryRaw`
      SELECT * FROM "Section" WHERE "assessmentId" = ${assessmentId}
    `;

    return NextResponse.json({
      success: true,
      message: "Debug operations completed",
      sections
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
} 