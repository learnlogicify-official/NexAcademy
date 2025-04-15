import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("Fetching questions...");
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const subfolderId = searchParams.get("subfolderId");

    console.log("Query params:", { folderId, subfolderId });

    const where: any = {};

    if (folderId) {
      where.folderId = folderId;
    }

    if (subfolderId) {
      where.subfolderId = subfolderId;
    }

    console.log("Where clause:", where);

    const questions = await prisma.question.findMany({
      where,
      include: {
        folder: true,
        subfolder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found questions:", questions);
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch questions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, question, folderId, subfolderId, options, correctAnswer, testCases, expectedOutput } = data;

    const newQuestion = await prisma.question.create({
      data: {
        type,
        question,
        folderId,
        subfolderId,
        options: type === "MULTIPLE_CHOICE" ? options : undefined,
        correctAnswer: type === "MULTIPLE_CHOICE" ? correctAnswer : undefined,
        testCases: type === "CODING" ? testCases : undefined,
        expectedOutput: type === "CODING" ? expectedOutput : undefined,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 