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
    // Debug: log the received tags
    
    // Handle both direct and nested codingQuestion structure
    const codingQuestion = body.codingQuestion || body;
    
    // Improved tag extraction - handle both string IDs and objects with id property
    const extractTagIds = (tagsArray: any[]): string[] => {
      return tagsArray.map((tag: any) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && tag.id) return tag.id;
        return null;
      }).filter(Boolean);
    };
    
    // Always prefer codingQuestion fields if present
    const languageOptions = body.codingQuestion?.languageOptions || body.languageOptions || [];
    const testCases = body.codingQuestion?.testCases || body.testCases || [];
    const tags = (body.codingQuestion?.tags && Array.isArray(body.codingQuestion.tags) && body.codingQuestion.tags.length > 0)
      ? extractTagIds(body.codingQuestion.tags)
      : (body.tags && Array.isArray(body.tags) && body.tags.length > 0)
        ? extractTagIds(body.tags)
        : [];

   

    // Validate that the tags exist before attempting to connect them
    if (tags.length > 0) {
      try {
        const existingTags = await prisma.tag.findMany({
          where: {
            id: {
              in: tags
            }
          },
          select: {
            id: true,
            name: true
          }
        });
        
    
        
        // If some tags weren't found, log a warning
        if (existingTags.length < tags.length) {
          const missingTagIds = tags.filter(tagId => !existingTags.some(t => t.id === tagId));
          console.warn(`Warning: ${missingTagIds.length} tag IDs were not found in the database:`, missingTagIds);
        }
      } catch (error) {
        console.error("Error validating tags:", error);
      }
    }

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
            tags: true
          },
        },
      },
    }) as any;

    if (!(existingQuestion as any) || !(existingQuestion as any).codingQuestion) {
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
    const codingQuestionId = (existingQuestion as any).codingQuestion.id;
    
    // Prepare language options and test cases for nested create
    const languageOptionsData = languageOptions.map((lang: any) => ({
      language: lang.language,
      solution: lang.solution || "",
      preloadCode: lang.preloadCode || ""
    }));
    const testCasesData = testCases.map((tc: any) => {
      const isSample = tc.type === 'sample' || tc.isSample;
      const isHidden = tc.type === 'hidden' || tc.isHidden;
      return {
        input: tc.input || "",
        output: tc.output || tc.expectedOutput || "",
        isSample,
        isHidden,
        showOnFailure: Boolean(tc.showOnFailure),
        gradePercentage: Number(tc.gradePercentage) || 0
      };
    });
   
    // Update the coding question and its relations in a single call
    await prisma.codingQuestion.update({
      where: { id: codingQuestionId },
      data: {
        questionText: body.questionText,
        defaultMark: Number(body.defaultMark) || 1,
        tags: {
          set: tags.map(tagId => ({ id: tagId }))
        },
        languageOptions: {
          deleteMany: {},
          create: languageOptionsData
        },
        testCases: {
          deleteMany: {},
          create: testCasesData
        }
      }
    });

    // Finally, fetch the updated question with all related data to return
    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true,
            tags: true
          },
        },
      },
    }) as any;

    // Format the response to ensure tags are included
    const formattedResponse = {
      ...updatedQuestion,
      codingQuestion: updatedQuestion.codingQuestion ? {
        ...updatedQuestion.codingQuestion,
        // Ensure tags are explicitly included and formatted properly
        tags: updatedQuestion.codingQuestion.tags || [],
        // Ensure language options are explicitly included
        languageOptions: updatedQuestion.codingQuestion.languageOptions || [],
        // Ensure test cases are explicitly included
        testCases: updatedQuestion.codingQuestion.testCases || []
      } : undefined,
      // Also include tags at the top level for consistency
      tags: updatedQuestion.codingQuestion?.tags || []
    };



    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Error updating coding question:", error);
    return NextResponse.json(
      { error: `Failed to update coding question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 