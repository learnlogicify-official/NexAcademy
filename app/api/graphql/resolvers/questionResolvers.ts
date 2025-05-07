import { prisma } from "@/lib/prisma";
import { QuestionStatus, QuestionType } from "@prisma/client";
import { XMLParser } from "fast-xml-parser";
import { Session } from "next-auth";
import { Prisma } from "@prisma/client";

// Cache for Judge0 languages to avoid duplicate API calls
let cachedJudge0Languages: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Helper function to fetch Judge0 languages
const fetchJudge0Languages = async (): Promise<any[]> => {
  // Check cache first
  const now = Date.now();
  if (cachedJudge0Languages && now - cacheTimestamp < CACHE_DURATION) {
    console.log('[Judge0] Using cached languages data');
    return cachedJudge0Languages;
  }

  // Fallback language data to use if API fails
  const fallbackLanguages = [
    { id: 63, name: "JavaScript (Node.js 12.14.0)" },
    { id: 71, name: "Python (3.8.1)" },
    { id: 70, name: "Python (2.7.17)" },
    { id: 54, name: "C++ (GCC 9.2.0)" },
    { id: 62, name: "Java (OpenJDK 13.0.1)" },
    { id: 68, name: "PHP (7.4.1)" },
    { id: 72, name: "Ruby (2.7.0)" },
    { id: 51, name: "C# (Mono 6.6.0.161)" },
    { id: 60, name: "Go (1.13.5)" },
    { id: 73, name: "Rust (1.40.0)" }
  ];

  // Cache miss - fetch from API
  try {
    console.log('[Judge0] Fetching languages from API');
    // Log the API URL for debugging
    console.log(`[Judge0] API URL: ${process.env.JUDGE0_API_URL}/languages`);
    
    // Set up an AbortController with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${process.env.JUDGE0_API_URL}/languages`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to fetch Judge0 languages: ${response.status} - ${text}`);
      console.log('[Judge0] Using fallback language data');
      
      // Update cache with fallback data
      cachedJudge0Languages = fallbackLanguages;
      cacheTimestamp = now;
      
      return fallbackLanguages;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Judge0 API did not return JSON:', text);
      console.log('[Judge0] Using fallback language data');
      
      // Update cache with fallback data
      cachedJudge0Languages = fallbackLanguages;
      cacheTimestamp = now;
      
      return fallbackLanguages;
    }
    
    const data = await response.json();
    
    // Filter out archived languages
    const filtered = data.filter((lang: any) => lang.is_archived !== true);
    console.log(`[Judge0] Fetched ${data.length} languages, ${filtered.length} active languages`);
    
    // Format language name with version if available
    const formatted = filtered.map((lang: any) => {
      let name = lang.name;
      if (lang.version) {
        name = `${lang.name} (${lang.version})`;
      } else {
        // Try to extract version from name if present
        const match = lang.name.match(/([\w\s\#\+\-\.]+)\s*\(([^)]+)\)/);
        if (match) {
          name = `${match[1].trim()} (${match[2].trim()})`;
        }
      }
      return { ...lang, name };
    });
    
    // Deduplicate languages based on ID
    const deduplicated = [...new Map(formatted.map((lang: any) => [lang.id, lang])).values()];
    console.log(`[Judge0] After deduplication: ${deduplicated.length} languages`);
    
    // Update cache
    cachedJudge0Languages = deduplicated;
    cacheTimestamp = now;
    
    return deduplicated;
  } catch (error) {
    console.error('Error fetching Judge0 languages:', error);
    console.log('[Judge0] Using fallback language data due to error');
    
    // Update cache with fallback data
    cachedJudge0Languages = fallbackLanguages;
    cacheTimestamp = now;
    
    return fallbackLanguages;
  }
};

// Define the context type
interface Context {
  session: Session | null;
  req: Request;
}

// Helper function to validate user authentication
const validateAuth = (context: Context) => {
  if (!context.session || !context.session.user) {
    throw new Error("Unauthorized: You must be logged in");
  }
  
  // Check if user is admin or instructor
  const role = context.session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR" && role !== "MANAGER") {
    throw new Error("Forbidden: You do not have permission to perform this action");
  }
  
  return context.session.user;
};

// Helper function to map language
function mapLanguage(lang: string | number): string {
  if (!isNaN(Number(lang))) {
    return String(lang);
  }

  switch ((String(lang) || '').toUpperCase()) {
    case 'PYTHON':
      return 'PYTHON3';
    case 'PYTHON3':
      return 'PYTHON3';
    case 'PYTHON2':
      return 'PYTHON2';
    case 'JAVASCRIPT':
      return 'JAVASCRIPT';
    case 'JAVA':
      return 'JAVA';
    case 'C++':
    case 'CPP':
      return 'CPP';
    case 'C#':
    case 'CSHARP':
      return 'CSHARP';
    case 'PHP':
      return 'PHP';
    case 'RUBY':
      return 'RUBY';
    case 'SWIFT':
      return 'SWIFT';
    case 'GO':
      return 'GO';
    case 'RUST':
      return 'RUST';
    default:
      return String(lang);
  }
}

export const questionResolvers = {
  Query: {
    // Get questions with pagination and filtering
    questions: async (_: any, args: any, context: Context) => {
      validateAuth(context);
      
      const { 
        type, 
        status, 
        folderId, 
        search, 
        page = 1, 
        limit = 10,
        includeSubcategories = false,
        tagIds = []
      } = args;

      const where: any = {};

      // Apply type filter
      if (type) {
        where.type = type === "MULTIPLE_CHOICE" ? "MCQ" : type;
      }

      // Apply status filter
      if (status) {
        const normalizedStatus = status.toUpperCase();
        if (["DRAFT", "READY"].includes(normalizedStatus)) {
          where.status = normalizedStatus;
        }
      }

      // Apply tag filter
      if (tagIds && tagIds.length > 0) {
        where.OR = where.OR || [];
        
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

      // Apply folder filter with subcategories support
      if (folderId && folderId !== 'all') {
        if (includeSubcategories) {
          try {
            // Get the main folder and its subfolders
            const folder = await prisma.folder.findUnique({
              where: { id: folderId },
              include: { 
                subfolders: true,
                questions: true
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
              where.folderId = folderId;
            }
          } catch (error) {
            console.error('Error fetching folder with subfolders:', error);
            where.folderId = folderId;
          }
        } else {
          where.folderId = folderId;
        }
      }

      // Apply search filter
      if (search) {
        where.OR = where.OR || [];
        
        where.OR.push(
          { name: { contains: search, mode: "insensitive" } },
          { mCQQuestion: { questionText: { contains: search, mode: "insensitive" } } },
          { codingQuestion: { questionText: { contains: search, mode: "insensitive" } } }
        );
      }

      // Get total count for pagination
      const totalCount = await prisma.question.count({ where });

      // Get questions with pagination
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
              testCases: true,
              tags: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      // Process questions to add tags at the top level
      const processedQuestions = questions.map(question => {
        // Extract tags from codingQuestion if they exist
        const tags = question.codingQuestion?.tags || [];
        
        // Return a new object with tags added at the top level
        return {
          ...question,
          tags
        };
      });

      return {
        questions: processedQuestions,
        totalCount
      };
    },

    // Get a single question by ID
    question: async (_: any, { id }: { id: string }, context: Context) => {
      validateAuth(context);
      
      const question = await prisma.question.findUnique({
        where: { id },
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
              testCases: true,
              tags: true
            }
          }
        }
      });
      
      if (!question) return null;
      
      // Add tags at the top level
      return {
        ...question,
        tags: question.codingQuestion?.tags || []
      };
    },

    // Get all folders
    folders: async (_: any, __: any, context: Context) => {
      validateAuth(context);
      
      return prisma.folder.findMany({
        include: {
          subfolders: true
        }
      });
    },

    // Get all tags
    tags: async (_: any, __: any, context: Context) => {
      validateAuth(context);
      
      return prisma.tag.findMany();
    },

    // Get Judge0 languages
    judge0Languages: async (_: any, __: any, context: Context) => {
      validateAuth(context);
      
      try {
        return await fetchJudge0Languages();
      } catch (error) {
        console.error('Error in judge0Languages resolver:', error);
        return [];
      }
    },

    // Get question statistics without fetching all questions
    questionStats: async (_: any, args: any, context: Context) => {
      validateAuth(context);
      
      const { 
        type, 
        status, 
        folderId, 
        search,
        includeSubcategories = false,
        tagIds = []
      } = args;
      
      // Base query for filtering
      const baseWhere: any = {};
      
      // Apply type filter
      if (type) {
        baseWhere.type = type === "MULTIPLE_CHOICE" ? "MCQ" : type;
      }
      
      // Apply status filter
      if (status) {
        const normalizedStatus = status.toUpperCase();
        if (["DRAFT", "READY"].includes(normalizedStatus)) {
          baseWhere.status = normalizedStatus;
        }
      }
      
      // Apply folder filter with subcategories support
      if (folderId && folderId !== 'all') {
        if (includeSubcategories) {
          try {
            // Get the main folder and its subfolders
            const folder = await prisma.folder.findUnique({
              where: { id: folderId },
              include: { 
                subfolders: true
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
              baseWhere.folderId = { in: folderIds };
            } else {
              baseWhere.folderId = folderId;
            }
          } catch (error) {
            console.error('Error fetching folder with subfolders:', error);
            baseWhere.folderId = folderId;
          }
        } else {
          baseWhere.folderId = folderId;
        }
      }
      
      // Apply tag filter
      if (tagIds && tagIds.length > 0) {
        baseWhere.OR = baseWhere.OR || [];
        
        baseWhere.OR.push({
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
      
      // Apply search filter
      if (search) {
        baseWhere.OR = baseWhere.OR || [];
        
        baseWhere.OR.push(
          { name: { contains: search, mode: "insensitive" } },
          { mCQQuestion: { questionText: { contains: search, mode: "insensitive" } } },
          { codingQuestion: { questionText: { contains: search, mode: "insensitive" } } }
        );
      }
      
      try {
        // Get total count
        const total = await prisma.question.count({ where: baseWhere });
        
        // Get MCQ count
        const mcqCount = await prisma.question.count({
          where: {
            ...baseWhere,
            type: "MCQ"
          }
        });
        
        // Get CODING count
        const codingCount = await prisma.question.count({
          where: {
            ...baseWhere,
            type: "CODING"
          }
        });
        
        // Get READY count
        const readyCount = await prisma.question.count({
          where: {
            ...baseWhere,
            status: "READY"
          }
        });
        
        // Get DRAFT count
        const draftCount = await prisma.question.count({
          where: {
            ...baseWhere,
            status: "DRAFT"
          }
        });
        
        return {
          total,
          mcqCount,
          codingCount,
          readyCount,
          draftCount
        };
      } catch (error) {
        console.error('Error getting question stats:', error);
        return {
          total: 0,
          mcqCount: 0,
          codingCount: 0,
          readyCount: 0,
          draftCount: 0
        };
      }
    },

    // Combined query for editor data (tags and Judge0 languages)
    editorData: async (_: any, __: any, context: Context) => {
      validateAuth(context);
      try {
        const tags = await prisma.tag.findMany();
        
        // Use the shared function to get Judge0 languages
        const judge0Languages = await fetchJudge0Languages();
        
        return {
          tags,
          judge0Languages
        };
      } catch (error) {
        console.error('Error fetching editor data:', error);
        return {
          tags: [],
          judge0Languages: []
        };
      }
    }
  },
  
  Mutation: {
    // Create a new question
    createQuestion: async (_: any, { input }: { input: any }, context: Context) => {
      const user = validateAuth(context);
      
      const { name, type, status, folderId, codingQuestion, mCQQuestion } = input;
      
      // Create the base question
      const question = await prisma.question.create({
        data: {
          name,
          type: type as QuestionType,
          status: status as QuestionStatus,
          folderId,
          creatorId: user.id || "system",
          creatorName: user.name || "System",
          lastModifiedBy: user.id || "system",
          lastModifiedByName: user.name || "System",
        },
        include: {
          folder: true
        }
      });
      
      // Create the specific question type based on the input
      if (type === "CODING" && codingQuestion) {
        const { 
          questionText, 
          defaultMark, 
          difficulty, 
          isAllOrNothing, 
          defaultLanguage,
          languageOptions, 
          testCases,
          tagIds
        } = codingQuestion;
        
        // Create the coding question
        await prisma.codingQuestion.create({
          data: {
            questionId: question.id,
            questionText,
            defaultMark,
            difficulty,
            isAllOrNothing,
            defaultLanguage: defaultLanguage ? mapLanguage(defaultLanguage) : null,
            // Create language options
            languageOptions: {
              create: languageOptions.map((option: any) => ({
                language: mapLanguage(option.language),
                preloadCode: option.preloadCode,
                solution: option.solution
              }))
            },
            // Create test cases
            testCases: {
              create: testCases.map((testCase: any) => ({
                input: testCase.input,
                output: testCase.output,
                isSample: testCase.isSample,
                isHidden: testCase.isHidden,
                showOnFailure: testCase.showOnFailure,
                gradePercentage: testCase.gradePercentage
              }))
            },
            // Connect tags if provided
            tags: tagIds && tagIds.length > 0 ? {
              connect: tagIds.map((id: string) => ({ id }))
            } : undefined
          }
        });
      } else if (type === "MCQ" && mCQQuestion) {
        const { 
          questionText, 
          defaultMark, 
          shuffleChoice, 
          isMultiple, 
          tags, 
          generalFeedback, 
          difficulty,
          options
        } = mCQQuestion;
        
        // Create the MCQ question
        await prisma.mCQQuestion.create({
          data: {
            questionId: question.id,
            questionText,
            defaultMark,
            shuffleChoice,
            isMultiple,
            tags: tags || [],
            generalFeedback,
            difficulty,
            // Create options
            options: {
              create: options.map((option: any) => ({
                text: option.text,
                grade: option.grade,
                feedback: option.feedback
              }))
            }
          }
        });
      }
      
      // Return the created question with all related data
      return prisma.question.findUnique({
        where: { id: question.id },
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
              testCases: true,
              tags: true
            }
          }
        }
      });
    },
    
    // Update an existing question
    updateQuestion: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      const user = validateAuth(context);
      
      const { name, status, folderId, codingQuestion, mCQQuestion } = input;
      
      // Get the existing question to determine its type
      const existingQuestion = await prisma.question.findUnique({
        where: { id },
        include: {
          codingQuestion: {
            include: {
              languageOptions: true,
              testCases: true,
              tags: true
            }
          },
          mCQQuestion: {
            include: {
              options: true
            }
          }
        }
      });
      
      if (!existingQuestion) {
        throw new Error("Question not found");
      }
      
      // Update the base question
      const questionUpdateData: any = {
        lastModifiedBy: user.id || "system",
        lastModifiedByName: user.name || "System",
      };
      
      if (name !== undefined) questionUpdateData.name = name;
      if (status !== undefined) questionUpdateData.status = status;
      if (folderId !== undefined) questionUpdateData.folderId = folderId;
      
      // Update the question record
      await prisma.question.update({
        where: { id },
        data: questionUpdateData
      });
      
      // Update the specific question type based on the input
      if (existingQuestion.type === "CODING" && codingQuestion) {
        const { 
          questionText, 
          defaultMark, 
          difficulty, 
          isAllOrNothing, 
          defaultLanguage,
          languageOptions, 
          testCases,
          tagIds
        } = codingQuestion;
        
        // Prepare update data for coding question
        const codingQuestionUpdateData: any = {};
        
        if (questionText !== undefined) codingQuestionUpdateData.questionText = questionText;
        if (defaultMark !== undefined) codingQuestionUpdateData.defaultMark = defaultMark;
        if (difficulty !== undefined) codingQuestionUpdateData.difficulty = difficulty;
        if (isAllOrNothing !== undefined) codingQuestionUpdateData.isAllOrNothing = isAllOrNothing;
        if (defaultLanguage !== undefined) {
          codingQuestionUpdateData.defaultLanguage = defaultLanguage ? mapLanguage(defaultLanguage) : null;
        }
        
        // Update the coding question
        await prisma.codingQuestion.update({
          where: { questionId: id },
          data: codingQuestionUpdateData
        });
        
        // Update language options if provided
        if (languageOptions && languageOptions.length > 0) {
          // Delete existing language options
          await prisma.languageOption.deleteMany({
            where: { codingQuestionId: existingQuestion.codingQuestion?.id }
          });
          
          // Create new language options
          for (const option of languageOptions) {
            await prisma.languageOption.create({
              data: {
                codingQuestion: {
                  connect: { id: existingQuestion.codingQuestion?.id }
                },
                language: mapLanguage(option.language),
                preloadCode: option.preloadCode,
                solution: option.solution
              }
            });
          }
        }
        
        // Update test cases if provided
        if (testCases && testCases.length > 0) {
          // Delete existing test cases
          await prisma.testCase.deleteMany({
            where: { codingQuestionId: existingQuestion.codingQuestion?.id }
          });
          
          // Create new test cases
          for (const testCase of testCases) {
            await prisma.testCase.create({
              data: {
                codingQuestion: {
                  connect: { id: existingQuestion.codingQuestion?.id }
                },
                input: testCase.input,
                output: testCase.output,
                isSample: testCase.isSample,
                isHidden: testCase.isHidden,
                showOnFailure: testCase.showOnFailure,
                gradePercentage: testCase.gradePercentage
              }
            });
          }
        }
        
        // Update tags if provided
        if (tagIds && existingQuestion.codingQuestion) {
          // Disconnect all existing tags
          await prisma.codingQuestion.update({
            where: { id: existingQuestion.codingQuestion.id },
            data: {
              tags: {
                set: [] // Remove all existing connections
              }
            }
          });
          
          // Connect new tags
          if (tagIds.length > 0) {
            await prisma.codingQuestion.update({
              where: { id: existingQuestion.codingQuestion.id },
              data: {
                tags: {
                  connect: tagIds.map((id: string) => ({ id }))
                }
              }
            });
          }
        }
      } else if (existingQuestion.type === "MCQ" && mCQQuestion) {
        const { 
          questionText, 
          defaultMark, 
          shuffleChoice, 
          isMultiple, 
          tags, 
          generalFeedback, 
          difficulty,
          options
        } = mCQQuestion;
        
        // Prepare update data for MCQ question
        const mcqQuestionUpdateData: any = {};
        
        if (questionText !== undefined) mcqQuestionUpdateData.questionText = questionText;
        if (defaultMark !== undefined) mcqQuestionUpdateData.defaultMark = defaultMark;
        if (shuffleChoice !== undefined) mcqQuestionUpdateData.shuffleChoice = shuffleChoice;
        if (isMultiple !== undefined) mcqQuestionUpdateData.isMultiple = isMultiple;
        if (tags !== undefined) mcqQuestionUpdateData.tags = tags;
        if (generalFeedback !== undefined) mcqQuestionUpdateData.generalFeedback = generalFeedback;
        if (difficulty !== undefined) mcqQuestionUpdateData.difficulty = difficulty;
        
        // Update the MCQ question
        await prisma.mCQQuestion.update({
          where: { questionId: id },
          data: mcqQuestionUpdateData
        });
        
        // Update options if provided
        if (options && options.length > 0) {
          // Delete existing options
          await prisma.mCQOption.deleteMany({
            where: { mcqQuestionId: existingQuestion.mCQQuestion?.id }
          });
          
          // Create new options
          for (const option of options) {
            await prisma.mCQOption.create({
              data: {
                mcqQuestion: {
                  connect: { id: existingQuestion.mCQQuestion?.id }
                },
                text: option.text,
                grade: option.grade,
                feedback: option.feedback
              }
            });
          }
        }
      }
      
      // Return the updated question with all related data
      return prisma.question.findUnique({
        where: { id },
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
              testCases: true,
              tags: true
            }
          }
        }
      });
    },
    
    // Delete a question
    deleteQuestion: async (_: any, { id }: { id: string }, context: Context) => {
      validateAuth(context);
      
      // Check if the question exists
      const question = await prisma.question.findUnique({
        where: { id }
      });
      
      if (!question) {
        throw new Error("Question not found");
      }
      
      // Delete the question (cascading delete will handle related records)
      await prisma.question.delete({
        where: { id }
      });
      
      return true;
    },
    
    // Import questions from XML
    importQuestionsFromXML: async (_: any, { xmlContent, folderId }: { xmlContent: string, folderId: string }, context: Context) => {
      const user = validateAuth(context);
      
      // Parse XML content
      const parser = new XMLParser({
        attributeNamePrefix: "",
        ignoreAttributes: false,
        parseAttributeValue: true
      });
      const parsedXml = parser.parse(xmlContent);
      
      // Extract questions from the parsed XML
      const importedQuestions = [];
      
      // Check if quiz element exists in the parsed XML
      if (parsedXml.quiz && parsedXml.quiz.question) {
        const xmlQuestions = Array.isArray(parsedXml.quiz.question) 
          ? parsedXml.quiz.question 
          : [parsedXml.quiz.question];
        
        // Process each question from XML
        for (const xmlQuestion of xmlQuestions) {
          // Extract question type
          const type = xmlQuestion.type === "multichoice" ? "MCQ" : "CODING";
          
          // Create base question
          const question = await prisma.question.create({
            data: {
              name: xmlQuestion.name || "Imported Question",
              type: type as QuestionType,
              status: "DRAFT" as QuestionStatus,
              folderId,
              creatorId: user.id || "system",
              creatorName: user.name || "System",
              lastModifiedBy: user.id || "system",
              lastModifiedByName: user.name || "System",
            }
          });
          
          // Create the specific question type based on XML data
          if (type === "MCQ") {
            // Extract options from XML
            const xmlOptions = xmlQuestion.answer && (
              Array.isArray(xmlQuestion.answer) 
                ? xmlQuestion.answer 
                : [xmlQuestion.answer]
            );
            
            // Create MCQ question
            await prisma.mCQQuestion.create({
              data: {
                questionId: question.id,
                questionText: xmlQuestion.questiontext || "",
                defaultMark: parseFloat(xmlQuestion.defaultgrade) || 1.0,
                shuffleChoice: xmlQuestion.shuffleanswers === true,
                isMultiple: xmlQuestion.single === false,
                tags: xmlQuestion.tags ? [xmlQuestion.tags] : [],
                generalFeedback: xmlQuestion.generalfeedback || "",
                difficulty: "MEDIUM",
                options: {
                  create: xmlOptions ? xmlOptions.map((option: any) => ({
                    text: option.text || "",
                    grade: parseFloat(option.fraction) || 0.0,
                    feedback: option.feedback || ""
                  })) : []
                }
              }
            });
          } else if (type === "CODING") {
            // Create coding question (with minimal data as XML structure may vary)
            await prisma.codingQuestion.create({
              data: {
                questionId: question.id,
                questionText: xmlQuestion.questiontext || "",
                defaultMark: parseFloat(xmlQuestion.defaultgrade) || 1.0,
                difficulty: "MEDIUM",
                isAllOrNothing: false,
                languageOptions: {
                  create: [{
                    language: "JAVASCRIPT",
                    solution: "// Solution code"
                  }]
                },
                testCases: {
                  create: [{
                    input: "",
                    output: "",
                    isSample: true,
                    isHidden: false,
                    showOnFailure: true,
                    gradePercentage: 100.0
                  }]
                }
              }
            });
          }
          
          // Add the created question to the result
          const createdQuestion = await prisma.question.findUnique({
            where: { id: question.id },
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
                  testCases: true,
                  tags: true
                }
              }
            }
          });
          
          if (createdQuestion) {
            importedQuestions.push(createdQuestion);
          }
        }
      }
      
      return importedQuestions;
    },
    
    // Bulk import coding questions
    bulkImportCodingQuestions: async (_: any, { questions }: { questions: any[] }, context: Context) => {
      const user = validateAuth(context);
      let importedQuestions: any[] = [];
      
      console.log(`Starting bulk import of ${questions.length} coding questions`);
      
      try {
        // Use interactive transaction with proper options
        const result = await prisma.$transaction(async (tx) => {
          const created = [];
          
          for (const input of questions) {
            try {
              const { name, type, status, folderId, codingQuestion } = input;
              
              if (type !== "CODING" || !codingQuestion) {
                console.warn("Skipping non-coding question in bulk import");
                continue;
              }
              
              // Extract coding question data
              const { 
                questionText, 
                defaultMark, 
                difficulty, 
                isAllOrNothing, 
                defaultLanguage,
                languageOptions,
                testCases,
                tagIds
              } = codingQuestion;
              
              // Create the base question
              const question = await tx.question.create({
                data: {
                  name,
                  type: type as QuestionType,
                  status: status as QuestionStatus,
                  folderId,
                  creatorId: user.id || "system",
                  creatorName: user.name || "System",
                  lastModifiedBy: user.id || "system",
                  lastModifiedByName: user.name || "System",
                },
              });
              
              // Prepare language options and test cases for creation in a single operation
              const languageOptionsData = languageOptions.map((option: { language: string; preloadCode?: string; solution: string }) => ({
                language: option.language,
                preloadCode: option.preloadCode || "",
                solution: option.solution,
              }));
              
              const testCasesData = testCases.map((testCase: { input: string; output: string; isSample: boolean; isHidden: boolean; showOnFailure: boolean; gradePercentage: number }) => ({
                input: testCase.input,
                output: testCase.output,
                isSample: testCase.isSample,
                isHidden: testCase.isHidden,
                showOnFailure: testCase.showOnFailure,
                gradePercentage: testCase.gradePercentage,
              }));
              
              // Create coding question with nested create for related data
              const createdCodingQuestion = await tx.codingQuestion.create({
                data: {
                  questionId: question.id,
                  questionText,
                  defaultMark,
                  difficulty,
                  isAllOrNothing,
                  defaultLanguage,
                  // Create language options in a single operation
                  languageOptions: {
                    createMany: {
                      data: languageOptionsData
                    }
                  },
                  // Create test cases in a single operation
                  testCases: {
                    createMany: {
                      data: testCasesData
                    }
                  }
                },
              });
              
              // Associate tags if provided (do this separately since it can't be part of createMany)
              if (tagIds && tagIds.length > 0) {
                await tx.codingQuestion.update({
                  where: { id: createdCodingQuestion.id },
                  data: {
                    tags: {
                      connect: tagIds.map((id: string) => ({ id }))
                    }
                  }
                });
              }
              
              created.push(question);
              console.log(`Imported question: ${name}`);
            } catch (error) {
              console.error(`Error importing question:`, error);
              throw error; // This will roll back the transaction
            }
          }
          
          return created;
        }, {
          maxWait: 10000, // Maximum time to wait to acquire initial lock
          timeout: 30000, // Transaction timeout
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted // Less restrictive isolation level
        });
        
        importedQuestions = result;
        console.log(`Successfully imported ${importedQuestions.length} coding questions`);
      } catch (error) {
        console.error('Bulk import transaction failed:', error);
        throw error;
      }
      
      // Return the list of created questions with their full data
      return Promise.all(importedQuestions.map(async (question) => {
        return prisma.question.findUnique({
          where: { id: question.id },
          include: {
            folder: true,
            codingQuestion: {
              include: {
                languageOptions: true,
                testCases: true,
                tags: true
              }
            }
          }
        });
      }));
    }
  }
}; 