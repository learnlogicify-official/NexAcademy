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
    
    // Before deleting the question, delete all UserProblemSettings referencing it
    await prisma.userProblemSettings.deleteMany({ where: { problemId: id } });
    
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
  let retryCount = 0;
  const MAX_RETRIES = 2;
  
  // Function to process the request with retry logic
  const processRequest = async (): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const { id: questionId } = params;
      
      if (!questionId) {
        return NextResponse.json(
          { error: 'Question ID is required' },
          { status: 400 }
        );
      }

      console.time(`Update question ${questionId}`);
      const body = await request.json();
      
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
              testCases: true,
              tags: true
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

      console.log(`Updating question ${questionId}, type: ${type}`);
      
      // First, update the basic question data outside of the transaction
      // This reduces the transaction time
      await prisma.question.update({
        where: { id: questionId },
        data: {
          name,
          type,
          folderId,
          status,
          lastModifiedBy: session.user.id,
          lastModifiedByName: session.user.name || "Unknown User",
          updatedAt: new Date(),
        }
      });

      let updatedQuestion;
      
      try {
        // Use a transaction with a timeout for the complex operations
        updatedQuestion = await prisma.$transaction(async (tx) => {
          // 2. Handle MCQ Question updates
          if (type === 'MCQ' && mCQQuestion) {
            // Delete existing options - done outside transaction to reduce time
            await prisma.mCQOption.deleteMany({
              where: { mcqQuestionId: existingQuestion.mCQQuestion?.id }
            });

            console.log('Updating MCQ question...');
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
                // Create new options with createMany for better performance
                options: {
                  createMany: {
                    data: (mCQQuestion.options || []).map((option: any) => ({
                      text: option.text,
                      grade: Number(option.grade) || 0,
                      feedback: option.feedback || ''
                    }))
                  }
                }
              }
            });
            console.log('MCQ question updated successfully.');
          }
          
          // 3. Handle Coding Question updates
          if (type === 'CODING' && codingQuestion) {
            // Get the coding question ID
            const codingQuestionId = existingQuestion.codingQuestion?.id;
            
            if (!codingQuestionId) {
              throw new Error('Coding question not found');
            }
            
            console.log('Updating basic coding question info...');
            // Update the coding question basic info
            await tx.codingQuestion.update({
              where: { questionId },
              data: {
                questionText,
                defaultMark: Number(defaultMark) || 1,
                defaultLanguage: codingQuestion.defaultLanguage || null,
                difficulty,
                isAllOrNothing: Boolean(
                  codingQuestion?.isAllOrNothing || 
                  codingQuestion?.allOrNothingGrading || 
                  allOrNothingGrading || 
                  false
                ),
                tags: {
                  set: codingQuestion.tags.map((tagId: string) => ({ id: tagId }))
                }
              }
            });
            console.log('Basic coding question info updated.');
          }
          
          // Return the updated question object
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
                  tags: true
                }
              }
            }
          });
        }, {
          // Set a longer timeout for the transaction (Prisma default is 5 seconds)
          timeout: 15000, // 15 seconds
          maxWait: 5000, // 5 seconds max wait for connection
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted // Less strict isolation for better performance
        });

        // After the transaction completes, perform optimized operations for language options and test cases
        // These are done outside the transaction to avoid long transaction times
        if (type === 'CODING' && codingQuestion && existingQuestion.codingQuestion) {
          const codingQuestionId = existingQuestion.codingQuestion.id;
          
          if (codingQuestionId) {
            try {
              console.time('Processing language options and test cases');
              
              // Run language options and test cases in parallel for better performance
              await Promise.all([
                // Process language options with smart diffing
                (async () => {
                  console.time('Language options processing');
                  // Only work with valid language options array
                  const newLanguageOptions = Array.isArray(codingQuestion.languageOptions) ? codingQuestion.languageOptions : [];
                  const existingLanguageOptions = existingQuestion.codingQuestion?.languageOptions || [];
                  
                  // Create maps for faster lookups
                  const existingLanguageMap = new Map(existingLanguageOptions.map(lang => [
                    lang.language, 
                    lang
                  ]));
                  
                  const newLanguageMap = new Map(newLanguageOptions.map(
                    (lang: { language: string; solution?: string; preloadCode?: string; id?: string }) => [
                      lang.language, 
                      lang
                    ]
                  ));
                  
                  // Find languages to delete (exist in DB but not in new options)
                  const languagesToDelete = existingLanguageOptions
                    .filter(lang => !newLanguageMap.has(lang.language))
                    .map(lang => lang.id);
                  
                  // Find languages to create (exist in new options but not in DB)
                  const languagesToCreate = newLanguageOptions
                    .filter((lang: { language: string }) => !existingLanguageMap.has(lang.language))
                    .map((lang: { language: string; solution?: string; preloadCode?: string }) => ({
                      codingQuestionId,
                      language: lang.language,
                      solution: lang.solution || '',
                      preloadCode: lang.preloadCode || ''
                    }));
                  
                  // Find languages to update (exist in both but changed)
                  const languagesToUpdate = newLanguageOptions
                    .filter((lang: { language: string; solution?: string; preloadCode?: string }) => {
                      const existing = existingLanguageMap.get(lang.language);
                      if (!existing) return false;
                      
                      return (
                        (lang.solution || '') !== (existing.solution || '') ||
                        (lang.preloadCode || '') !== (existing.preloadCode || '')
                      );
                    })
                    .map((lang: { language: string; solution?: string; preloadCode?: string }) => {
                      const existing = existingLanguageMap.get(lang.language);
                      return {
                        id: existing?.id,
                        data: {
                          solution: lang.solution || '',
                          preloadCode: lang.preloadCode || ''
                        }
                      };
                    });
                  
                  console.log(`Languages: ${languagesToDelete.length} to delete, ${languagesToCreate.length} to create, ${languagesToUpdate.length} to update`);
                  
                  // Execute all operations in parallel
                  if (languagesToDelete.length > 0) {
                    await prisma.languageOption.deleteMany({
                      where: { id: { in: languagesToDelete } }
                    });
                  }
                  
                  if (languagesToCreate.length > 0) {
                    await prisma.languageOption.createMany({
                      data: languagesToCreate
                    });
                  }
                  
                  // Updates need to be executed individually but can be parallelized
                  if (languagesToUpdate.length > 0) {
                    await Promise.all(
                      languagesToUpdate.map((lang: { id?: string, data: { solution: string, preloadCode: string } }) => 
                        prisma.languageOption.update({
                          where: { id: lang.id },
                          data: lang.data
                        })
                      )
                    );
                  }
                  console.timeEnd('Language options processing');
                })(),
                
                // Process test cases with smart diffing
                (async () => {
                  console.time('Test cases processing');
                  // Only work with valid test cases array
                  const newTestCases = Array.isArray(codingQuestion.testCases) ? codingQuestion.testCases : [];
                  const existingTestCases = existingQuestion.codingQuestion?.testCases || [];
                  
                  type TestCaseInput = {
                    id?: string;
                    input?: string;
                    output?: string;
                    isSample?: boolean;
                    isHidden?: boolean;
                    showOnFailure?: boolean;
                    gradePercentage?: number;
                  };
                  
                  // Function to generate a unique key for each test case
                  const getTestCaseKey = (tc: TestCaseInput) => {
                    // Use id if available, otherwise use deterministic key based on content
                    return tc.id || `${tc.input || ''}:${tc.output || ''}`;
                  };
                  
                  // Create maps for faster lookups
                  const existingTestMap = new Map(
                    existingTestCases.map(tc => [
                      tc.id, 
                      tc
                    ])
                  );
                  
                  // Find test cases to delete (exist in DB but no matching ID in new test cases)
                  const testCasesToDelete = existingTestCases
                    .filter(tc => !newTestCases.some((newTc: TestCaseInput) => newTc.id === tc.id))
                    .map(tc => tc.id);
                  
                  // Find test cases to create (no ID or don't exist in DB)
                  const testCasesToCreate = newTestCases
                    .filter((tc: TestCaseInput) => !tc.id || !existingTestMap.has(tc.id))
                    .map((tc: TestCaseInput) => ({
                      codingQuestionId,
                      input: String(tc.input || ''),
                      output: String(tc.output || ''),
                      isSample: tc.isSample === true,
                      isHidden: tc.isHidden === true,
                      showOnFailure: tc.showOnFailure === true,
                      gradePercentage: tc.gradePercentage || 0
                    }));
                  
                  // Find test cases to update (exist in both but changed)
                  const testCasesToUpdate = newTestCases
                    .filter((tc: TestCaseInput) => {
                      // Skip if no ID or doesn't exist in DB
                      if (!tc.id || !existingTestMap.has(tc.id)) return false;
                      
                      const existing = existingTestMap.get(tc.id);
                      if (!existing) return false;
                      
                      return (
                        String(tc.input || '') !== existing.input ||
                        String(tc.output || '') !== existing.output ||
                        Boolean(tc.isSample) !== existing.isSample ||
                        Boolean(tc.isHidden) !== existing.isHidden ||
                        Boolean(tc.showOnFailure) !== existing.showOnFailure ||
                        (tc.gradePercentage || 0) !== existing.gradePercentage
                      );
                    })
                    .map((tc: TestCaseInput) => ({
                      id: tc.id,
                      data: {
                        input: String(tc.input || ''),
                        output: String(tc.output || ''),
                        isSample: tc.isSample === true,
                        isHidden: tc.isHidden === true,
                        showOnFailure: tc.showOnFailure === true,
                        gradePercentage: tc.gradePercentage || 0
                      }
                    }));
                  
                  console.log(`Test cases: ${testCasesToDelete.length} to delete, ${testCasesToCreate.length} to create, ${testCasesToUpdate.length} to update`);
                  
                  // Execute all operations in parallel
                  await Promise.all([
                    // Delete unwanted test cases
                    testCasesToDelete.length > 0 ? 
                      prisma.testCase.deleteMany({
                        where: { id: { in: testCasesToDelete } }
                      }) : 
                      Promise.resolve(),
                    
                    // Create new test cases
                    testCasesToCreate.length > 0 ? 
                      prisma.testCase.createMany({
                        data: testCasesToCreate
                      }) : 
                      Promise.resolve(),
                    
                    // Update modified test cases in parallel
                    ...testCasesToUpdate.map((tc: { id?: string, data: { input: string, output: string, isSample: boolean, isHidden: boolean, showOnFailure: boolean, gradePercentage: number } }) => 
                      prisma.testCase.update({
                        where: { id: tc.id },
                        data: tc.data
                      })
                    )
                  ]);
                  console.timeEnd('Test cases processing');
                })()
              ]);
              
              console.timeEnd('Processing language options and test cases');
            } catch (batchError) {
              console.error('Error during batch operations:', batchError);
              // Continue with the response even if batch operations fail
              // Log specific details to help with debugging
              if (batchError instanceof Error) {
                console.error(`Error name: ${batchError.name}, Message: ${batchError.message}`);
                console.error(`Stack trace: ${batchError.stack}`);
              }
            }
          }
        }

        // Fetch only essential data for the updated question
        // Avoid fetching all test cases and language options if not needed immediately
        console.time('Fetching updated question');
        const completeQuestion = await prisma.question.findUnique({
          where: { id: questionId },
          include: {
            mCQQuestion: {
              include: {
                options: true
              }
            },
            codingQuestion: {
              include: {
                // Only include limited counts for initial response
                // Frontend can fetch full data if needed
                languageOptions: {
                  select: {
                    id: true,
                    language: true
                  }
                },
                testCases: {
                  select: {
                    id: true,
                    isSample: true,
                    isHidden: true
                  }
                },
                tags: true
              }
            }
          }
        });
        console.timeEnd('Fetching updated question');
        console.timeEnd(`Update question ${questionId}`);

        return NextResponse.json({
          ...completeQuestion,
          _counts: {
            testCases: completeQuestion?.codingQuestion?.testCases.length || 0,
            languageOptions: completeQuestion?.codingQuestion?.languageOptions.length || 0
          },
          message: "Question updated successfully. Full data is available on subsequent requests."
        });
      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        
        // Check if this is a transaction timeout or closed transaction error
        const errorMessage = String(transactionError);
        const isTransactionTimeoutError = errorMessage.includes('Transaction not found') || 
                                         errorMessage.includes('timed out') ||
                                         errorMessage.includes('P2028');
        
        if (isTransactionTimeoutError && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Transaction error detected, retrying (${retryCount}/${MAX_RETRIES})...`);
          return processRequest(); // Retry the request
        }
        
        return NextResponse.json(
          { error: `Transaction failed: ${transactionError instanceof Error ? transactionError.message : String(transactionError)}` },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error updating question:', error);
      return NextResponse.json(
        { error: `Error updating question: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  };
  
  // Start the request processing with retry capability
  return processRequest();
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