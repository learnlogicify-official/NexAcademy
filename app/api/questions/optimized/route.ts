import { QuestionType, QuestionStatus, QuestionDifficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Optimized version of the questions API endpoint
 * Implements pagination, selective field loading, and query optimization
 * to address the 25-second loading time in the admin question bank
 */
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
    const assessmentId = searchParams.get("assessmentId");
    const includeSectionMarks = searchParams.get("includeSectionMarks") === "true";
    const loadFullDetails = searchParams.get("loadFullDetails") === "true";
    
    // Get all tags (can be multiple with the same name)
    const tagIds = searchParams.getAll("tags");

    const where: any = {};

    if (type) {
      where.type = type === "MULTIPLE_CHOICE" ? "MCQ" : type;
    }

    if (status) {
      const normalizedStatus = status.toUpperCase();
      if (["DRAFT", "READY"].includes(normalizedStatus)) {
        where.status = normalizedStatus;
      }
    }

    // Add tag filtering - handle both single tag and multiple tags
    if (tagIds && tagIds.length > 0) {
      where.OR = where.OR || [];
      
      // Filter questions that have any of the provided tags
      where.OR.push({
        codingQuestion: {
          tags: {
            some: {
              id: {
                in: tagIds
              }
            }
          }
        }
      });
    }

    // Handle folder filtering with subcategories support
    if (folderId && folderId !== 'all') {
      if (includeSubcategories) {
        try {
          // Get the main folder and its subfolders
          const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            select: { 
              id: true,
              subfolders: {
                select: {
                  id: true
                }
              }
            }
          });

          if (folder) {
            // Create a list of folder IDs including the main folder and all subfolders
            const folderIds = [folderId];
            if (folder.subfolders && folder.subfolders.length > 0) {
              folder.subfolders.forEach(subfolder => {
                folderIds.push(subfolder.id);
              });
            }

            // Use IN operator to match any of these folders
            where.folderId = { in: folderIds };
          } else {
            // Fallback to just the requested folder if it doesn't exist
            where.folderId = folderId;
          }
        } catch (folderError) {
          console.error('Error fetching folder with subfolders:', folderError);
          where.folderId = folderId;
        }
      } else {
        // Just filter by the specified folder without subfolder inclusion
        where.folderId = folderId;
      }
    }

    if (search) {
      where.OR = where.OR || [];
      where.OR.push(...[
        { name: { contains: search, mode: "insensitive" } },
        { mCQQuestion: { questionText: { contains: search, mode: "insensitive" } } },
        { codingQuestion: { questionText: { contains: search, mode: "insensitive" } } },
      ]);
    }

    // Get total count for pagination
    const total = await prisma.question.count({ where });

    // Build the include object based on whether we need full details or just summary
    let include: any;
    
    if (loadFullDetails) {
      // Full details include - used when viewing/editing a specific question
      include = {
        folder: {
          select: {
            id: true,
            name: true,
            parentId: true
          }
        },
        mCQQuestion: {
          include: {
            options: true
          }
        },
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true,
            tags: true
          }
        }
      };

      // Include section data if assessmentId is provided
      if (assessmentId && includeSectionMarks) {
        include.sections = {
          where: {
            section: {
              assessmentId: assessmentId
            }
          },
          include: {
            section: {
              select: {
                id: true,
                title: true,
                assessmentId: true
              }
            }
          }
        };
      }
    } else {
      // Minimal include for list view - significantly reduces data transfer and query time
      include = {
        folder: {
          select: {
            id: true,
            name: true,
            parentId: true
          }
        },
        mCQQuestion: {
          select: {
            id: true,
            questionText: true,
            defaultMark: true,
            difficulty: true,
            _count: {
              select: {
                options: true
              }
            }
          }
        },
        codingQuestion: {
          select: {
            id: true,
            questionText: true,
            defaultMark: true,
            difficulty: true,
            _count: {
              select: {
                languageOptions: true,
                testCases: true,
                tags: true
              }
            },
            tags: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      };
    }

    // Execute the optimized query
    const questions = await prisma.question.findMany({
      where,
      include,
      orderBy: {
        updatedAt: 'desc' // Use updatedAt instead of createdAt for better relevance
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format each question with minimal processing
    const formattedQuestions = questions.map(q => {
      const codingQuestion = (q as any).codingQuestion;
      let formattedCodingQuestion = undefined;
      
      if (codingQuestion && typeof codingQuestion === 'object') {
        // Only process fields that are actually present
        formattedCodingQuestion = {
          ...codingQuestion,
          // Only map arrays if they exist
          testCases: Array.isArray(codingQuestion.testCases) 
            ? codingQuestion.testCases.map((tc: any) => ({ ...tc })) 
            : undefined,
          tags: Array.isArray(codingQuestion.tags) ? codingQuestion.tags : []
        };
      }
      
      return {
        ...q,
        codingQuestion: formattedCodingQuestion,
        tags: Array.isArray(formattedCodingQuestion?.tags) 
          ? formattedCodingQuestion.tags 
          : (Array.isArray((q as any).mCQQuestion?.tags) ? (q as any).mCQQuestion.tags : [])
      };
    });

    return NextResponse.json({
      questions: formattedQuestions,
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