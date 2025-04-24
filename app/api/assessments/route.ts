import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define enum values as string literals
const AssessmentType = {
  SEQUENCE: "SEQUENCE",
  FREE: "FREE"
} as const;

const AssessmentMode = {
  WEB_PROCTORED: "WEB_PROCTORED",
  NOT_WEB_PROCTORED: "NOT_WEB_PROCTORED"
} as const;

const AssessmentAttemptType = {
  LIMITED: "LIMITED",
  UNLIMITED: "UNLIMITED"
} as const;

const AssessmentStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
} as const;

// Schema for assessment creation validation
const assessmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.coerce.date(),  // Use coerce to handle string dates from JSON
  endDate: z.coerce.date(),    // Use coerce to handle string dates from JSON
  duration: z.number().int().positive(),
  totalMarks: z.number().int().min(0),
  passingMarks: z.number().int().min(0),
  status: z.enum(Object.values(AssessmentStatus) as [string, ...string[]]),
  folderId: z.string(),
  // Direct fields for settings
  type: z.enum(Object.values(AssessmentType) as [string, ...string[]]).optional(),
  mode: z.enum(Object.values(AssessmentMode) as [string, ...string[]]).optional(),
  attemptCount: z.number().int().min(0).optional(),
  attemptType: z.enum(Object.values(AssessmentAttemptType) as [string, ...string[]]).optional(),
  enableSEB: z.boolean().optional(),
  disableCopyPaste: z.boolean().optional(),
  disableRightClick: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  reviewMode: z.string().optional(),
  // Accept settings object which contains some fields
  settings: z.object({
    type: z.enum(Object.values(AssessmentType) as [string, ...string[]]),
    mode: z.enum(Object.values(AssessmentMode) as [string, ...string[]]),
    attemptCount: z.number().int().min(0).optional(),
    attemptType: z.enum(Object.values(AssessmentAttemptType) as [string, ...string[]]).optional(),
    enableSEB: z.boolean().optional(),
    disableCopyPaste: z.boolean().optional(),
    disableRightClick: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    reviewMode: z.string().optional(),
  }).optional(),
  questions: z.array(z.object({
    questionId: z.string(),
    marks: z.number().int().min(0),
    order: z.number().int().min(0),
    sectionId: z.string().optional()
  })),
  sections: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().int().min(0)
  })).optional()
});

// GET handler to list assessments
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    const where = status ? { status } : {};
    
    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        folder: {
          select: {
            name: true
          }
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });
    
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

