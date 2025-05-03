import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from '@prisma/client';
import { Question } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // First check if the question exists
    const questionExists = await prisma.question.findUnique({
      where: { id }
    });

    if (!questionExists) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Use execute raw to bypass Prisma's type checking
    // This approach handles the cascading deletion more directly
    
    // Delete associated MCQ Options if they exist
    await prisma.$executeRaw`
      DELETE FROM "MCQOption" 
      WHERE "mcqQuestionId" IN (
        SELECT "id" FROM "MCQQuestion" WHERE "questionId" = ${id}
      )
    `;
    
    // Delete the MCQ question if it exists
    await prisma.$executeRaw`
      DELETE FROM "MCQQuestion" WHERE "questionId" = ${id}
    `;
    
    // Delete language options if they exist
    await prisma.$executeRaw`
      DELETE FROM "LanguageOption" 
      WHERE "codingQuestionId" IN (
        SELECT "id" FROM "CodingQuestion" WHERE "questionId" = ${id}
      )
    `;
    
    // Delete test cases if they exist
    await prisma.$executeRaw`
      DELETE FROM "TestCase" 
      WHERE "codingQuestionId" IN (
        SELECT "id" FROM "CodingQuestion" WHERE "questionId" = ${id}
      )
    `;
    
    // Delete the coding question if it exists
    await prisma.$executeRaw`
      DELETE FROM "CodingQuestion" WHERE "questionId" = ${id}
    `;
    
    // Finally delete the question
    await prisma.$executeRaw`
      DELETE FROM "Question" WHERE "id" = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: `Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const { folderId, subfolderId, ...updateData } = data;

    // Validate required fields
    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    

    const { type, content, options, correctAnswer, singleAnswer, shuffleAnswers, ...rest } = updateData;
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        mCQQuestion: true,
        codingQuestion: true
      }
    });

    if (!existingQuestion) {
      throw new Error('Question not found');
    }

    // Update the question with the new data and user information
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        ...rest,
        folderId,
        lastModifiedBy: session.user.id,
        lastModifiedByName: session.user.name || "Unknown User",
        updatedAt: new Date()
      },
      include: {
        mCQQuestion: true,
        codingQuestion: true
      }
    });

    // Log the update for debugging
  

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: questionId } = await params;
    
    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    console.log('Received request body:', JSON.stringify(body, null, 2));
    const {
      name,
      questionText,
      type,
      folderId,
      status,
      difficulty,
      defaultMark,
      isMultiple,
      shuffleChoice,
      generalFeedback,
      choiceNumbering,
      mCQQuestion,
      codingQuestion,
      allOrNothingGrading
    } = body;

    // Validate required fields
    if (!name || !questionText || !type || !folderId || !status || !difficulty || !defaultMark) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
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
      }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update the question with new data and user information
    let updatedQuestion;
    
    try {
      // Begin a transaction to ensure all updates are atomic
      updatedQuestion = await prisma.$transaction(async (tx) => {
        // 1. Update the basic question data
        const question = await tx.question.update({
          where: { id: questionId },
          data: {
            name,
            type,
            folderId,
            status,
            lastModifiedBy: session.user.id,
            lastModifiedByName: session.user.name || "Unknown User",
            updatedAt: new Date(),
          },
          include: {
            mCQQuestion: true,
            codingQuestion: true
          }
        });

        // 2. Handle MCQ Question updates
        if (type === 'MCQ' && mCQQuestion) {
          // Delete existing options
          await tx.mCQOption.deleteMany({
            where: { mcqQuestionId: question.mCQQuestion?.id }
          });

          // Update MCQ question
          await tx.mCQQuestion.update({
            where: { questionId },
            data: {
              questionText,
              defaultMark: Number(defaultMark) || 1,
              isMultiple: Boolean(mCQQuestion.isMultiple || isMultiple),
              shuffleChoice: Boolean(mCQQuestion.shuffleChoice || shuffleChoice),
              difficulty,
              generalFeedback,
              // Create new options
              options: {
                create: (mCQQuestion.options || []).map((option: any) => ({
                  text: option.text,
                  grade: Number(option.grade) || 0,
                  feedback: option.feedback || ''
                }))
              }
            }
          });
        }
        
        // 3. Handle Coding Question updates
        if (type === 'CODING' && codingQuestion) {
          // Get the coding question ID
          const codingQuestionId = question.codingQuestion?.id;
          
          if (!codingQuestionId) {
            throw new Error('Coding question not found');
          }
          
          // Update the coding question basic info with only essential fields
          await tx.codingQuestion.update({
            where: { questionId },
            data: {
              questionText,
              defaultMark: Number(defaultMark) || 1,
              defaultLanguage: codingQuestion.defaultLanguage || null,
              tags: {
                set: codingQuestion.tags.map((tagId: string) => ({ id: tagId }))
              },
              // Skip the isAllOrNothing field for now
            }
          });
          
          // Use raw SQL to update the isAllOrNothing field
          const isAllOrNothingValue = Boolean(
            codingQuestion?.isAllOrNothing || 
            codingQuestion?.allOrNothingGrading || 
            allOrNothingGrading || 
            false
          );
          
          await tx.$executeRaw`
            UPDATE "CodingQuestion" 
            SET "isAllOrNothing" = ${isAllOrNothingValue}, 
                "difficulty" = ${difficulty || "MEDIUM"}::TEXT::"QuestionDifficulty"
            WHERE "questionId" = ${questionId}
          `;
          
          // Delete existing language options
          await tx.languageOption.deleteMany({
            where: { codingQuestionId }
          });
          
          // Create new language options
          if (codingQuestion.languageOptions && Array.isArray(codingQuestion.languageOptions)) {
            for (const lang of codingQuestion.languageOptions) {
              await tx.languageOption.create({
                data: {
                  codingQuestionId,
                  language: lang.language,
                  solution: lang.solution || '',
                  preloadCode: lang.preloadCode || ''
                }
              });
            }
          }
          
          // Delete existing test cases
          await tx.testCase.deleteMany({
            where: { codingQuestionId }
          });
          
          // Create new test cases
          if (codingQuestion.testCases && Array.isArray(codingQuestion.testCases)) {
            for (const testCase of codingQuestion.testCases) {
              // Handle boolean flags
              const isSample = testCase.isSample === true;
              const isHidden = testCase.isHidden === true;
              const showOnFailure = testCase.showOnFailure === true;
              
              await tx.testCase.create({
                data: {
                  codingQuestionId,
                  input: String(testCase.input || ''),
                  output: String(testCase.output || ''),
                  isSample,
                  isHidden,
                  showOnFailure,
                  gradePercentage: testCase.gradePercentage || 0
                  // No 'grade' field - it's not in the schema
                }
              });
            }
          }
        }
        
        // Return the updated question with all related data
        return await tx.question.findUnique({
          where: { id: questionId },
          include: {
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
          }
        });
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: `Transaction failed: ${transactionError instanceof Error ? transactionError.message : String(transactionError)}` },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: `Error updating question: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questionId } = await params;

    // Fetch the question with all related data
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        folder: true,
        mCQQuestion: {
          include: {
            options: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        codingQuestion: {
          include: {
            testCases: {
              orderBy: {
                createdAt: 'asc'
              }
            },
            languageOptions: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        },
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 5
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Transform the response to match the frontend expectations
    const transformedQuestion = {
      ...question,
      mCQQuestion: question.mCQQuestion ? {
        ...question.mCQQuestion,
        options: question.mCQQuestion.options.map(option => ({
          id: option.id,
          text: option.text,
          grade: option.grade || 0,
          feedback: option.feedback || ''
        }))
      } : null,
      codingQuestion: question.codingQuestion ? {
        ...question.codingQuestion,
        testCases: question.codingQuestion.testCases.map(testCase => ({
          id: testCase.id,
          input: testCase.input,
          output: testCase.output,
          isHidden: testCase.isHidden || false
        })),
        languageOptions: question.codingQuestion.languageOptions.map(lang => ({
          id: lang.id,
          language: lang.language,
          solution: lang.solution
        }))
      } : null,
      versions: question.versions.map(version => ({
        id: version.id,
        version: version.version,
        name: version.name,
        type: version.type,
        status: version.status,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt
      }))
    };

    return NextResponse.json(transformedQuestion);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
} 