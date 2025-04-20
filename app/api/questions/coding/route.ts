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
    console.log("Request body:", JSON.stringify(body, null, 2));

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

    if (!body.codingQuestion?.languageOptions || !Array.isArray(body.codingQuestion.languageOptions) || body.codingQuestion.languageOptions.length === 0) {
      return NextResponse.json(
        { error: "At least one programming language is required" },
        { status: 400 }
      );
    }

    if (!body.codingQuestion?.testCases || !Array.isArray(body.codingQuestion.testCases) || body.codingQuestion.testCases.length === 0) {
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

      // Then create the coding question with the question ID
      const codingData = {
        questionId: question.id,
        questionText: body.questionText || body.description || "",
        defaultMark: Number(body.defaultMark) || 1,
        difficulty: body.codingQuestion?.difficulty || "MEDIUM",
        isAllOrNothing: Boolean(body.codingQuestion?.allOrNothingGrading),
        languageOptions: {
          create: body.codingQuestion?.languageOptions?.map((lang: any) => {
            // Map language string to a valid ProgrammingLanguage enum
            let mappedLanguage;
            switch(lang.language.toLowerCase()) {
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
                // Default to PYTHON if no match
                mappedLanguage = 'PYTHON';
            }
            
            return {
              language: mappedLanguage,
              solution: lang.solution || "",
              preloadCode: lang.preloadCode || "",
            };
          }) || []
        },
        testCases: {
          create: body.codingQuestion?.testCases?.map((tc: any) => {
            // Map type string to boolean fields
            const isSample = tc.type === 'sample';
            const isHidden = tc.type === 'hidden';
            
            // Make sure both flags are properly set based on the test case type
            // If it's a sample, it can't be hidden; if it's hidden, it can't be a sample
            return {
              input: tc.input || "",
              output: tc.output || "",
              isSample: isSample,
              isHidden: isHidden,
              showOnFailure: Boolean(tc.showOnFailure),
              grade: Number(tc.grade) || Number(tc.gradePercentage) || 0,
            };
          }) || []
        }
      };
      
      await tx.codingQuestion.create({
        data: codingData
      });

      // Return the created question with all related data
      return await tx.question.findUnique({
        where: { id: question.id },
        include: {
          folder: true,
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