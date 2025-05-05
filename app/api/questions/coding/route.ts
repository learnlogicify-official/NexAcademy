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
    
    // Debug: log the received tags
  
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
    
    // Improved tag extraction - handle both string IDs and objects with id property
    const extractTagIds = (tagsArray: any[]): string[] => {
      return tagsArray.map((tag: any) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && tag.id) return tag.id;
        return null;
      }).filter(Boolean);
    };
    
    // Accept tags from either codingQuestion.tags or top-level tags
    const tags = (codingQuestion.tags && Array.isArray(codingQuestion.tags) && codingQuestion.tags.length > 0)
      ? extractTagIds(codingQuestion.tags)
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
          },
          // Add direct tag connection in the create call
          tags: tags.length > 0 ? {
            connect: tags.map(tagId => ({ id: tagId }))
          } : undefined
        },
        include: {
          languageOptions: true,
          testCases: true,
          tags: true
        }
      });

      // Add additional verification of tags
      if (tags.length > 0) {
   
        try {
          // Get tags directly from the created coding question
          const updatedCodingQuestion = await tx.codingQuestion.findUnique({
            where: { id: createdCodingQuestion.id },
            include: {
              tags: true
            }
          });
          
            
            
          // If tags are still missing, try one last approach as a fallback
          if (!updatedCodingQuestion?.tags || updatedCodingQuestion.tags.length === 0) {
            
            // Get the actual column names from the database for debugging
            const schema = await tx.$queryRaw`
              SELECT column_name, data_type
              FROM information_schema.columns 
              WHERE table_name = '_CodingQuestionTags'
            `;
            
            // Use raw SQL to connect tags directly in the join table
            for (const tagId of tags) {
              if (typeof tagId === 'string' && tagId.trim()) {
                // Log each tag connection attempt
                
                // Try with explicit column names based on schema inspection
                try {
                  // The standard Prisma naming convention for implicit many-to-many relations is A and B
                  await tx.$executeRaw`
                    INSERT INTO "_CodingQuestionTags" ("A", "B")
                    VALUES (${createdCodingQuestion.id}, ${tagId})
                    ON CONFLICT DO NOTHING
                  `;
                } catch (innerError) {
                  console.error(`Error with standard column names for tag ${tagId}:`, innerError);
                  
                  // Try alternative column naming that might be used
                  try {
                    await tx.$executeRaw`
                      INSERT INTO "_CodingQuestionTags" ("codingQuestionId", "tagId")
                      VALUES (${createdCodingQuestion.id}, ${tagId})
                      ON CONFLICT DO NOTHING
                    `;
                  } catch (altError) {
                    console.error(`Error with alternative column names for tag ${tagId}:`, altError);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error verifying tags:", error);
        }
      }

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
        // Ensure tags are explicitly included in the response
        tags: result.codingQuestion.tags || [],
        // Ensure language options are explicitly included
        languageOptions: result.codingQuestion.languageOptions || [],
        // Ensure test cases are explicitly included
        testCases: result.codingQuestion.testCases || []
      } : undefined,
      // Also include tags at the top level for consistency
      tags: result.codingQuestion?.tags || []
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;

    const [codingQuestions, total] = await Promise.all([
      prisma.codingQuestion.findMany({
        include: {
          question: true,
          tags: true,
          languageOptions: true,
          testCases: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.codingQuestion.count(),
    ]);

    return NextResponse.json({ codingQuestions, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch coding questions" },
      { status: 500 }
    );
  }
} 