// POST handler to create a new assessment
export async function POST(req: NextRequest) {
  console.log("Assessment POST API endpoint called");
  
  try {
    console.log("Checking user session");
    const session = await getServerSession(authOptions);
    
    console.log("Session:", JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      console.log("Unauthorized: No valid session found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("User authenticated:", session.user.email);
    console.log("User object in session:", JSON.stringify(session.user, null, 2));
    
    // Get user ID, log if missing
    const userId = session.user.id;
    if (!userId) {
      console.log("WARNING: User ID is missing from session!");
      
      // Try to find user by email instead if id is missing
      if (session.user.email) {
        console.log("Attempting to find user by email:", session.user.email);
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });
        
        if (user) {
          console.log("Found user ID from email lookup:", user.id);
          session.user.id = user.id; // Update session with ID
        } else {
          console.error("Could not find user with email:", session.user.email);
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }
      } else {
        console.error("No email available to find user");
        return NextResponse.json(
          { error: "Invalid user session" },
          { status: 401 }
        );
      }
    }
    
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));
    
    // Validate assessment data
    console.log("Validating assessment data with Zod");
    try {
      // Check each field individually to identify the problematic field
      console.log("Validating name:", body.name);
      z.string().min(1, "Name is required").parse(body.name);
      
      console.log("Validating description:", body.description);
      if (body.description !== undefined) {
        z.string().optional().parse(body.description);
      }
      
      console.log("Validating startDate:", body.startDate);
      if (typeof body.startDate === 'string') {
        // Try to parse string date
        console.log("Converting string date to Date object");
        const parsedDate = new Date(body.startDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid startDate format");
        }
      } else if (!(body.startDate instanceof Date)) {
        throw new Error("startDate must be a Date or string");
      }
      
      console.log("Validating endDate:", body.endDate);
      if (typeof body.endDate === 'string') {
        // Try to parse string date
        console.log("Converting string date to Date object");
        const parsedDate = new Date(body.endDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid endDate format");
        }
      } else if (!(body.endDate instanceof Date)) {
        throw new Error("endDate must be a Date or string");
      }
      
      console.log("Validating duration:", body.duration);
      z.number().int().positive().parse(body.duration);
      
      console.log("Validating totalMarks:", body.totalMarks);
      z.number().int().min(0).parse(body.totalMarks);
      
      console.log("Validating passingMarks:", body.passingMarks);
      z.number().int().min(0).parse(body.passingMarks);
      
      console.log("Validating status:", body.status);
      z.enum(Object.values(AssessmentStatus) as [string, ...string[]]).parse(body.status);
      
      console.log("Validating folderId:", body.folderId);
      z.string().parse(body.folderId);
      
      // Check for settings object
      if (body.settings) {
        console.log("Found settings object, validating fields inside settings");
        
        console.log("Validating type from settings:", body.settings.type);
        z.enum(Object.values(AssessmentType) as [string, ...string[]]).parse(body.settings.type);
        
        console.log("Validating mode from settings:", body.settings.mode);
        z.enum(Object.values(AssessmentMode) as [string, ...string[]]).parse(body.settings.mode);
      } else {
        // Fall back to top-level fields if no settings object
        console.log("No settings object found, validating top-level fields");
        
        console.log("Validating type:", body.type);
        if (body.type === undefined) {
          console.log("Type is undefined, this is allowed if optional");
        } else {
          z.enum(Object.values(AssessmentType) as [string, ...string[]]).optional().parse(body.type);
        }
        
        console.log("Validating mode:", body.mode);
        if (body.mode === undefined) {
          console.log("Mode is undefined, this is allowed if optional");
        } else {
          z.enum(Object.values(AssessmentMode) as [string, ...string[]]).optional().parse(body.mode);
        }
      }
      
      console.log("Validating attemptType:", body.attemptType);
      if (body.attemptType === undefined) {
        console.log("attemptType is undefined, this is allowed if optional");
      } else {
        z.enum(Object.values(AssessmentAttemptType) as [string, ...string[]]).optional().parse(body.attemptType);
      }
      
      console.log("Validating attemptCount:", body.attemptCount);
      if (body.attemptCount === undefined) {
        console.log("attemptCount is undefined, this is allowed if optional");
      } else {
        z.number().int().min(0).optional().parse(body.attemptCount);
      }
      
      // Validate boolean fields
      console.log("Validating enableSEB:", body.enableSEB);
      if (body.enableSEB !== undefined) {
        z.boolean().optional().parse(body.enableSEB);
      }
      
      console.log("Validating disableCopyPaste:", body.disableCopyPaste);
      if (body.disableCopyPaste !== undefined) {
        z.boolean().optional().parse(body.disableCopyPaste);
      }
      
      console.log("Validating disableRightClick:", body.disableRightClick);
      if (body.disableRightClick !== undefined) {
        z.boolean().optional().parse(body.disableRightClick);
      }
      
      console.log("Validating questions:", body.questions);
      if (!Array.isArray(body.questions)) {
        throw new Error("questions must be an array");
      }
      
      for (let i = 0; i < body.questions.length; i++) {
        console.log(`Validating question ${i}:`, body.questions[i]);
        z.object({
          questionId: z.string(),
          marks: z.number().int().min(0),
          order: z.number().int().min(0),
          sectionId: z.string().optional()
        }).parse(body.questions[i]);
      }
      
      console.log("All individual field validations passed, proceeding with full schema validation");
      const validatedData = assessmentSchema.parse(body);
      console.log("Full validation successful");

      // Validate that the database model fields are correct
      // Use getPrismaClient() to check for the existence of models - commented for now
      console.log("Checking for Assessment model in Prisma schema");
      const models = Object.keys(prisma).filter(key => !key.startsWith('_'));
      console.log("Available models in Prisma client:", models);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.format() },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    const validatedData = assessmentSchema.parse(body);
    
    // Extract questions for separate creation
    console.log("Extracting question data");
    const { questions, ...assessmentData } = validatedData;
    console.log("Assessment data:", JSON.stringify(assessmentData, null, 2));
    console.log("Questions data:", JSON.stringify(questions, null, 2));
    
    // Test database connection
    console.log("Testing database connection");
    try {
      // Try a simple query to check if the database is working
      const testUser = await prisma.user.findFirst({
        select: { id: true, email: true },
        take: 1
      });
      console.log("Database connection test successful. Found user:", testUser ? testUser.email : "No users found");
      
      // Check if the folder exists 
      const folder = await prisma.folder.findUnique({
        where: { id: assessmentData.folderId }
      });
      
      if (!folder) {
        console.error("Folder not found with ID:", assessmentData.folderId);
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 400 }
        );
      }
      console.log("Found folder:", folder.name);
      
      // Verify question IDs
      if (questions.length > 0) {
        const questionIds = questions.map(q => q.questionId);
        const foundQuestions = await prisma.question.findMany({
          where: { id: { in: questionIds } },
          select: { id: true }
        });
        
        console.log(`Found ${foundQuestions.length} of ${questionIds.length} questions`);
        
        if (foundQuestions.length !== questionIds.length) {
          const foundIds = foundQuestions.map(q => q.id);
          const missingIds = questionIds.filter(id => !foundIds.includes(id));
          console.error("Missing question IDs:", missingIds);
          return NextResponse.json(
            { error: "Some question IDs not found", details: { missingIds } },
            { status: 400 }
          );
        }
      }
    } catch (dbTestError) {
      console.error("Database connection test failed:", dbTestError);
      return NextResponse.json(
        { error: "Database connection error", details: dbTestError instanceof Error ? dbTestError.message : String(dbTestError) },
        { status: 500 }
      );
    }
    
    // Create assessment
    console.log("Creating assessment in database");
    try {
      // Extract settings from nested object if present
      let typeValue = assessmentData.type;
      let modeValue = assessmentData.mode;
      let attemptCount = assessmentData.attemptCount;
      let attemptType = assessmentData.attemptType;
      let enableSEB = assessmentData.enableSEB;
      let disableCopyPaste = assessmentData.disableCopyPaste;
      let disableRightClick = assessmentData.disableRightClick;
      let tags = assessmentData.tags;
      let reviewMode = assessmentData.reviewMode;
      
      if (body.settings) {
        console.log("Using values from settings object");
        typeValue = body.settings.type;
        modeValue = body.settings.mode;
        attemptCount = body.settings.attemptCount;
        attemptType = body.settings.attemptType;
        enableSEB = body.settings.enableSEB;
        disableCopyPaste = body.settings.disableCopyPaste;
        disableRightClick = body.settings.disableRightClick;
        tags = body.settings.tags;
        reviewMode = body.settings.reviewMode;
      }
      
      console.log("User ID from session:", session.user.id);
      
      // Filter out fields that are not in the database schema
      const filteredData = {
        name: assessmentData.name,
        description: assessmentData.description,
        startDate: assessmentData.startDate,
        endDate: assessmentData.endDate,
        duration: assessmentData.duration,
        totalMarks: assessmentData.totalMarks,
        passingMarks: assessmentData.passingMarks,
        status: assessmentData.status,
        // Use direct ID assignment which is more reliable
        createdById: session.user.id,
        folderId: assessmentData.folderId,
        // Include additional settings fields
        type: typeValue,
        mode: modeValue,
        attemptCount: attemptCount,
        attemptType: attemptType || 'LIMITED',
        enableSEB: enableSEB,
        disableCopyPaste: disableCopyPaste,
        disableRightClick: disableRightClick,
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined,
        reviewMode: reviewMode
      };

      console.log("Filtered data for database:", JSON.stringify(filteredData, null, 2));
      
      const assessment = await prisma.assessment.create({
        data: filteredData
      });
      console.log("Assessment created successfully:", assessment.id);
    
    // Create assessment questions
      console.log("Creating assessment questions");
    const assessmentQuestions = await Promise.all(
        questions.map(async (question, index) => {
          console.log(`Creating question ${index + 1}:`, question);
          try {
            // Create question data object
            const questionData: any = {
              assessmentId: assessment.id,
              questionId: question.questionId,
              marks: question.marks,
              order: question.order || index + 1
            };
            
            // Only add sectionId if it exists in the schema
            if (question.sectionId) {
              // Check if the field exists in the schema
              try {
                // This is a dynamic approach to check if sectionId exists
                questionData.sectionId = question.sectionId;
              } catch (err) {
                console.warn("sectionId field not supported in AssessmentQuestion model, ignoring");
              }
            }
            
            const result = await prisma.assessmentQuestion.create({
              data: questionData
            });
            console.log(`Question ${index + 1} created:`, result.id);
            return result;
          } catch (questionError) {
            console.error(`Error creating question ${index + 1}:`, questionError);
            throw questionError;
          }
      })
    );
      console.log("All assessment questions created");
    
    // If sections are provided, create them
    if (body.sections && Array.isArray(body.sections) && body.sections.length > 0) {
      console.log("Creating assessment sections");
      try {
        // Check if the assessmentSection model exists in a safer way
        const modelExists = Object.prototype.hasOwnProperty.call(prisma, 'assessmentSection');
        
        if (modelExists) {
          const sections = await Promise.all(
            body.sections.map(async (section: any, index: number) => {
              try {
                return await (prisma as any).assessmentSection.create({
                  data: {
                    title: section.title,
                    description: section.description,
                    order: section.order || index + 1,
                    assessmentId: assessment.id
                  }
                });
              } catch (sectionError) {
                console.error(`Error creating section ${index + 1}:`, sectionError);
                return null;
              }
            })
          );
          console.log("Assessment sections created:", sections.filter(Boolean).length);
        } else {
          console.warn("assessmentSection model not found in Prisma client, skipping section creation");
        }
      } catch (sectionsError) {
        console.error("Error creating assessment sections:", sectionsError);
      }
    }
    
    return NextResponse.json({
      assessment,
      questions: assessmentQuestions
    }, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.format());
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    
    console.error("Error creating assessment:", error);
    // Log any additional error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to create assessment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 