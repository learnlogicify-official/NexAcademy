import axios from 'axios';
import { PlatformProfile, ContestEntry } from './types';

export async function fetchCodeforcesProfile(username: string): Promise<PlatformProfile> {
  try {
    // Fetch user info
    const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const user = userInfoResponse.data.result[0];

    // Fetch submissions to calculate solved problems
    const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`);
    const submissions = submissionsResponse.data.result || [];
    
    // Get unique solved problems
    const solvedProblems = new Set();
    submissions.forEach((submission: any) => {
      if (submission.verdict === 'OK') {
        solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
      }
    });
    
    // Count problems by difficulty
    const problemsByDifficulty: Record<string, number> = {};
    submissions.forEach((submission: any) => {
      if (submission.verdict === 'OK' && submission.problem.rating) {
        const difficulty = submission.problem.rating.toString();
        problemsByDifficulty[difficulty] = (problemsByDifficulty[difficulty] || 0) + 1;
      }
    });
    
    // Fetch contest history
    const contestsResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
    const contestsData = contestsResponse.data.result || [];
    const contests = contestsData.length;
    
    // Format the contest history into our standard format
    const contestHistory: ContestEntry[] = contestsData
      .slice(-10) // Get the 10 most recent contests
      .map((contest: any) => ({
        name: contest.contestName,
        date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
        rank: contest.rank,
        rating: contest.newRating,
        // Codeforces API doesn't provide problems solved in contests directly
      }))
      .reverse(); // Most recent first
    
    // Fetch recent activity (submissions)
    const recentActivity = submissions
      .slice(0, 20) // Get 20 most recent submissions
      .map((submission: any) => ({
        date: new Date(submission.creationTimeSeconds * 1000).toISOString(),
        problemName: submission.problem.name,
        problemIndex: submission.problem.index,
        contestId: submission.problem.contestId,
        verdict: submission.verdict,
        language: submission.programmingLanguage
      }));
    
    // Create activity heatmap data
    const activityMap = new Map<string, number>();
    submissions.forEach((submission: any) => {
      const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });
    
    const activityHeatmap = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-90); // Last 90 days

    return {
      platform: 'codeforces',
      username,
      totalSolved: solvedProblems.size,
      rating: user.rating,
      rank: user.rank,
      contests,
      problemsByDifficulty,
      score: user.contribution,
      contestHistory,
      recentActivity,
      activityHeatmap,
      stats: {
        maxRating: user.maxRating,
        contribution: user.contribution,
        friendsCount: user.friendOfCount,
        registrationTimeSeconds: user.registrationTimeSeconds
      }
    };
  } catch (e: any) {
    console.error('Codeforces fetch error:', e);
    return { platform: 'codeforces', username, error: e.message };
  }
} 