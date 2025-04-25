import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    // Extract the question IDs from the request body
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No question IDs provided" },
        { status: 400 }
      );
    }

    // Delete the questions in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // For each question ID, delete the question
      const deletedQuestions = await Promise.all(
        ids.map(async (id) => {
          try {
            // First check if the question exists
            const question = await prisma.question.findUnique({
              where: { id },
              include: {
                mCQQuestion: true,
                codingQuestion: {
                  include: {
                    languageOptions: true,
                    testCases: true,
                  },
                },
              },
            });

            if (!question) {
              return { id, success: false, error: "Question not found" };
            }

            // Delete the question and its related data
            if (question.type === "MCQ" && question.mCQQuestion) {
              // Delete MCQ options
              await prisma.mCQOption.deleteMany({
                where: { mcqQuestionId: question.mCQQuestion.id },
              });
              
              // Delete MCQ question
              await prisma.mCQQuestion.delete({
                where: { id: question.mCQQuestion.id },
              });
            } else if (question.type === "CODING" && question.codingQuestion) {
              // Delete language options
              await prisma.languageOption.deleteMany({
                where: { codingQuestionId: question.codingQuestion.id },
              });

              // Delete test cases
              await prisma.testCase.deleteMany({
                where: { codingQuestionId: question.codingQuestion.id },
              });

              // Delete coding question
              await prisma.codingQuestion.delete({
                where: { id: question.codingQuestion.id },
              });
            }

            // Delete the question itself
            await prisma.question.delete({
              where: { id },
            });

            return { id, success: true };
          } catch (error) {
            console.error(`Error deleting question ${id}:`, error);
            return { id, success: false, error: "Failed to delete question" };
          }
        })
      );

      return deletedQuestions;
    });

    // Count successful deletions
    const successCount = result.filter((r) => r.success).length;
    const failedCount = result.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Deleted ${successCount} questions, ${failedCount} failed`,
      results: result,
    });
  } catch (error) {
    console.error("Error handling bulk delete:", error);
    return NextResponse.json(
      { error: "Failed to process bulk delete request" },
      { status: 500 }
    );
  }
} 