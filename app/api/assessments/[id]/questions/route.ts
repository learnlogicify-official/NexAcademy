import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { updateAssessmentTotalMarks } from "@/lib/utils/assessment-marks";

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
  shuffleQuestions: z.boolean().default(false),
  timeLimitEnabled: z.boolean().default(false),
  timeLimit: z.number().nullable().optional(),
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
      
      // Get existing sections to properly handle updates vs. additions
      const existingSections = await prismaAny.section.findMany({
        where: { assessmentId },
        include: {
          questions: true
        }
      });
      
      console.log(`Found ${existingSections.length} existing sections`);
      
      // Track sections to keep and new sections to create
      const existingSectionIds = existingSections.map((s: any) => s.id);
      const incomingSectionIds = sectionInput.map(s => s.id);
      
      // Identify sections to delete (exist in DB but not in request)
      const sectionIdsToDelete = existingSectionIds.filter((id: string) => !incomingSectionIds.includes(id));
      
      // Only delete sections that need to be removed
      if (sectionIdsToDelete.length > 0) {
        console.log(`Deleting ${sectionIdsToDelete.length} removed sections: ${sectionIdsToDelete.join(', ')}`);
        await prismaAny.section.deleteMany({
          where: { 
            id: {
              in: sectionIdsToDelete 
            }
          }
        });
        console.log(`Successfully deleted removed sections`);
        // Update marks after section deletion
        await updateAssessmentTotalMarks(assessmentId);
      } else {
        console.log(`No sections need to be deleted`);
      }

      // Update total marks after all section modifications
      // Update total marks after all section modifications
      await updateAssessmentTotalMarks(assessmentId);

      // 2. Create or update sections and their relationships
        const createdSections = [];
        
        for (const section of sectionInput) {
          try {
          console.log(`Processing section ${section.name} with ${section.questions.length} questions`);
            
          // Check if section exists
          const existingSection = existingSections.find((s: any) => s.id === section.id);
          
          let newSection;
          if (existingSection) {
            // Update existing section
            console.log(`Updating existing section: ${section.id}`);
            newSection = await prismaAny.section.update({
              where: { id: section.id },
              data: {
                title: section.name,
                description: section.description,
                order: section.order || 0,
                shuffleQuestions: section.shuffleQuestions !== undefined ? section.shuffleQuestions : false,
                timeLimitEnabled: section.timeLimitEnabled !== undefined ? section.timeLimitEnabled : false,
                timeLimit: section.timeLimitEnabled ? section.timeLimit : null
              }
            });
            
            // First, get current question IDs for this section to determine what to keep/remove
            const currentQuestionIds = await prismaAny.sectionQuestion.findMany({
              where: { sectionId: section.id },
              select: { questionId: true }
            });
            
            const currentIds = currentQuestionIds.map((q: { questionId: string }) => q.questionId);
            const incomingIds = section.questions.map(q => typeof q === 'string' ? q : q.id);
            
            // Find question relationships to delete (exist in DB but not in request)
            const questionIdsToRemove = currentIds.filter((id: string) => !incomingIds.includes(id));
            
            // Remove questions that are no longer in the section
            if (questionIdsToRemove.length > 0) {
              console.log(`Removing ${questionIdsToRemove.length} questions from section ${section.id}`);
              await prismaAny.sectionQuestion.deleteMany({
                where: {
                  sectionId: section.id,
                  questionId: {
                    in: questionIdsToRemove
                  }
                }
              });
            }
          } else {
            // Create new section
            console.log(`Creating new section: ${section.id}`);
            newSection = await prismaAny.section.create({
              data: {
                id: section.id,
                title: section.name,
                description: section.description,
                order: section.order || 0,
                shuffleQuestions: section.shuffleQuestions !== undefined ? section.shuffleQuestions : false,
                timeLimitEnabled: section.timeLimitEnabled !== undefined ? section.timeLimitEnabled : false,
                timeLimit: section.timeLimitEnabled ? section.timeLimit : null,
                assessment: {
                  connect: { id: assessmentId }
                }
              }
            });
          }
            
          console.log(`Section processed with ID: ${newSection.id}`);
            
          // Add questions to section if there are any new ones
            if (section.questions && section.questions.length > 0) {
            console.log(`Processing ${section.questions.length} questions for section ${newSection.id}`);
              
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
              
            // Check which questions are already in the section to avoid duplicates
            const existingRelationships = await prismaAny.sectionQuestion.findMany({
              where: {
                sectionId: newSection.id,
                questionId: {
                  in: existingQuestionIds
                }
              },
              select: {
                questionId: true,
                sectionMark: true
              }
            });
            
            const existingRelationshipIds = existingRelationships.map((r: { questionId: string }) => r.questionId);
              
            // Prepare SectionQuestion data only for NEW relationships or UPDATED marks
            const sectionQuestionData = [];
            const sectionQuestionUpdates = [];
            
            for (let i = 0; i < questionEntries.length; i++) {
              const { id: questionId, sectionMark } = questionEntries[i];
                
                // Skip if question doesn't exist
              if (!existingQuestionIds.includes(questionId)) {
                  console.warn(`Question ${questionId} doesn't exist, skipping`);
                  continue;
                }
                
              // If relationship already exists, check if mark needs updating
              if (existingRelationshipIds.includes(questionId)) {
                const existingRel = existingRelationships.find((r: { questionId: string; sectionMark: number | null }) => r.questionId === questionId);
                if (existingRel && existingRel.sectionMark !== sectionMark) {
                  sectionQuestionUpdates.push({
                    questionId,
                    sectionMark
                  });
                }
                // Skip creating a new relationship
                continue;
              }
              
              // Otherwise, prepare for creation
              sectionQuestionData.push({
                      sectionId: newSection.id,
                questionId,
                order: i,
                sectionMark
              });
            }
            
            // If there are new questions to add, use createMany for better performance
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
            
            // Update marks for existing relationships if needed
            for (const update of sectionQuestionUpdates) {
              try {
                await prismaAny.sectionQuestion.updateMany({
                  where: {
                    sectionId: newSection.id,
                    questionId: update.questionId
                  },
                  data: {
                    sectionMark: update.sectionMark
                }
                });
              } catch (updateError) {
                console.error(`Error updating mark for question ${update.questionId}:`, updateError);
              }
            }
            
            if (sectionQuestionUpdates.length > 0) {
              console.log(`Updated marks for ${sectionQuestionUpdates.length} existing questions`);
            }
            }
            
            // Add to response
            createdSections.push({
              ...newSection,
              questions: section.questions || []
            });
            
          } catch (sectionError) {
          console.error(`Error processing section ${section.id}:`, sectionError);
          // Continue with other sections instead of failing completely
          }
        }
        
      console.log(`Processed ${createdSections.length} sections`);
        
      // Get count of section-question relationships
      const totalRelationships = await prismaAny.sectionQuestion.count({
          where: {
            sectionId: {
              in: createdSections.map(s => s.id)
            }
          }
        });
        
      console.log(`Total section-question relationships: ${totalRelationships}`);
        
      // Update total marks using centralized function
      const updatedAssessment = await updateAssessmentTotalMarks(assessmentId);
      const totalMarks = updatedAssessment.totalMarks;
      
      console.log(`Updated assessment ${assessmentId} with total marks: ${totalMarks}`);
        
      return NextResponse.json({
        id: assessmentId,
        sections: createdSections,
        totalMarks
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