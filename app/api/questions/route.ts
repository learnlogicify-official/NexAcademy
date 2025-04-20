import { QuestionType, QuestionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (folderId) {
      where.folderId = folderId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mCQQuestion: { questionText: { contains: search, mode: "insensitive" } } },
        { codingQuestion: { questionText: { contains: search, mode: "insensitive" } } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        folder: true,
        mCQQuestion: {
          include: {
            options: true,
          },
        },
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true,
          },
        },
      },
    });

    // Transform the results to match the frontend expectations
    const transformedQuestions = questions.map(question => {
      return {
        id: question.id,
        name: question.name,
        type: question.type,
        status: question.status,
        folderId: question.folderId,
        folder: question.folder,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        // Add content field which is used by the frontend for display
        content: question.mCQQuestion?.questionText || question.codingQuestion?.questionText || question.name,
        // Format mcqQuestion for frontend
        mcqQuestion: question.mCQQuestion ? {
          ...question.mCQQuestion,
          content: question.mCQQuestion.questionText,
          options: question.mCQQuestion.options.map(opt => opt.text)
        } : undefined,
        // Format codingQuestion for frontend
        codingQuestion: question.codingQuestion ? {
          ...question.codingQuestion,
          content: question.codingQuestion.questionText
        } : undefined
      };
    });

    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Question name is required" },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { error: "Question type is required" },
        { status: 400 }
      );
    }

    if (!body.folderId) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (body.type === "MCQ") {
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
    } else if (body.type === "CODING") {
      if (!body.codingQuestion?.languageOptions || !Array.isArray(body.codingQuestion.languageOptions) || body.codingQuestion.languageOptions.length === 0) {
        return NextResponse.json(
          { error: "At least one programming language is required for coding questions" },
          { status: 400 }
        );
      }

      if (!body.codingQuestion?.testCases || !Array.isArray(body.codingQuestion.testCases) || body.codingQuestion.testCases.length === 0) {
        return NextResponse.json(
          { error: "At least one test case is required for coding questions" },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the base question
      const questionData = {
        name: body.name,
        type: body.type,
        status: body.status || "DRAFT",
        folderId: body.folderId,
      };
      
      console.log("Creating question with data:", questionData);
      
      const question = await tx.question.create({
        data: questionData
      });

      if (body.type === "MCQ") {
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
      } else if (body.type === "CODING") {
        await tx.codingQuestion.create({
          data: {
            questionId: question.id,
            questionText: body.questionText || body.description || "",
            languageOptions: {
              create: body.codingQuestion.languageOptions.map((lang: any) => ({
                language: lang,
                solution: body.solution || "",
              }))
            },
            testCases: {
              create: body.codingQuestion.testCases.map((testCase: any) => ({
                input: testCase.input || "",
                output: testCase.expectedOutput || testCase.output || "",
                isHidden: Boolean(testCase.isHidden),
                isSample: Boolean(testCase.isSample),
                showOnFailure: Boolean(testCase.showOnFailure),
              }))
            },
          },
        });
      }

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
          codingQuestion: {
            include: {
              languageOptions: true,
              testCases: true,
            },
          },
        },
      });
    });

    // Transform the result to match the frontend expectations
    const formattedResult = result ? {
      ...result,
      content: result.mCQQuestion?.questionText || result.codingQuestion?.questionText || result.name,
      mcqQuestion: result.mCQQuestion ? {
        ...result.mCQQuestion,
        content: result.mCQQuestion.questionText,
        options: result.mCQQuestion.options.map(opt => opt.text)
      } : undefined,
      codingQuestion: result.codingQuestion ? {
        ...result.codingQuestion,
        content: result.codingQuestion.questionText
      } : undefined
    } : result;

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: `Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}