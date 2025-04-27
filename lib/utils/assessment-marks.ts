/**
 * Utility functions for calculating assessment marks
 */

import { prisma } from "@/lib/prisma";

/**
 * Calculate the total marks for an assessment based on all questions in all sections
 * @param assessmentId The ID of the assessment to calculate marks for
 * @returns The total marks value
 */
export async function calculateTotalMarks(assessmentId: string): Promise<number> {
  try {
    // Get all sections for this assessment with their questions
    const sections = await prisma.section.findMany({
      where: { assessmentId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                mCQQuestion: true,
                codingQuestion: true
              }
            }
          }
        }
      }
    });

    let totalMarks = 0;

    // Calculate the sum of all section marks
    for (const section of sections) {
      for (const sectionQuestion of section.questions) {
        // Use the section mark if available, otherwise use the default mark from the question
        if (sectionQuestion.sectionMark !== null && sectionQuestion.sectionMark !== undefined) {
          totalMarks += sectionQuestion.sectionMark;
        } else {
          // Get the default mark from the question based on its type
          const question = sectionQuestion.question;
          const defaultMark = question.mCQQuestion?.defaultMark || 
                            question.codingQuestion?.defaultMark || 
                            1; // Default to 1 if no mark is specified
          
          totalMarks += defaultMark;
        }
      }
    }

    return totalMarks;
  } catch (error) {
    console.error("Error calculating total marks:", error);
    throw error;
  }
}

/**
 * Update the totalMarks field of an assessment
 * @param assessmentId The ID of the assessment to update
 * @returns The updated assessment
 */
export async function updateAssessmentTotalMarks(assessmentId: string) {
  try {
    // Calculate the total marks
    const totalMarks = await calculateTotalMarks(assessmentId);
    
    // Update the assessment with the new total marks
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: { totalMarks }
    });
    
    return updatedAssessment;
  } catch (error) {
    console.error("Error updating assessment total marks:", error);
    throw error;
  }
}