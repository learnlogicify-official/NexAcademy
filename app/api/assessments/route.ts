import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";
import { AssessmentStatus, Prisma } from "@prisma/client";

// Define schema for assessment creation
const createAssessmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "READY"]).default("DRAFT"),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  totalMarks: z.number().int().positive().default(100),
  passingMarks: z.number().int().min(0),
  folderId: z.string().min(1),
  
  // Additional settings
  navigationMethod: z.string().default("free"),
  shuffleWithinQuestions: z.boolean().default(false),
  questionBehaviourMode: z.string().default("deferredfeedback"),
  
  // Attempts handling
  unlimitedAttempts: z.boolean().default(false),
  attemptsAllowed: z.number().int().nullable().default(1),
  
  // Time settings
  timeBoundEnabled: z.boolean().default(false),
  timeLimitEnabled: z.boolean().default(false),
  
  // Review settings
  reviewDuringAttempt: z.boolean().default(false),
  reviewImmediatelyAfterAttempt: z.boolean().default(false),
  reviewLaterWhileOpen: z.boolean().default(false),
  reviewAfterClose: z.boolean().default(false),
  
  // Proctoring settings
  proctoring: z.enum(["proctoring", "not_proctoring"]).default("not_proctoring"),
  disableRightClick: z.boolean().default(false),
  disableCopyPaste: z.boolean().default(false),
  
  // Grade settings
  gradeToPass: z.number().int().min(0).max(100).optional(),
  
  // Display settings
  displayDescription: z.boolean().default(false),
});

// POST handler to create a new assessment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('User session:', session);
    
    if (!session?.user?.email) {
      console.log('No user session found');
      return NextResponse.json({ message: "Unauthorized - login required" }, { status: 401 });
    }

    // Get the user from the database as the session might not have the ID
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found in database:', session.user.email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log('Authenticated user:', user);
    
    const body = await req.json();
    console.log('Received raw request body:', body);

    // Validate the request body
    const validatedData = createAssessmentSchema.parse(body);
    console.log('Validated assessment data:', validatedData);
    
    // Prepare the data for Prisma
    const assessmentData = {
      name: validatedData.name,
      description: validatedData.description || "",
      status: AssessmentStatus[validatedData.status as keyof typeof AssessmentStatus],
      totalMarks: validatedData.totalMarks,
      passingMarks: validatedData.passingMarks,
      createdBy: {
        connect: { id: user.id }
      },
      folder: {
        connect: { id: validatedData.folderId }
      },
      startDate: validatedData.startDate || new Date(),
      endDate: validatedData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      duration: validatedData.duration || 60,
      timeBoundEnabled: validatedData.timeBoundEnabled,
      timeLimitEnabled: validatedData.timeLimitEnabled,
      gradeToPass: validatedData.gradeToPass,
      attemptsAllowed: validatedData.attemptsAllowed,
      unlimitedAttempts: validatedData.unlimitedAttempts,
      displayDescription: validatedData.displayDescription,
      navigationMethod: validatedData.navigationMethod,
      shuffleWithinQuestions: validatedData.shuffleWithinQuestions,
      questionBehaviourMode: validatedData.questionBehaviourMode,
      reviewDuringAttempt: validatedData.reviewDuringAttempt,
      reviewImmediatelyAfterAttempt: validatedData.reviewImmediatelyAfterAttempt,
      reviewLaterWhileOpen: validatedData.reviewLaterWhileOpen,
      reviewAfterClose: validatedData.reviewAfterClose,
      proctoring: validatedData.proctoring,
      disableRightClick: validatedData.disableRightClick,
      disableCopyPaste: validatedData.disableCopyPaste
    };

    console.log('Prepared Prisma data:', assessmentData);

    try {
      // Create the assessment
      const assessment = await db.assessment.create({
        data: assessmentData
      });
      console.log('Successfully created assessment:', assessment);
      return NextResponse.json(assessment);
    } catch (dbError) {
      console.error('Database error creating assessment:', dbError);
      return NextResponse.json(
        { message: 'Database error', error: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.errors);
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) }, 
      { status: 500 }
    );
  }
}

// GET handler to list assessments
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse query params
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folderId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    const where: any = {};
    if (folderId) where.folderId = folderId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const total = await db.assessment.count({ where });
    const assessments = await db.assessment.findMany({
      where,
      include: {
        folder: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      assessments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("[ASSESSMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT handler to update an assessment
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new NextResponse("Assessment ID is required", { status: 400 });
    }

    const assessment = await db.assessment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("[ASSESSMENTS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE handler to remove an assessment
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Assessment ID is required", { status: 400 });
    }

    await db.assessment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ASSESSMENTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 