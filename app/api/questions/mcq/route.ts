import { QuestionType, QuestionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();


    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Question name is required" },
        { status: 400 }
      );
    }

    if (!body.folderId) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    if (!body.mCQQuestion?.options || !Array.isArray(body.mCQQuestion.options) || body.mCQQuestion.options.length === 0) {
      return NextResponse.json(
        { error: "At least one option is required for MCQ questions" },
        { status: 400 }
      );
    }

    // Validate that at least one option has a grade > 0
    const hasCorrectAnswer = body.mCQQuestion.options.some((option: any) => {
      const grade = typeof option.grade === 'string' 
        ? parseFloat(option.grade.replace('%', '')) 
        : option.grade;
      return grade > 0;
    });

    if (!hasCorrectAnswer) {
      return NextResponse.json(
        { error: "At least one option must be marked as correct" },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (body.difficulty && !["EASY", "MEDIUM", "HARD"].includes(body.difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level. Must be EASY, MEDIUM, or HARD" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the base question
      const questionData = {
        name: body.name,
        type: "MCQ" as QuestionType,
        status: body.status || "DRAFT" as QuestionStatus,
        folderId: body.folderId,
        creatorId: session.user.id,
        creatorName: session.user.name || "Unknown User",
        lastModifiedBy: session.user.id,
        lastModifiedByName: session.user.name || "Unknown User"
      };
      
     
      
      const question = await tx.question.create({
        data: questionData
      });

      const mcqData = {
        questionId: question.id,
        questionText: body.questionText || body.description || "",
        defaultMark: Number(body.defaultMark) || 1,
        difficulty: body.difficulty || "MEDIUM",
        tags: body.tags || [],
        isMultiple: Boolean(body.isMultiple),
        shuffleChoice: Boolean(body.shuffleChoice),
        generalFeedback: body.generalFeedback || "",
        options: {
          create: body.mCQQuestion.options.map((option: any) => ({
            text: option.text || "",
            grade: typeof option.grade === 'string' 
              ? parseFloat(option.grade.replace('%', '')) / 100
              : option.grade,
            feedback: option.feedback || "",
          }))
        },
      };
      
      await tx.mCQQuestion.create({
        data: mcqData
      });

      // Return the created question with all related data
      return await tx.question.findUnique({
        where: { id: question.id },
        include: {
          folder: true,
          mCQQuestion: {
            include: {
              options: true,
            },
          },
        },
      });
    });

    // Transform the result to match the frontend expectations
    const formattedResult = result ? {
      ...result,
      content: result.mCQQuestion?.questionText || result.name,
      mcqQuestion: result.mCQQuestion ? {
        ...result.mCQQuestion,
        content: result.mCQQuestion.questionText,
        options: result.mCQQuestion.options.map(opt => opt.text)
      } : undefined,
    } : result;

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error creating MCQ question:", error);
    return NextResponse.json(
      { error: `Failed to create MCQ question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 