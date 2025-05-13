import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { format, subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get the session to verify permissions
    const session = await getServerSession();
    
    // Verify user can access this data (either it's their own data or they're an admin)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = params.userId;
    
    // Get last year of submissions
    const oneYearAgo = subDays(new Date(), 365);
    const submissions = await prisma.problemSubmission.findMany({
      where: {
        userId: userId,
        submittedAt: {
          gte: oneYearAgo
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      select: {
        id: true,
        submittedAt: true,
        allPassed: true,
        status: true,
        problemId: true,
        testcasesPassed: true,
        totalTestcases: true
      }
    });
    
    // Group submissions by date
    const submissionsByDate = new Map<string, {
      date: string;
      count: number;
      details: {
        type: string;
        title: string;
        xp: number;
        timestamp: string;
        status: string | null;
        color: string;
      }[];
      verdictCounts: {
        [key: string]: number;
      };
    }>();
    
    // Function to get color for status
    const getColorForStatus = (status: string | null) => {
      switch(status) {
        case 'ACCEPTED':
          return '#4ade80'; // green
        case 'WRONG_ANSWER':
          return '#f87171'; // red
        case 'TIME_LIMIT_EXCEEDED':
          return '#fbbf24'; // amber
        case 'COMPILATION_ERROR':
          return '#a78bfa'; // purple
        case 'RUNTIME_ERROR':
          return '#fb7185'; // rose
        case 'MEMORY_LIMIT_EXCEEDED':
          return '#60a5fa'; // blue
        default:
          return '#94a3b8'; // slate
      }
    };
    
    // Function to get readable status
    const getReadableStatus = (status: string | null) => {
      if (!status) return 'Unknown';
      
      // Replace underscores with spaces and capitalize each word
      return status.split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    // Process each submission
    submissions.forEach(submission => {
      const date = format(new Date(submission.submittedAt), "yyyy-MM-dd");
      
      // Initialize the date entry if it doesn't exist
      if (!submissionsByDate.has(date)) {
        submissionsByDate.set(date, {
          date,
          count: 0,
          details: [],
          verdictCounts: {}
        });
      }
      
      const entry = submissionsByDate.get(date)!;
      
      // Increment the count
      entry.count += 1;
      
      // Track verdict counts
      const status = submission.status || 'PENDING';
      if (!entry.verdictCounts[status]) {
        entry.verdictCounts[status] = 0;
      }
      entry.verdictCounts[status]++;
      
      // Add details for this submission with color
      entry.details.push({
        type: "problem",
        title: `Problem Submission: ${getReadableStatus(submission.status)}`,
        xp: submission.allPassed ? 10 : 0,
        timestamp: submission.submittedAt.toISOString(),
        status: submission.status,
        color: getColorForStatus(submission.status)
      });
    });
    
    // Get problem submission statistics grouped by status
    const submissionStats = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "ProblemSubmission"
      WHERE "userId" = ${userId} AND status IS NOT NULL
      GROUP BY status
    ` as any[];
    
    // Process the stats to add colors
    const formattedStats = submissionStats.map((stat: any) => ({
      status: stat.status,
      count: parseInt(stat.count),
      readableStatus: getReadableStatus(stat.status),
      color: getColorForStatus(stat.status)
    }));
    
    // Convert map to array and add verdict summary to each day
    const heatmapData = Array.from(submissionsByDate.values()).map(day => ({
      ...day,
      verdictSummary: Object.entries(day.verdictCounts).map(([status, count]) => ({
        status,
        readableStatus: getReadableStatus(status),
        count,
        color: getColorForStatus(status)
      }))
    }));
    
    // Get the user's streak data
    let streakData = null;
    try {
      const userStreak = await prisma.$queryRaw`
        SELECT * FROM "UserStreak" 
        WHERE "userId" = ${userId}
      ` as any[];
      
      streakData = userStreak && userStreak.length > 0 ? userStreak[0] : null;
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
    
    // Return the formatted heatmap data
    return NextResponse.json({
      heatmapData,
      submissionStats: formattedStats,
      streakData
    });
  } catch (error) {
    console.error('Error in heatmap API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 