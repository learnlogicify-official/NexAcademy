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

    // Handle both direct and nested codingQuestion structure
    const codingQuestion = body.codingQuestion || body;
    
    if (!codingQuestion.languageOptions || !Array.isArray(codingQuestion.languageOptions) || codingQuestion.languageOptions.length === 0) {
      return NextResponse.json(
        { error: "At least one programming language is required" },
        { status: 400 }
      );
    }

    if (!codingQuestion.testCases || !Array.isArray(codingQuestion.testCases) || codingQuestion.testCases.length === 0) {
      return NextResponse.json(
        { error: "At least one test case is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the question first
      const question = await tx.question.create({
        data: {
          name: body.name,
          type: "CODING" as QuestionType,
          status: body.status || "DRAFT" as QuestionStatus,
          version: body.version,
          folderId: body.folderId,
          creatorId: session.user.id,
          creatorName: session.user.name || "Unknown User",
          lastModifiedBy: session.user.id,
          lastModifiedByName: session.user.name || "Unknown User"
        }
      });

      // Prepare language options data
      const languageOptionsData = codingQuestion.languageOptions.map((lang: any) => {
        let mappedLanguage;
        switch((lang.language || "").toLowerCase()) {
          case 'python':
          case 'python2':
          case 'python3':
            mappedLanguage = 'PYTHON';
            break;
          case 'javascript':
          case 'js':
            mappedLanguage = 'JAVASCRIPT';
            break;
          case 'java':
            mappedLanguage = 'JAVA';
            break;
          case 'cpp':
          case 'c++':
          case 'c':
            mappedLanguage = 'CPP';
            break;
          case 'csharp':
          case 'c#':
            mappedLanguage = 'CSHARP';
            break;
          case 'php':
            mappedLanguage = 'PHP';
            break;
          case 'ruby':
            mappedLanguage = 'RUBY';
            break;
          case 'swift':
            mappedLanguage = 'SWIFT';
            break;
          case 'go':
            mappedLanguage = 'GO';
            break;
          case 'rust':
            mappedLanguage = 'RUST';
            break;
          default:
            mappedLanguage = 'PYTHON';
        }
        
        return {
          language: mappedLanguage,
          solution: lang.solution || "",
          preloadCode: lang.preloadCode || "",
        };
      });

      // Prepare test cases data
      const testCasesData = codingQuestion.testCases.map((tc: any) => {
        const isSample = tc.type === 'sample' || tc.isSample;
        const isHidden = tc.type === 'hidden' || tc.isHidden;
        
        return {
          input: tc.input || "",
          output: tc.output || tc.expectedOutput || "",
          isSample,
          isHidden,
          showOnFailure: Boolean(tc.showOnFailure),
          grade: Number(tc.grade) || Number(tc.gradePercentage) || 0,
        };
      });

      // Create coding question with prepared data
      const createdCodingQuestion = await tx.codingQuestion.create({
        data: {
          questionId: question.id,
          questionText: codingQuestion.questionText || body.questionText || body.description || "",
          defaultMark: Number(codingQuestion.defaultMark) || Number(body.defaultMark) || 1,
          difficulty: codingQuestion.difficulty || body.difficulty || "MEDIUM",
          isAllOrNothing: Boolean(codingQuestion.allOrNothingGrading || body.allOrNothingGrading || body.codingQuestion?.allOrNothingGrading),
          languageOptions: {
            create: languageOptionsData
          },
          testCases: {
            create: testCasesData
          }
        },
        include: {
          languageOptions: true,
          testCases: true
        }
      });

      // Return minimal data needed for response
      return {
        ...question,
        codingQuestion: createdCodingQuestion
      };
    }, {
      timeout: 10000, // Increase transaction timeout to 10 seconds
      maxWait: 5000,  // Maximum time to wait for a transaction
      isolationLevel: 'ReadCommitted' // Use a less restrictive isolation level
    });

    // Transform the result to match the frontend expectations
    const formattedResult = result ? {
      ...result,
      content: result.codingQuestion?.questionText || result.name,
      codingQuestion: result.codingQuestion ? {
        ...result.codingQuestion,
        content: result.codingQuestion.questionText,
      } : undefined,
    } : result;

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error creating coding question:", error);
    return NextResponse.json(
      { error: `Failed to create coding question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 