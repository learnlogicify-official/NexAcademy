import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret to ensure only authorized calls
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all problems that need average time recalculation
    const problems = await prisma.question.findMany({
      where: {
        type: "CODING",
        status: "READY"
      },
      select: {
        id: true
      }
    });

    // Process each problem
    const results = await Promise.all(
      problems.map(async (problem) => {
        try {
          // Calculate new average time
          const timeSpentRecords = await prisma.problemTimeSpent.findMany({
            where: {
              problemId: problem.id,
              timeSpentMs: {
                gt: 0 // Only consider valid times
              }
            },
            select: {
              timeSpentMs: true
            }
          });

          if (timeSpentRecords.length === 0) {
            return {
              problemId: problem.id,
              status: 'no_data'
            };
          }

          // Calculate average time
          const totalTime = timeSpentRecords.reduce(
            (sum: number, record: { timeSpentMs: number }) => sum + record.timeSpentMs,
            0
          );
          const averageTimeMs = totalTime / timeSpentRecords.length;

          // Update or create average time record
          await prisma.problemAverageTime.upsert({
            where: {
              problemId: problem.id
            },
            update: {
              averageTimeMs,
              lastUpdated: new Date(),
              sampleSize: timeSpentRecords.length
            },
            create: {
              problemId: problem.id,
              averageTimeMs,
              sampleSize: timeSpentRecords.length
            }
          });

          return {
            problemId: problem.id,
            status: 'updated',
            averageTimeMs,
            sampleSize: timeSpentRecords.length
          };
        } catch (error) {
          console.error(`Error processing problem ${problem.id}:`, error);
          return {
            problemId: problem.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Error in recalculate-averages:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate averages' },
      { status: 500 }
    );
  }
} 