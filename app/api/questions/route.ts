import { QuestionType, QuestionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeSubcategories = searchParams.get("includeSubcategories") === "true";

    console.log("Raw request params:", {
      type,
      status,
      folderId,
      search,
      page,
      limit,
      includeSubcategories
    });

    const where: any = {};

    if (type) {
      // Convert MULTIPLE_CHOICE to MCQ for compatibility
      where.type = type === "MULTIPLE_CHOICE" ? "MCQ" : type;
    }

    if (status) {
      // Make sure the status matches the exact value needed by the database
      // First convert to uppercase to normalize
      const normalizedStatus = status.toUpperCase();
      
      // Log to help with debugging
      console.log(`Filtering by status: "${normalizedStatus}"`);
      
      // Make sure it's one of the valid enum values to avoid SQL errors
      if (["DRAFT", "READY"].includes(normalizedStatus)) {
        where.status = normalizedStatus;
      } else {
        console.warn(`Invalid status value: "${normalizedStatus}", valid values are DRAFT or READY`);
      }
    }

    // Handle folder filtering with subcategories support
    if (folderId) {
      console.log(`Folder filtering requested for folderId: ${folderId}, includeSubcategories: ${includeSubcategories}`);
      
      // Only process subfolder logic if includeSubcategories is true
      if (includeSubcategories) {
        try {
          // Get the main folder and its subfolders
          const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: { subfolders: true }
          });

          if (folder) {
            // Create a list of folder IDs including the main folder and all subfolders
            const folderIds = [folderId];
            if (folder.subfolders && folder.subfolders.length > 0) {
              folder.subfolders.forEach(subfolder => {
                folderIds.push(subfolder.id);
              });
              console.log(`Including ${folder.subfolders.length} subfolders: ${folderIds.join(', ')}`);
            } else {
              console.log('No subfolders found for this folder');
            }

            // Use IN operator to match any of these folders
            where.folderId = { in: folderIds };
          } else {
            console.log(`Folder with ID ${folderId} not found, using direct filtering`);
            // Fallback to just the requested folder if it doesn't exist
            where.folderId = folderId;
          }
        } catch (folderError) {
          console.error("Error retrieving folder for subcategory inclusion:", folderError);
          // If any error occurs during subfolder retrieval, fall back to direct filtering
          where.folderId = folderId;
        }
      } else {
        // Just filter by the specified folder without subfolder inclusion
        console.log(`Using direct folder filtering without subfolders: ${folderId}`);
        where.folderId = folderId;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mCQQuestion: { questionText: { contains: search, mode: "insensitive" } } },
        { codingQuestion: { questionText: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Log the final query for debugging
    console.log("Querying questions with where clause:", JSON.stringify(where, null, 2));

    // Get total count for pagination
    const total = await prisma.question.count({ where });

    const questions = await prisma.question.findMany({
      where,
      include: {
        folder: true,
        mCQQuestion: {
          include: {
            options: true
          }
        },
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Log status information to diagnose filtering issues
    console.log(`Found ${questions.length} questions out of ${total} total`);
    
    // Check the actual statuses of questions in the database
    const statusCounts = await prisma.question.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log("Database status counts:", statusCounts);
    console.log(`Status counts in results: DRAFT=${questions.filter(q => q.status === 'DRAFT').length}, READY=${questions.filter(q => q.status === 'READY').length}`);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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

    // Add retry logic for transaction
    const maxRetries = 3;
    let currentRetry = 0;
    let result;
    
    while (currentRetry < maxRetries) {
      try {
        result = await prisma.$transaction(
          async (tx) => {
            // Create the base question
            const questionData = {
              name: body.name,
              type: body.type,
              status: body.status || "DRAFT",
              folderId: body.folderId,
              creatorId: session.user.id,
              creatorName: session.user.name || "Unknown User",
              lastModifiedBy: session.user.id,
              lastModifiedByName: session.user.name || "Unknown User"
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
                  difficulty: body.difficulty || "MEDIUM",
                  defaultMark: Number(body.defaultMark) || 1,
                  isAllOrNothing: Boolean(body.codingQuestion.isAllOrNothing || body.isAllOrNothing || body.allOrNothingGrading || false),
                  languageOptions: {
                    create: body.codingQuestion.languageOptions.map((lang: any) => ({
                      language: lang.language,
                      solution: lang.solution || "",
                      preloadCode: lang.preloadCode || ""
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
          },
          {
            maxWait: 10000, // Maximum time (ms) to wait to acquire a transaction
            timeout: 30000,  // Maximum time (ms) for the transaction to complete
            isolationLevel: 'ReadCommitted' // Use less strict isolation for better performance
          }
        );
        
        // If we reach here, the transaction was successful, so break out of the retry loop
        break;
      } catch (error) {
        console.error(`Transaction attempt ${currentRetry + 1} failed:`, error);
        
        // If it's the last retry, rethrow the error
        if (currentRetry === maxRetries - 1) {
          throw error;
        }
        
        // Increment retry counter and wait before next attempt
        currentRetry++;
        console.log(`Retrying transaction (${currentRetry}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      }
    }

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