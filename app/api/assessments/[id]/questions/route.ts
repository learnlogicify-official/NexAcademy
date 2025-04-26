import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

// Define the schema with a clear typing for the questions array to ensure it's handled correctly
const questionSchema = z.object({
  id: z.string(),
  sectionMark: z.number().optional()
});

const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  order: z.number().default(0),
  questions: z.array(
    z.union([
      z.string(),
      questionSchema
    ])
  ).default([])
});

const updateQuestionsSchema = z.object({
  sections: z.array(sectionSchema)
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate assessment ID
    const resolvedParams = await params;
    const assessmentId = resolvedParams.id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Validate body
    const body = await req.json();
    console.log("Received body:", body); // Debug log
    
    const validation = updateQuestionsSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error); // Debug log
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sections: sectionInput } = validation.data;

    // Debug logging to verify question arrays are coming through correctly
    for (const section of sectionInput) {
      console.log(`Processing section ${section.name}: ${section.questions.length} questions`);
      if (section.questions.length > 0) {
        console.log(`  Question items: ${JSON.stringify(section.questions)}`);
      }
    }

    // Check if assessment exists and user has access
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { createdBy: true }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only allow creator or admin to modify assessment
    if (assessment.createdBy.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "You don't have permission to modify this assessment" },
        { status: 403 }
      );
    }

    try {
      // Use a transaction to ensure all operations are atomic
      return await prismaAny.$transaction(async (tx) => {
        // Delete existing sections and their question relationships
        console.log(`Deleting existing sections for assessment: ${assessmentId}`);
        await tx.section.deleteMany({
          where: { assessmentId }
        });
        console.log(`Successfully deleted existing sections`);

        // Create new sections and their relationships
        const createdSections = [];
        
        for (const section of sectionInput) {
          try {
            console.log(`Creating section ${section.name} with ${section.questions.length} questions`);
            
            // Create the section
            const newSection = await tx.section.create({
              data: {
                id: section.id,
                title: section.name,
                description: section.description,
                order: section.order || 0,
                assessment: {
                  connect: { id: assessmentId }
                }
              }
            });
            
            console.log(`Section created with ID: ${newSection.id}`);
            
            // Create the SectionQuestion entries one by one to ensure reliable creation
            if (section.questions && section.questions.length > 0) {
              console.log(`Adding ${section.questions.length} questions to section ${newSection.id}`);
              
              // Process questions, which might be strings or objects
              const questionEntries = section.questions.map(q => {
                if (typeof q === 'string') {
                  return { id: q, sectionMark: null };
                } else {
                  return { id: q.id, sectionMark: q.sectionMark || null };
                }
              });
              
              const questionIds = questionEntries.map(q => q.id);
              
              // First verify questions exist
              const existingQuestions = await tx.question.findMany({
                where: {
                  id: {
                    in: questionIds
                  }
                },
                select: {
                  id: true
                }
              });
              
              console.log(`Found ${existingQuestions.length} existing questions out of ${questionIds.length}`);
              
              // Track successful and failed creations
              const successfulCreations = [];
              
              // Create each SectionQuestion relationship
              for (let i = 0; i < questionEntries.length; i++) {
                const { id: questionId, sectionMark } = questionEntries[i];
                
                // Skip if question doesn't exist
                if (!existingQuestions.some(q => q.id === questionId)) {
                  console.warn(`Question ${questionId} doesn't exist, skipping`);
                  continue;
                }
                
                try {
                  // Create the relationship with sectionMark if provided
                  const relationship = await tx.sectionQuestion.create({
                    data: {
                      sectionId: newSection.id,
                      questionId: questionId,
                      order: i,
                      sectionMark: sectionMark
                    }
                  });
                  
                  successfulCreations.push(relationship);
                  console.log(`Created relationship for question ${questionId} at position ${i}${sectionMark ? ` with mark ${sectionMark}` : ''}`);
                } catch (relError) {
                  console.error(`Failed to create relationship for question ${questionId}:`, relError);
                  // Continue with other questions instead of failing completely
                }
              }
              
              console.log(`Created ${successfulCreations.length} relationships for section ${newSection.id}`);
            }
            
            // Add to response
            createdSections.push({
              ...newSection,
              questions: section.questions || []
            });
            
          } catch (sectionError) {
            console.error(`Error creating section ${section.id}:`, sectionError);
            throw sectionError;
          }
        }
        
        console.log(`Created ${createdSections.length} sections`);
        
        // Do a verification check to confirm relationships were created
        const totalRelationships = await tx.sectionQuestion.count({
          where: {
            sectionId: {
              in: createdSections.map(s => s.id)
            }
          }
        });
        
        console.log(`Created a total of ${totalRelationships} section-question relationships`);
        
        return NextResponse.json({
          id: assessmentId,
          sections: createdSections
        });
      });
    } catch (error) {
      console.error("Error updating assessment sections:", error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update assessment sections" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}