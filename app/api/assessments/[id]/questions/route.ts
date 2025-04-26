import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";

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
    const assessment = await prismaAny.assessment.findUnique({
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
      // Instead of using a transaction, we'll do each operation separately
      // which is better for serverless environments
      
      // 1. Delete existing sections - this cascades to SectionQuestion due to Prisma schema
      console.log(`Deleting existing sections for assessment: ${assessmentId}`);
      await prismaAny.section.deleteMany({
        where: { assessmentId }
      });
      console.log(`Successfully deleted existing sections`);

      // 2. Create new sections and their relationships
      const createdSections = [];
      
      for (const section of sectionInput) {
        try {
          console.log(`Creating section ${section.name} with ${section.questions.length} questions`);
          
          // Create the section
          const newSection = await prismaAny.section.create({
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
          
          // Add questions to section if there are any
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
            
            // Verify questions exist
            const existingQuestions = await prismaAny.question.findMany({
              where: {
                id: {
                  in: questionIds
                }
              },
              select: {
                id: true
              }
            });
            
            const existingQuestionIds = existingQuestions.map((q: { id: string }) => q.id);
            console.log(`Found ${existingQuestions.length} existing questions out of ${questionIds.length}`);
            
            // Prepare SectionQuestion data for bulk create
            const sectionQuestionData = [];
            
            for (let i = 0; i < questionEntries.length; i++) {
              const { id: questionId, sectionMark } = questionEntries[i];
              
              // Skip if question doesn't exist
              if (!existingQuestionIds.includes(questionId)) {
                console.warn(`Question ${questionId} doesn't exist, skipping`);
                continue;
              }
              
              sectionQuestionData.push({
                sectionId: newSection.id,
                questionId,
                order: i,
                sectionMark
              });
            }
            
            // If there are questions to add, use createMany for better performance
            if (sectionQuestionData.length > 0) {
              try {
                // Use Prisma's createMany for much better performance
                // This is much faster than creating one-by-one
                await prismaAny.sectionQuestion.createMany({
                  data: sectionQuestionData,
                  skipDuplicates: true
                });
                
                console.log(`Successfully created ${sectionQuestionData.length} section-question relationships in batch`);
              } catch (batchError) {
                console.error(`Error in bulk creation:`, batchError);
                
                // Fallback to individual creation only if bulk fails
                console.log("Trying individual creation as fallback...");
                let successCount = 0;
                
                for (const item of sectionQuestionData) {
                  try {
                    await prismaAny.sectionQuestion.create({ data: item });
                    successCount++;
                  } catch (itemError) {
                    console.error(`Error creating relationship for question ${item.questionId}:`, itemError);
                  }
                }
                
                console.log(`Fallback: Created ${successCount} out of ${sectionQuestionData.length} relationships`);
              }
            }
          }
          
          // Add to response
          createdSections.push({
            ...newSection,
            questions: section.questions || []
          });
          
        } catch (sectionError) {
          console.error(`Error creating section ${section.id}:`, sectionError);
          // Continue with other sections instead of failing completely
        }
      }
      
      console.log(`Created ${createdSections.length} sections`);
      
      // Get count of section-question relationships
      const totalRelationships = await prismaAny.sectionQuestion.count({
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