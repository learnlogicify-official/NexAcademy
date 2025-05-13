import { EnhancedProfile } from "@/components/enhanced-profile"
import { DashboardLayout } from "@/components/dashboard-layout"
import { prisma } from "@/lib/prisma"
import { format, subDays } from "date-fns"

interface ProfilePageProps {
  params: { username: string }
}

// Format data for the heatmap
function formatSubmissionsForHeatmap(submissions: any[]) {
  // Create a map to track activities by date
  const activityMap = new Map();
  
  // Ensure submissions are sorted by date
  const sortedSubmissions = [...submissions].sort((a, b) => 
    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  
  // Process each submission
  sortedSubmissions.forEach(submission => {
    const date = format(new Date(submission.submittedAt), "yyyy-MM-dd");
    
    // Initialize the date entry if it doesn't exist
    if (!activityMap.has(date)) {
      activityMap.set(date, {
        date,
        count: 0,
        details: [],
        verdictCounts: {}
      });
    }
    
    const entry = activityMap.get(date);
    
    // Increment the count
    entry.count += 1;
    
    // Track verdict counts
    const status = submission.status || 'PENDING';
    if (!entry.verdictCounts[status]) {
      entry.verdictCounts[status] = 0;
    }
    entry.verdictCounts[status]++;
    
    // Add details for this submission
    entry.details.push({
      type: "problem",
      title: `Problem Submission: ${formatStatus(submission.status || "Submitted")}`,
      xp: submission.allPassed ? 10 : 0, // Assign XP based on whether all tests passed
      timestamp: submission.submittedAt,
      status: submission.status,
      color: getColorForStatus(submission.status)
    });
  });
  
  // Convert map to array and add verdict summary
  return Array.from(activityMap.values()).map(day => ({
    ...day,
    verdictSummary: Object.entries(day.verdictCounts).map(([status, count]) => ({
      status,
      readableStatus: formatStatus(status),
      count,
      color: getColorForStatus(status)
    }))
  }));
}

// Helper function to format status for display
function formatStatus(status: string): string {
  if (!status) return 'Unknown';
  
  // Replace underscores with spaces and capitalize each word
  return status.split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to get color for status
function getColorForStatus(status: string | null): string {
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
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Get the user's data
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      profilePic: true,
    },
  });
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p>The requested profile does not exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get the user's streak data - check if table exists first
  let userStreak = null;
  try {
    // Use raw query to check if the UserStreak table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserStreak'
      ) as "exists"
    `;
    
    // Only query if the table exists
    if ((tableExists as any)[0]?.exists) {
      userStreak = await prisma.$queryRaw`
        SELECT * FROM "UserStreak" 
        WHERE "userId" = ${user.id}
      `;
      
      // Convert to a single object if array is returned
      if (Array.isArray(userStreak) && userStreak.length > 0) {
        userStreak = userStreak[0];
      }
    }
  } catch (error) {
    console.error('Error fetching streak data:', error);
    userStreak = null;
  }
  
  // Get last year of submissions
  const oneYearAgo = subDays(new Date(), 365);
  const submissions = await prisma.problemSubmission.findMany({
    where: {
      userId: user.id,
      submittedAt: {
        gte: oneYearAgo
      }
    },
    orderBy: {
      submittedAt: 'desc'
    },
  });
  
  // Get problem submission statistics grouped by status
  let submissionStats: any[] = [];
  try {
    submissionStats = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "ProblemSubmission"
      WHERE "userId" = ${user.id} AND status IS NOT NULL
      GROUP BY status
    ` as any[];
    
    // Format the submission stats with colors and readable names
    submissionStats = submissionStats.map((stat: any) => ({
      status: stat.status,
      count: parseInt(stat.count),
      readableStatus: formatStatus(stat.status),
      color: getColorForStatus(stat.status)
    }));
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    submissionStats = [];
  }
  
  // Get problem counts by difficulty level
  let problemsByDifficulty: any = {
    totalSolved: 0,
    totalProblems: 0,
    categories: []
  };
  
  try {
    // Query to count distinct solved problems and their difficulty levels
    const difficultyStatsQuery = await prisma.$queryRaw`
      WITH solved_problems AS (
        SELECT DISTINCT ps."problemId"
        FROM "ProblemSubmission" ps
        WHERE ps."userId" = ${user.id} 
        AND ps.status = 'ACCEPTED'
      )
      SELECT 
        cq.difficulty, 
        COUNT(DISTINCT q.id) as count
      FROM 
        solved_problems sp
      JOIN 
        "Question" q ON sp."problemId" = q.id
      JOIN 
        "CodingQuestion" cq ON q.id = cq."questionId"
      GROUP BY 
        cq.difficulty
    ` as any[];
    
    // Define colors and ensure all difficulty levels are represented
    const difficultyMap = {
      EASY: {
        name: "Easy",
        count: 0,
        color: "#4ade80", // green
        textColor: "text-emerald-500"
      },
      MEDIUM: {
        name: "Medium",
        count: 0,
        color: "#fbbf24", // amber
        textColor: "text-amber-500"
      },
      HARD: {
        name: "Hard",
        count: 0,
        color: "#f87171", // red
        textColor: "text-red-500"
      }
    };
    
    // Get the total number of solved problems
    const totalSolvedQuery = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "problemId") as count
      FROM "ProblemSubmission"
      WHERE "userId" = ${user.id} 
      AND status = 'ACCEPTED'
    ` as any[];
    
    const totalSolved = parseInt(totalSolvedQuery[0]?.count || '0');
    
    // Update counts from query results
    difficultyStatsQuery.forEach((item: any) => {
      const difficulty = item.difficulty as keyof typeof difficultyMap;
      if (difficultyMap[difficulty]) {
        difficultyMap[difficulty].count = parseInt(item.count);
      }
    });
    
    // Calculate percentages
    const categories = Object.values(difficultyMap).map(category => {
      return {
        ...category,
        percentage: Math.round((category.count / Math.max(1, totalSolved)) * 100)
      };
    });
    
    // Get total problems in the system
    const totalProblems = await prisma.question.count({
      where: {
        type: 'CODING',
        status: 'READY'
      }
    });
    
    problemsByDifficulty = {
      totalSolved,
      totalProblems,
      categories
    };
  } catch (error) {
    console.error('Error fetching problems by difficulty:', error);
    // Provide default values if there's an error
    problemsByDifficulty = {
      totalSolved: 0,
      totalProblems: 0,
      categories: [
        {
          name: "Easy",
          count: 0,
          color: "#4ade80",
          textColor: "text-emerald-500",
          percentage: 0
        },
        {
          name: "Medium",
          count: 0,
          color: "#fbbf24",
          textColor: "text-amber-500",
          percentage: 0
        },
        {
          name: "Hard",
          count: 0,
          color: "#f87171",
          textColor: "text-red-500",
          percentage: 0
        }
      ]
    };
  }
  
  // Format data for the heatmap
  const heatmapData = formatSubmissionsForHeatmap(submissions);
  
  return (
    <DashboardLayout>
      <EnhancedProfile 
        user={user} 
        userStreak={userStreak} 
        heatmapData={heatmapData}
        submissionStats={submissionStats}
        problemsByDifficulty={problemsByDifficulty}
      />
    </DashboardLayout>
  )
}

