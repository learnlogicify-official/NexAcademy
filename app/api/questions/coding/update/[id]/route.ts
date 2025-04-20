import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { QuestionDifficulty } from "@prisma/client";

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

    // Debug existing question data
    console.log("Existing question:", {
      id: existingQuestion.id,
      name: existingQuestion.name,
      codingQuestionId: existingQuestion.codingQuestion.id,
      languageOptions: existingQuestion.codingQuestion.languageOptions.length,
      testCases: existingQuestion.codingQuestion.testCases.length
    });

    const codingQuestionId = existingQuestion.codingQuestion.id;
    const now = new Date();

    // First, update the main question
    await prisma.question.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status || "DRAFT",
        folderId: body.folderId,
        lastModifiedBy: session.user.id,
        lastModifiedByName: session.user.name || "Unknown User",
        updatedAt: now,
      },
    });

    // Debug language options and test cases from the request
    console.log("Language options from request:", body.languageOptions?.length || 0);
    console.log("Test cases from request:", body.testCases?.length || 0);

    // Then, update the coding question and its related data
    const updatedQuestion = await prisma.codingQuestion.update({
      where: { id: codingQuestionId },
      data: {
        questionText: body.questionText,
        defaultMark: Number(body.defaultMark) || 1,
        isAllOrNothing: {
          set: Boolean(body.allOrNothingGrading)
        },
        updatedAt: now,
        // Update difficulty separately to avoid type issues
        difficulty: {
          set: (body.difficulty?.toUpperCase() as QuestionDifficulty) || QuestionDifficulty.MEDIUM
        },
        languageOptions: {
          deleteMany: {},
          create: (body.languageOptions || []).map((lang: any) => {
            // Map language string to a valid ProgrammingLanguage enum
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

            console.log(`Mapping language ${lang.language} to ${mappedLanguage}`);
            
            return {
              language: mappedLanguage,
              solution: lang.solution || "",
              preloadCode: lang.preloadCode || "",
              createdAt: now,
              updatedAt: now,
            };
          }),
        },
        testCases: {
          deleteMany: {},
          create: (body.testCases || []).map((tc: any) => {
            // First, determine test case type from explicit type field or from isSample/isHidden flags
            let isSample = false;
            let isHidden = false;
            
            // Check the type field first (string-based approach)
            if (tc.type === 'sample') {
              isSample = true;
              isHidden = false;
            } else if (tc.type === 'hidden') {
              isSample = false;
              isHidden = true;
            } 
            // If no valid type, fallback to boolean flags
            else if (tc.isSample === true) {
              isSample = true;
              isHidden = false;
            } else if (tc.isHidden === true) {
              isSample = false; 
              isHidden = true;
            }
            
            // Default to hidden if no valid type information is provided
            if (!isSample && !isHidden) {
              console.log(`No valid type for test case, defaulting to hidden`);
              isHidden = true;
            }
            
            const gradeValue = parseFloat(tc.grade || tc.gradePercentage || "0");

            console.log(`Processing test case:`, {
              input: tc.input?.substring(0, 20) + "...",
              type: tc.type,
              isSample: isSample,
              isHidden: isHidden,
              originalIsSample: tc.isSample,
              originalIsHidden: tc.isHidden,
              grade: gradeValue
            });
            
            return {
              input: tc.input || "",
              output: tc.output || "",
              isSample,
              isHidden,
              showOnFailure: Boolean(tc.showOnFailure),
              grade: gradeValue,
              createdAt: now,
              updatedAt: now,
            };
          }),
        },
      },
      include: {
        languageOptions: true,
        testCases: true,
        question: true,
      },
    });

    // Debug updated question data
    console.log("Updated question:", {
      id: updatedQuestion.id,
      languageOptions: updatedQuestion.languageOptions.length,
      testCases: updatedQuestion.testCases.length
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