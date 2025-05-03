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

   

    // Prepare language options and test cases for update
    const languageOptionsToCreate = (body.languageOptions || []).map((lang: any) => {
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
        language: mappedLanguage,
        solution: lang.solution || "",
        preloadCode: lang.preloadCode || "",
        createdAt: now,
        updatedAt: now,
      };
    });
    
    
    
    // Prepare test cases for update
    const testCasesToCreate = (body.testCases || []).map((tc: any, index: number) => {
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
        
        isHidden = true;
      }
      
      const gradeValue = parseFloat(tc.grade || tc.gradePercentage || "0");

      
      
     
      
      // Use Boolean() directly to convert the value properly
      const showOnFailureValue = Boolean(tc.showOnFailure);
     
      
      return {
        input: tc.input || "",
        output: tc.output || "",
        isSample,
        isHidden,
        showOnFailure: showOnFailureValue,
        grade: gradeValue,
        createdAt: now,
        updatedAt: now,
        gradePercentage: gradeValue,
      };
    });
    
    console.log("UPDATE - testCasesToCreate:", testCasesToCreate);

    // Then, update the coding question and its related data
    const updatedQuestion = await prisma.codingQuestion.update({
      
      where: { id: codingQuestionId },
      data: {
        questionText: body.questionText,
        defaultMark: Number(body.defaultMark) || 1,
        isAllOrNothing: {
          set: Boolean(body.codingQuestion?.allOrNothingGrading)
        },
        tags: {
          set: body.tags.map((tagId: string) => ({ id: tagId }))
        },
        updatedAt: now,
        // Update difficulty separately to avoid type issues
        difficulty: {
          set: (body.difficulty?.toUpperCase() as QuestionDifficulty) || QuestionDifficulty.MEDIUM
        },
        languageOptions: {
          deleteMany: {},
          create: languageOptionsToCreate,
        },
        testCases: {
          deleteMany: {},
          create: testCasesToCreate,
        },
      },
      include: {
        languageOptions: true,
        testCases: true,
        question: true,
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