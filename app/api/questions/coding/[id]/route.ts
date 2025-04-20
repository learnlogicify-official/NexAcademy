import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Update request body:", JSON.stringify(body, null, 2));

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    // Check if the coding question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true,
          },
        },
      },
    });

    if (!existingQuestion || !existingQuestion.codingQuestion) {
      return NextResponse.json(
        { error: "Coding question not found" },
        { status: 404 }
      );
    }

    // Determine whether we need to update the coding question
    const questionUpdate = {
      name: body.name,
      status: body.status || "DRAFT",
      folderId: body.folderId,
      lastModifiedBy: session.user.id,
      lastModifiedByName: session.user.name || "Unknown User",
    };

    // First, update the question itself
    await prisma.question.update({
      where: { id },
      data: questionUpdate,
    });

    // Then separately update the coding question part
    const codingQuestionId = existingQuestion.codingQuestion.id;
    
    // Update questionText and defaultMark
    await prisma.codingQuestion.update({
      where: { id: codingQuestionId },
      data: {
        questionText: body.questionText,
        defaultMark: Number(body.defaultMark) || 1,
      },
    });

    // Delete old language options
    await prisma.languageOption.deleteMany({
      where: { codingQuestionId },
    });

    // Create new language options
    for (const lang of body.languageOptions || []) {
      await prisma.languageOption.create({
        data: {
          codingQuestionId,
          language: lang.language,
          solution: lang.solution || "",
          preloadCode: lang.preloadCode || "",
        },
      });
    }

    // Delete old test cases
    await prisma.testCase.deleteMany({
      where: { codingQuestionId },
    });

    // Create new test cases
    for (const tc of body.testCases || []) {
      // Map type string to boolean fields
      const isSample = tc.type === 'sample';
      const isHidden = tc.type === 'hidden';
      
      // Calculate the grade value as a number
      const gradeValue = parseFloat(tc.grade || tc.gradePercentage || "0");
      
      await prisma.testCase.create({
        data: {
          codingQuestionId,
          input: tc.input || "",
          output: tc.output || "",
          isSample,
          isHidden,
          showOnFailure: Boolean(tc.showOnFailure),
          grade: gradeValue, // Ensure this matches the schema definition
        },
      });
    }

    // Finally, fetch the updated question with all related data to return
    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true,
          },
        },
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating coding question:", error);
    return NextResponse.json(
      { error: `Failed to update coding question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 