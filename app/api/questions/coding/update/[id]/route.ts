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

    const codingQuestionId = existingQuestion.codingQuestion.id;
    const now = new Date();

    // Use a transaction to ensure all updates are atomic
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // 1. Update the main question
      const updatedMainQuestion = await tx.question.update({
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

      // 2. Update the coding question
      const updatedCodingQuestion = await tx.codingQuestion.update({
        where: { id: codingQuestionId },
        data: {
          questionText: body.questionText,
          defaultMark: Number(body.defaultMark) || 1,
          difficulty: body.difficulty || "MEDIUM",
          updatedAt: now,
        },
      });

      // 3. Delete old language options and test cases
      await tx.languageOption.deleteMany({
        where: { codingQuestionId },
      });

      await tx.testCase.deleteMany({
        where: { codingQuestionId },
      });

      // 4. Create new language options
      const languageOptions = (body.languageOptions || []).map((lang: any) => {
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

        return {
          id: `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          language: mappedLanguage,
          solution: lang.solution || "",
          preloadCode: lang.preloadCode || "",
          codingQuestionId,
          createdAt: now,
          updatedAt: now,
        };
      });

      await tx.languageOption.createMany({
        data: languageOptions,
      });

      // 5. Create new test cases
      const testCases = (body.testCases || []).map((tc: any) => {
        const isSample = tc.type === 'sample';
        const isHidden = tc.type === 'hidden';
        const gradeValue = parseFloat(tc.grade || tc.gradePercentage || "0");

        return {
          id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          input: tc.input || "",
          output: tc.output || "",
          isSample,
          isHidden,
          showOnFailure: Boolean(tc.showOnFailure),
          grade: gradeValue,
          codingQuestionId,
          createdAt: now,
          updatedAt: now,
        };
      });

      await tx.testCase.createMany({
        data: testCases,
      });

      // Return the updated question with all related data
      return tx.question.findUnique({
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