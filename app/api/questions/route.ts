import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Question } from "@prisma/client";

export async function GET(request: Request) {
  try {
    console.log("Fetching questions...");
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const showHidden = searchParams.get("showHidden") === "true";
    const includeSubcategories = searchParams.get("includeSubcategories") === "true";

    console.log("Query params:", { 
      category, 
      subcategory, 
      type, 
      status, 
      showHidden, 
      includeSubcategories 
    });

    // Start with base conditions
    const whereClause: Prisma.QuestionWhereInput = {
      ...(type && type !== "all" ? { type } : {}),
      ...(status && status !== "all" ? { status } : {}),
      ...(showHidden ? {} : { hidden: false }),
    };

    // Handle category and subcategory filtering
    if (subcategory) {
      // If subcategory is selected, only show questions in that subcategory
      whereClause.folderId = subcategory;
    } else if (category && category !== "all") {
      if (includeSubcategories) {
        // If includeSubcategories is true, get all subfolder IDs and include them in the query
        const subfolders = await prisma.folder.findMany({
          where: { parentId: category },
          select: { id: true }
        });
        const subfolderIds = subfolders.map(f => f.id);
        
        // Show questions in the category OR any of its subcategories
        whereClause.OR = [
          { folderId: category },
          { folderId: { in: subfolderIds } }
        ];
      } else {
        // If includeSubcategories is false, only show questions directly in the category
        whereClause.folderId = category;
      }
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            parentId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found questions:', {
      count: questions.length,
      sample: questions.slice(0, 2).map(q => ({
        id: q.id,
        folderId: q.folderId,
        folder: q.folder
      }))
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch questions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    const { 
      question: questionText, 
      type, 
      folderId, 
      options, 
      correctAnswer, 
      testCases, 
      expectedOutput,
      status,
      singleAnswer,
      shuffleAnswers,
      hidden,
      marks
    } = data;

    // Validate required fields
    if (!questionText || !type || !folderId) {
      console.error("Missing required fields:", { questionText, type, folderId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the question with basic fields first
    const questionData = {
      question: questionText,
      type,
      folderId,
      options: options || [],
      correctAnswer: correctAnswer || null,
      testCases: testCases ? JSON.parse(JSON.stringify(testCases)) : null,
      expectedOutput: expectedOutput || null,
      status: status || 'DRAFT',
      singleAnswer: singleAnswer || false,
      shuffleAnswers: shuffleAnswers || false,
      hidden: hidden || false,
      marks: marks || 1
    };

    console.log("Creating question with data:", questionData);
    const createdQuestion = await prisma.question.create({
      data: questionData,
      include: {
        folder: true
      }
    });

    console.log("Created question:", createdQuestion);
    return NextResponse.json(createdQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to create question", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 