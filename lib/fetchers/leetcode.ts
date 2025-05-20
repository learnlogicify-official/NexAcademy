import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformProfile, ActivityPoint } from './types';

export async function fetchLeetCodeProfile(username: string): Promise<PlatformProfile> {
  try {
    console.log(`Attempting to fetch LeetCode profile for ${username} using public API...`);
    // Try the public REST API endpoint first as it's more stable
    const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log(response.data);
    // Check if the response is valid
    if (response.data.status !== 'success' || !response.data) {
      throw new Error('Failed to fetch LeetCode profile data');
    }

    const data = response.data;
    
    // Map the API response to our standardized format
    const problemsByDifficulty = {
      easy: data.easySolved || 0,
      medium: data.mediumSolved || 0,
      hard: data.hardSolved || 0
    };

    // Now let's try to get contest and activity data through the GraphQL API
    let contestHistory = [];
    let activityHeatmap: ActivityPoint[] = [];
    let globalRanking = data.ranking || 'N/A';
    let contestRating = 0;
    let streak = 0;
    let totalActiveDays = 0;
    
    try {
      // First, try to get the detailed user profile with GraphQL
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
      
      if (profileResponse.data?.data?.matchedUser?.profile?.ranking) {
        globalRanking = profileResponse.data.data.matchedUser.profile.ranking;
      }

      // Fetching contest history and ranking using GraphQL
      const contestQuery = {
        query: `
          query userContestRankingInfo($username: String!) {
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
              badge { name }
            }
            userContestRankingHistory(username: $username) {
              attended
              trendDirection
              problemsSolved
              totalProblems
              finishTimeInSeconds
              rating
              ranking
              contest {
                title
                startTime
              }
            }
          }
        `,
        variables: { username }
      };
      
      const contestResponse = await axios.post('https://leetcode.com/graphql/', contestQuery, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://leetcode.com',
          'Referer': `https://leetcode.com/${username}/`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
      });
      
      // Extract contest rating
      if (contestResponse.data?.data?.userContestRanking?.rating) {
        contestRating = contestResponse.data.data.userContestRanking.rating;
      }
      
      // Extract contest history
      if (contestResponse.data?.data?.userContestRankingHistory) {
        contestHistory = contestResponse.data.data.userContestRankingHistory
          .filter((contest: any) => contest.attended)  // Only include contests actually attended
          .slice(0, 10) // Only take the 10 most recent contests
          .map((contest: any) => ({
            name: contest.contest.title,
            date: new Date(contest.contest.startTime * 1000).toISOString().split('T')[0],
            rank: contest.ranking,
            rating: contest.rating,
            problemsSolved: contest.problemsSolved,
            totalProblems: contest.totalProblems
          }))
          .reverse(); // Most recent first
      }
      
      // Now get the calendar/heatmap data
      const activityQuery = {
        query: `
          query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
              userCalendar(year: $year) {
                activeYears
                streak
                totalActiveDays
                submissionCalendar
              }
            }
          }
        `,
        variables: { 
          username,
          year: new Date().getFullYear() // Get current year's data
        }
      };
      
      const activityResponse = await axios.post('https://leetcode.com/graphql/', activityQuery, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://leetcode.com',
          'Referer': `https://leetcode.com/${username}/`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
      });
      
      if (activityResponse.data?.data?.matchedUser?.userCalendar) {
        const calendar = JSON.parse(activityResponse.data.data.matchedUser.userCalendar.submissionCalendar || '{}');
        
        // Get current streak and total active days
        streak = activityResponse.data.data.matchedUser.userCalendar.streak || 0;
        totalActiveDays = activityResponse.data.data.matchedUser.userCalendar.totalActiveDays || 0;
        
        // Process calendar data for heatmap - get data for past year
        activityHeatmap = Object.entries(calendar)
          .map(([timestamp, count]: [string, any]) => ({
            date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
            count: parseInt(count)
          } as ActivityPoint))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // If we have active years data, try to get a full year of activity
        const activeYears = activityResponse.data.data.matchedUser.userCalendar.activeYears || [];
        
        // If there are previous active years, fetch that data too for a complete picture
        if (activeYears.length > 1 && activityHeatmap.length < 365) {
          // Get the previous year's data if current year doesn't have full 365 days
          const prevYearQuery = {
            query: `
              query userProfileCalendar($username: String!, $year: Int) {
                matchedUser(username: $username) {
                  userCalendar(year: $year) {
                    submissionCalendar
                  }
                }
              }
            `,
            variables: { 
              username,
              year: new Date().getFullYear() - 1 // Previous year
            }
          };
          
          try {
            const prevYearResponse = await axios.post('https://leetcode.com/graphql/', prevYearQuery, {
              headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://leetcode.com',
                'Referer': `https://leetcode.com/${username}/`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
              }
            });
            
            if (prevYearResponse.data?.data?.matchedUser?.userCalendar?.submissionCalendar) {
              const prevYearCalendar = JSON.parse(prevYearResponse.data.data.matchedUser.userCalendar.submissionCalendar || '{}');
              
              // Process previous year's calendar data
              const prevYearActivity: ActivityPoint[] = Object.entries(prevYearCalendar)
                .map(([timestamp, count]: [string, any]) => ({
                  date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
                  count: parseInt(count)
                } as ActivityPoint))
                .sort((a, b) => a.date.localeCompare(b.date));
              
              // Merge with current activity data
              activityHeatmap = [...prevYearActivity, ...activityHeatmap];
            }
          } catch (prevYearError) {
            console.warn('Failed to fetch previous year calendar data:', prevYearError);
          }
        }
        
        // Ensure we only have the most recent 365 days
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
        
        activityHeatmap = activityHeatmap
          .filter(item => item.date >= oneYearAgoStr)
          .slice(-365); // Just to be safe, limit to 365 days
      }
      
      // Return the profile with all collected data
        return {
          platform: 'leetcode',
          username,
          totalSolved: data.totalSolved || 0,
        rank: globalRanking,
        rating: contestRating || data.contributionPoints || 0,
        badges: 0, // LeetCode doesn't have a badges system like other platforms
          score: data.contributionPoints || 0,
          problemsByDifficulty,
          contestHistory,
          activityHeatmap,
          stats: {
            streak,
          totalActiveDays,
          maxStreak: streak, // LeetCode API doesn't provide max streak, use current streak
          contributionPoints: data.contributionPoints
          }
        };
    } catch (graphqlError) {
      console.warn('Failed to fetch LeetCode data via GraphQL:', graphqlError);
      
      // Fall back to the basic data we already have
    return {
      platform: 'leetcode',
      username,
      totalSolved: data.totalSolved || 0,
        rank: globalRanking,
        rating: contestRating || data.contributionPoints || 0,
        badges: 0,
      score: data.contributionPoints || 0,
      problemsByDifficulty,
        contestHistory: [],
        activityHeatmap: [],
        stats: {
          streak: 0,
          totalActiveDays: 0
        }
    };
    }
  } catch (error: any) {
    // If first approach fails, try a direct web scraping approach
    try {
      console.log(`Public API LeetCode attempt failed for ${username}, trying web scraping directly...`);
      
      // Use a more user-like request to fetch the HTML page
      const profileResponse = await axios.get(`https://leetcode.com/${username}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'max-age=0',
          'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(profileResponse.data);
      
      // Try to extract data using various selectors since LeetCode changes their HTML structure occasionally
      let totalSolved = 0;
      let easy = 0;
      let medium = 0;
      let hard = 0;
      let ranking = 'N/A';
      let contestRating = 0;
      let activityHeatmap: ActivityPoint[] = [];
      let streak = 0;
      let totalActiveDays = 0;

      // Extract total problems solved
      const solvedText = $('[data-cy="solved-count"]').text().trim();
      const solvedMatch = solvedText.match(/(\d+)/);
      if (solvedMatch) {
        totalSolved = parseInt(solvedMatch[1]);
            }
      
      // Extract problem counts by difficulty
      $('[data-cy="difficulty-count"]').each((i, elem) => {
        const text = $(elem).text().trim();
        const countMatch = text.match(/(\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 0;
        
        if (text.toLowerCase().includes('easy')) {
          easy = count;
        } else if (text.toLowerCase().includes('medium')) {
          medium = count;
        } else if (text.toLowerCase().includes('hard')) {
          hard = count;
        }
      });
      
      // Try to extract ranking
      const rankingText = $('[data-cy="ranking"]').text().trim();
      const rankingMatch = rankingText.match(/(\d+)/);
      if (rankingMatch) {
        ranking = rankingMatch[1];
            }
      
      // Try to extract contest rating
      const ratingText = $('[data-cy="contest-rating"]').text().trim();
      const ratingMatch = ratingText.match(/(\d+)/);
      if (ratingMatch) {
        contestRating = parseInt(ratingMatch[1]);
      }
      
      // Try to extract calendar/heatmap data and streak info
      try {
        // Look for calendar data in script tags
        $('script').each((i, el) => {
          const scriptContent = $(el).html() || '';
          
          // Extract calendar/heatmap data
          if (scriptContent.includes('submissionCalendar')) {
            const calendarMatch = scriptContent.match(/submissionCalendar":\s*({[^}]+})/);
            if (calendarMatch && calendarMatch[1]) {
              try {
                const calendarData = JSON.parse(calendarMatch[1].replace(/'/g, '"'));
                
                // Convert to our format
                activityHeatmap = Object.entries(calendarData)
                  .map(([timestamp, count]: [string, any]) => ({
                    date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
                    count: parseInt(count)
                  } as ActivityPoint))
                  .sort((a, b) => a.date.localeCompare(b.date));
                
                // Get the most recent year of data
                const oneYearAgo = new Date();
                oneYearAgo.setDate(oneYearAgo.getDate() - 365);
                const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
                
                activityHeatmap = activityHeatmap
                  .filter(item => item.date >= oneYearAgoStr)
                  .slice(-365);
              } catch (e) {
                console.warn('Failed to parse calendar data:', e);
              }
            }
          }
          
          // Extract streak and active days
          if (scriptContent.includes('streak') || scriptContent.includes('totalActiveDays')) {
            const streakMatch = scriptContent.match(/streak":\s*(\d+)/);
            if (streakMatch) {
              streak = parseInt(streakMatch[1]);
            }
            
            const totalActiveDaysMatch = scriptContent.match(/totalActiveDays":\s*(\d+)/);
            if (totalActiveDaysMatch) {
              totalActiveDays = parseInt(totalActiveDaysMatch[1]);
            }
          }
        });
      } catch (activityError) {
        console.warn('Failed to extract activity data:', activityError);
      }
      
      return {
        platform: 'leetcode',
        username,
        totalSolved,
        rank: ranking,
        rating: contestRating,
        badges: 0,
        score: 0,
        problemsByDifficulty: {
          easy,
          medium,
          hard
        },
        contestHistory: [],
        activityHeatmap,
        stats: {
          streak,
          totalActiveDays,
          maxStreak: streak
        }
      };
    } catch (scrapingError: any) {
      console.error('All LeetCode fetching approaches failed:', scrapingError);
      return { 
        platform: 'leetcode', 
        username, 
        error: 'Could not fetch LeetCode profile after multiple attempts. The platform may be experiencing issues.'
      };
    }
  }
} 