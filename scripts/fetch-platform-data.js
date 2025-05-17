#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const username = 'sachinjeevan';

// Utility functions
async function fetchLeetCodeProfile() {
  try {
    console.log(`Fetching LeetCode profile for ${username}...`);
    
    // Try the public REST API endpoint first
    const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to fetch LeetCode profile data');
    }

    const data = response.data;
    
    // Map the API response to our format
    const problemsByDifficulty = {
      easy: data.easySolved || 0,
      medium: data.mediumSolved || 0,
      hard: data.hardSolved || 0
    };

    // Try to get contest and activity data through the GraphQL API
    const userProfileQuery = {
      query: `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              reputation
              ranking
              starRating
            }
            userCalendar {
              activeYears
              streak
              totalActiveDays
              submissionCalendar
            }
          }
        }
      `,
      variables: { username }
    };
    
    const profileResponse = await axios.post('https://leetcode.com/graphql', userProfileQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://leetcode.com',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    let globalRanking = data.ranking || 'N/A';
    if (profileResponse.data?.data?.matchedUser?.profile?.ranking) {
      globalRanking = profileResponse.data.data.matchedUser.profile.ranking;
    }
    
    // Get heatmap data
    let activityHeatmap = [];
    let streak = 0;
    let totalActiveDays = 0;
    
    const calendar = profileResponse.data?.data?.matchedUser?.userCalendar;
    if (calendar?.submissionCalendar) {
      try {
        const submissionCalendar = JSON.parse(calendar.submissionCalendar);
        activityHeatmap = Object.entries(submissionCalendar).map(([timestamp, count]) => {
          return {
            date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
            count: parseInt(count)
          };
        }).sort((a, b) => a.date.localeCompare(b.date));
        
        streak = calendar.streak || 0;
        totalActiveDays = calendar.totalActiveDays || 0;
      } catch (e) {
        console.error('Error parsing LeetCode submission calendar:', e.message);
      }
    }

    // If GraphQL API fails or returns no activity data, try alternate approach
    if (activityHeatmap.length === 0) {
      try {
        console.log('Attempting to fetch LeetCode activity data via alternate method...');
        // Try to fetch the user's recent submissions page
        const submissionsResponse = await axios.get(`https://leetcode.com/${username}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        // Look for the calendar data in the HTML
        const calendarDataMatch = submissionsResponse.data.match(/submissionCalendar.*?(\{.*?\})/s);
        if (calendarDataMatch && calendarDataMatch[1]) {
          try {
            const calendarData = JSON.parse(calendarDataMatch[1].replace(/'/g, '"'));
            activityHeatmap = Object.entries(calendarData).map(([timestamp, count]) => {
              return {
                date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
                count: parseInt(count)
              };
            }).sort((a, b) => a.date.localeCompare(b.date));
          } catch (e) {
            console.error('Error parsing LeetCode calendar data from HTML:', e.message);
          }
        }
      } catch (e) {
        console.error('Error fetching LeetCode activity via alternate method:', e.message);
      }
    }

    return {
      platform: 'leetcode',
      username,
      totalSolved: data.totalSolved || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      acceptanceRate: data.acceptanceRate || 0,
      ranking: globalRanking,
      problemsByDifficulty,
      activityHeatmap,
      stats: {
        streak,
        totalActiveDays
      }
    };
  } catch (error) {
    console.error('LeetCode fetch error:', error.message);
    return { platform: 'leetcode', username, error: error.message };
  }
}

async function fetchCodeforcesProfile() {
  try {
    console.log(`Fetching CodeForces profile for ${username}...`);
    
    // Fetch user info
    const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const user = userInfoResponse.data.result[0];

    // Fetch submissions to calculate solved problems
    const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`);
    const submissions = submissionsResponse.data.result || [];
    
    // Get unique solved problems
    const solvedProblems = new Set();
    submissions.forEach((submission) => {
      if (submission.verdict === 'OK') {
        solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
      }
    });
    
    // Count problems by difficulty
    const problemsByDifficulty = {};
    submissions.forEach((submission) => {
      if (submission.verdict === 'OK' && submission.problem.rating) {
        const difficulty = submission.problem.rating.toString();
        problemsByDifficulty[difficulty] = (problemsByDifficulty[difficulty] || 0) + 1;
      }
    });
    
    // Fetch contest history
    const contestsResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
    const contestsData = contestsResponse.data.result || [];
    const contests = contestsData.length;
    
    // Format the contest history
    const contestHistory = contestsData
      .slice(-10) // Get the 10 most recent contests
      .map((contest) => ({
        name: contest.contestName,
        date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
        rank: contest.rank,
        rating: contest.newRating
      }))
      .reverse();
    
    // Create activity heatmap data
    const activityMap = new Map();
    submissions.forEach((submission) => {
      const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });
    
    const activityHeatmap = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      platform: 'codeforces',
      username,
      totalSolved: solvedProblems.size,
      rating: user.rating || 0,
      rank: user.rank || 'N/A',
      contests,
      problemsByDifficulty,
      score: user.contribution,
      contestHistory,
      activityHeatmap,
      stats: {
        maxRating: user.maxRating,
        contribution: user.contribution,
        friendsCount: user.friendOfCount,
        registrationTimeSeconds: user.registrationTimeSeconds
      }
    };
  } catch (error) {
    console.error('CodeForces fetch error:', error.message);
    return { platform: 'codeforces', username, error: error.message };
  }
}

async function fetchCodechefProfile() {
  try {
    console.log(`Fetching CodeChef profile for ${username}...`);
    
    // Fetch the main profile page
    const response = await axios.get(`https://www.codechef.com/users/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract rating
    const rating = $('.rating-number').text().trim();
    
    // Extract rank
    const rankText = $('.rating-ranks strong').first().text().trim();
    
    // Extract solved problems count
    let fullySolvedCount = 0;
    let partiallySolvedCount = 0;
    
    const problemsSection = $('.problems-solved');
    if (problemsSection.length > 0) {
      // Fully solved count
      const fullySolvedHeader = problemsSection.find('.content h5:contains("Fully Solved")');
      if (fullySolvedHeader.length > 0) {
        fullySolvedCount = fullySolvedHeader.next().find('a').length || 0;
      } else {
        // Alternative selector
        fullySolvedCount = problemsSection.find('h5:contains("Fully Solved")').next().find('a').length || 0;
      }
      
      // Partially solved count
      const partiallySolvedHeader = problemsSection.find('.content h5:contains("Partially Solved")');
      if (partiallySolvedHeader.length > 0) {
        partiallySolvedCount = partiallySolvedHeader.next().find('a').length || 0;
      } else {
        // Alternative selector
        partiallySolvedCount = problemsSection.find('h5:contains("Partially Solved")').next().find('a').length || 0;
      }
    }
    
    // Extract problem difficulty distribution
    const problemsByDifficulty = {};
    $('.rating-data-section').each((i, elem) => {
      const header = $(elem).find('h5').text().trim();
      if (header.includes('Problem Solved By')) {
        $(elem).find('li').each((j, li) => {
          const text = $(li).text().trim();
          const parts = text.split('(');
          if (parts.length === 2) {
            const difficulty = parts[0].trim();
            const countMatch = parts[1].match(/(\d+)/);
            if (countMatch && difficulty) {
              problemsByDifficulty[difficulty.toLowerCase()] = parseInt(countMatch[1]);
            }
          }
        });
      }
    });
    
    // Extract stars/badges
    const stars = $('.rating-star').text().trim().length || 0;
    
    // Contest participation
    const contestCount = $('.contest-participated-count b').text().trim() || '0';
    
    // Extract contest history
    let contestHistory = [];
    const allRatingMatch = response.data.match(/var all_rating = (.*?);/);
    if (allRatingMatch) {
      try {
        const allRating = JSON.parse(allRatingMatch[1]);
        contestHistory = allRating.slice(-10).map(contest => ({
          name: contest.name,
          date: contest.end_date,
          rank: contest.global_rank,
          rating: contest.rating
        }));
      } catch (e) {
        console.error('Failed to parse contest history JSON');
      }
    }
    
    // Extract activity heatmap
    let fullHeatmap = [];
    const heatmapMatch = response.data.match(/var activities = (.*?);/);
    if (heatmapMatch) {
      try {
        const activities = JSON.parse(heatmapMatch[1]);
        fullHeatmap = Object.entries(activities).map(([date, count]) => ({
          date,
          count: parseInt(count)
        })).sort((a, b) => a.date.localeCompare(b.date));
      } catch (e) {
        console.error('Failed to parse heatmap JSON');
      }
    }
    
    // Extract total problems solved
    let totalSolved = 0;
    const totalSolvedText = $('h3').filter((i, el) => $(el).text().includes('Total Problems Solved')).text();
    const totalSolvedMatch = totalSolvedText.match(/Total Problems Solved:\s*(\d+)/i);
    if (totalSolvedMatch) {
      totalSolved = parseInt(totalSolvedMatch[1]);
    } else {
      // Fallback to sum
      totalSolved = fullySolvedCount + partiallySolvedCount;
    }
    
    // Compute streak and total active days
    let streak = 0;
    let maxStreak = 0;
    let totalActiveDays = 0;
    let prevDate = null;
    let currentStreak = 0;
    
    for (const point of fullHeatmap) {
      if (point.count > 0) {
        totalActiveDays++;
        if (prevDate) {
          const diff = (new Date(point.date).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        streak = currentStreak;
        prevDate = point.date;
      } else {
        currentStreak = 0;
        prevDate = point.date;
      }
    }
    
    // Fetch additional data from the unofficial CodeChef API
    let apiHeatMap = null;
    try {
      console.log('Fetching CodeChef data from unofficial API...');
      const apiUrl = `https://codechef-api.vercel.app/handle/${username}`;
      const apiResponse = await axios.get(apiUrl, {
        timeout: 10000
      });
      if (apiResponse.data && apiResponse.data.success) {
        apiHeatMap = apiResponse.data.heatMap || null;
        
        // If the API returned heatmap data but our regular method didn't,
        // convert the API heatmap to our format
        if (apiHeatMap && fullHeatmap.length === 0) {
          try {
            fullHeatmap = Object.entries(apiHeatMap).map(([date, count]) => ({
              date,
              count: parseInt(count)
            })).sort((a, b) => a.date.localeCompare(b.date));
          } catch (e) {
            console.error('Failed to parse API heatmap data:', e.message);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch CodeChef data from unofficial API:', e.message);
    }
    
    return {
      platform: 'codechef',
      username,
      totalSolved,
      fullySolved: fullySolvedCount,
      partiallySolved: partiallySolvedCount,
      rating: parseInt(rating) || 0,
      rank: rankText || 'N/A',
      contests: parseInt(contestCount) || 0,
      badges: stars,
      problemsByDifficulty,
      contestHistory,
      activityHeatmap: fullHeatmap,
      apiHeatMap, // Including the raw apiHeatMap data
      stats: {
        streak,
        maxStreak,
        totalActiveDays
      }
    };
  } catch (error) {
    console.error('CodeChef fetch error:', error.message);
    return { platform: 'codechef', username, error: error.message };
  }
}

// Main function
async function main() {
  console.log(`Fetching platform data for username: ${username}`);
  
  try {
    // Fetch data from all platforms in parallel
    const [leetcodeData, codeforcesData, codechefData] = await Promise.all([
      fetchLeetCodeProfile().catch(err => ({ platform: 'leetcode', username, error: err.message })),
      fetchCodeforcesProfile().catch(err => ({ platform: 'codeforces', username, error: err.message })),
      fetchCodechefProfile().catch(err => ({ platform: 'codechef', username, error: err.message }))
    ]);
    
    // Combine all data
    const platformData = {
      username,
      platforms: [leetcodeData, codeforcesData, codechefData],
      timestamp: new Date().toISOString()
    };
    
    // Output the data
    console.log(JSON.stringify(platformData, null, 2));
    
    // Calculate some statistics
    const totalProblems = 
      (leetcodeData.totalSolved || 0) + 
      (codeforcesData.totalSolved || 0) + 
      (codechefData.totalSolved || 0);
    
    const allActiveDays = new Set();
    
    // Combine activity data from all platforms
    const codechefHeatmapArray = codechefData.apiHeatMap
      ? Object.entries(codechefData.apiHeatMap).map(([date, count]) => ({ date, count: Number(count) }))
      : (codechefData.activityHeatmap || []);
    const allHeatmapData = [
      ...(leetcodeData.activityHeatmap || []),
      ...(codeforcesData.activityHeatmap || []),
      ...codechefHeatmapArray
    ];
    
    // Count unique active days
    allHeatmapData.forEach(item => {
      if (item.count > 0) {
        allActiveDays.add(item.date);
      }
    });
    
    // Calculate total submissions
    const totalSubmissions = allHeatmapData.reduce((sum, item) => sum + item.count, 0);
    
    console.log("\n===== Summary Statistics =====");
    console.log(`Total Problems Solved: ${totalProblems}`);
    console.log(`Total Active Days: ${allActiveDays.size}`);
    console.log(`Total Submissions: ${totalSubmissions}`);
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main().catch(console.error); 