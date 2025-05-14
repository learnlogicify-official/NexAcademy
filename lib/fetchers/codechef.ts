import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformProfile, ContestEntry, ActivityPoint } from './types';

// Helper: Get CodeChef API OAuth token
async function getCodechefAccessToken(): Promise<string | null> {
  const clientId = process.env.CODECHEF_CLIENT_ID;
  const clientSecret = process.env.CODECHEF_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const response = await axios.post('https://api.codechef.com/oauth/token', {
      grant_type: 'client_credentials',
      scope: 'public',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: ''
    });
    if (response.data && response.data.result && response.data.result.data && response.data.result.data.access_token) {
      return response.data.result.data.access_token;
    }
    return null;
  } catch (e) {
    console.warn('Failed to get CodeChef API access token:', e);
    return null;
  }
}

// Helper: Fetch solved problems from CodeChef API
async function fetchSolvedProblemsFromAPI(username: string, accessToken: string): Promise<{fullySolved: number, partiallySolved: number}> {
  try {
    const response = await axios.get(`https://api.codechef.com/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    const data = response.data && response.data.result && response.data.result.data && response.data.result.data.content;
    if (data && data.problemsSolved) {
      const fullySolved = data.problemsSolved.fullySolved ? (typeof data.problemsSolved.fullySolved === 'object' ? data.problemsSolved.fullySolved.count : parseInt(data.problemsSolved.fullySolved)) : 0;
      const partiallySolved = data.problemsSolved.partiallySolved ? (typeof data.problemsSolved.partiallySolved === 'object' ? data.problemsSolved.partiallySolved.count : parseInt(data.problemsSolved.partiallySolved)) : 0;
      return { fullySolved, partiallySolved };
    }
    return { fullySolved: 0, partiallySolved: 0 };
  } catch (e) {
    console.warn('Failed to fetch solved problems from CodeChef API:', e);
    return { fullySolved: 0, partiallySolved: 0 };
  }
}

export async function fetchCodechefProfile(username: string): Promise<PlatformProfile> {
  try {
    console.log(`Fetching CodeChef profile for ${username}...`);
    
    // Always use scraping for solved problems count
    let fullySolvedCount = 0;
    let partiallySolvedCount = 0;
    // First fetch the main profile page (for everything)
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
    // Robust scraping for solved problems count
    // First try the detailed method for newer CodeChef UI
    const problemsSection = $('.problems-solved');
    if (problemsSection.length > 0) {
      // Fully solved count
      const fullySolvedHeader = problemsSection.find('.content h5:contains("Fully Solved")');
      if (fullySolvedHeader.length > 0) {
        fullySolvedCount = fullySolvedHeader.next().find('a').length || 0;
      } else {
        // Alternative selector for newer UI
        fullySolvedCount = problemsSection.find('h5:contains("Fully Solved")').next().find('a').length || 0;
      }
      // Partially solved count
      const partiallySolvedHeader = problemsSection.find('.content h5:contains("Partially Solved")');
      if (partiallySolvedHeader.length > 0) {
        partiallySolvedCount = partiallySolvedHeader.next().find('a').length || 0;
      } else {
        // Alternative selector for newer UI
        partiallySolvedCount = problemsSection.find('h5:contains("Partially Solved")').next().find('a').length || 0;
      }
    }
    // If the above selectors didn't work, try alternative methods
    if (fullySolvedCount === 0) {
      // Try to find text indicating solved problems
      $('.rating-data-section').each((i, elem) => {
        const sectionText = $(elem).text().trim();
        // Check for "Problems Solved" section
        if (sectionText.includes('Problems Solved')) {
          const solvedMatch = sectionText.match(/Problems Solved\s*\((\d+)\)/i);
          if (solvedMatch) {
            fullySolvedCount = parseInt(solvedMatch[1]);
          }
        }
      });
      // If still no count, look for the practice section indicators
      if (fullySolvedCount === 0) {
        // Try more general selectors
        $('.profile-content').find('section').each((i, section) => {
          const header = $(section).find('h3, h4, h5').text().trim();
          if (header.includes('Problems Solved') || header.includes('Practice')) {
            // Count links which typically represent solved problems
            fullySolvedCount = $(section).find('a[href*="/problems/"]').length;
          }
        });
      }
    }
    // FINAL fallback: search for any text containing 'Problems Solved' anywhere on the page
    if (fullySolvedCount === 0) {
      const allText = $.text();
      const anySolvedMatch = allText.match(/Problems Solved\s*\(?\s*(\d+)\s*\)?/i);
      if (anySolvedMatch) {
        fullySolvedCount = parseInt(anySolvedMatch[1]);
      }
    }
    // Ensure numbers
    fullySolvedCount = isNaN(fullySolvedCount) ? 0 : fullySolvedCount;
    partiallySolvedCount = isNaN(partiallySolvedCount) ? 0 : partiallySolvedCount;
    
    // Get difficulty distribution if available
    const problemsByDifficulty: Record<string, number> = {};
    
    // Try to extract problem difficulty distribution
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
    
    // Extract ALL contest history - no limit to 10
    let contestHistory: ContestEntry[] = [];
    let usedAllRating = false;

    // Try to parse the var all_rating = ...; JS variable for full contest history
    const allRatingMatch = response.data.match(/var all_rating = (.*?);/);
    if (allRatingMatch) {
      try {
        // Replace single quotes with double quotes and None/null with null
        let ratingsJson = allRatingMatch[1]
          .replace(/'/g, '"')
          .replace(/None/g, 'null');
        // Some profiles may have trailing commas, remove them
        ratingsJson = ratingsJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        const ratings = JSON.parse(ratingsJson);
        contestHistory = ratings.map((contest: any) => {
          const oldRating = contest['old_rating'] || 0;
          const newRating = contest['rating'] || 0;
          return {
            name: contest['name'] || '',
            code: contest['code'] || '',
            date: contest['end_date'] ? contest['end_date'].split(' ')[0] : '',
            oldRating,
            newRating,
            rating: newRating, // for backward compatibility
            ratingChange: newRating - oldRating,
            rank: contest['rank'] || 0,
            url: `https://www.codechef.com/${contest['code']}`
          };
        });
        usedAllRating = true;
      } catch (e) {
        console.warn('Failed to parse all_rating JS variable:', e);
      }
    }

    // Fallback: If all_rating not found or failed, use ratings page/table as before
    if (!usedAllRating || contestHistory.length === 0) {
      try {
        console.log(`Fetching CodeChef ratings page for ${username}...`);
        const ratingsPageResponse = await axios.get(`https://www.codechef.com/users/${username}/ratings`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const ratingsPage = cheerio.load(ratingsPageResponse.data);
        ratingsPage('table.dataTable tbody tr').each((i, row) => {
          const columns = ratingsPage(row).find('td');
          if (columns.length >= 5) {
            const contestName = columns.eq(0).text().trim();
            const contestCode = columns.eq(0).find('a').attr('href')?.split('/').pop() || '';
            const dateText = columns.eq(1).text().trim();
            const rankText = columns.eq(2).text().trim();
            const oldRatingText = columns.eq(3).text().trim();
            const newRatingText = columns.eq(4).text().trim();
            // Parse date to standard format
            let date = dateText;
            try {
              if (dateText.includes('/')) {
                const parts = dateText.split('/');
                if (parts.length === 3) {
                  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                  date = `${year}-${parts[1]}-${parts[0]}`;
                }
              } else {
                const dateObj = new Date(dateText);
                if (!isNaN(dateObj.getTime())) {
                  date = dateObj.toISOString().split('T')[0];
                }
              }
            } catch (e) {
              console.warn('Failed to parse CodeChef contest date:', e);
            }
            const rank = parseInt(rankText.replace(/,/g, '')) || 0;
            const oldRating = parseInt(oldRatingText) || 0;
            const newRating = parseInt(newRatingText) || 0;
            if (contestName && date) {
              contestHistory.push({
                name: contestName,
                code: contestCode,
                date,
                oldRating,
                newRating,
                rating: newRating, // for backward compatibility
                ratingChange: newRating - oldRating,
                rank,
                url: contestCode ? `https://www.codechef.com/${contestCode}` : undefined
              });
            }
          }
        });
      } catch (ratingsPageError) {
        console.warn('Failed to fetch CodeChef ratings page, falling back to profile page data:', ratingsPageError);
        
        // Fall back to the contest history from the main profile page
        // First try the contest table on the profile page
        $('.contest-participated-list table tbody tr').each((i, elem) => {
          // Look for at least 4 columns (name, date, rank, rating change, end rating)
          const columns = $(elem).find('td');
          if (columns.length >= 4) {
            const nameElement = columns.eq(0);
            const dateElement = columns.eq(1);
            const rankElement = columns.eq(2);
            const oldRatingElement = columns.eq(3); // Old Rating is usually in column 4
            const ratingElement = columns.eq(4); // End Rating is usually in column 5
            
            const contestName = nameElement.text().trim();
            const contestDate = dateElement.text().trim();
            const contestRankText = rankElement.text().trim();
            const contestRank = parseInt(contestRankText.replace(/,/g, '')) || 0; // Handle commas in large numbers
            const oldRating = parseInt(oldRatingElement.text().trim()) || 0;
            const newRating = parseInt(ratingElement.text().trim()) || 0;
            
            // Parse date to standard format
            let date = contestDate;
            try {
              // Format could be like "22/01/21" - convert to YYYY-MM-DD
              const parts = contestDate.split('/');
              if (parts.length === 3) {
                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                date = `${year}-${parts[1]}-${parts[0]}`;
              }
            } catch (e) {
              console.warn('Failed to parse CodeChef contest date:', e);
            }
            
            if (contestName && date) {
              contestHistory.push({
                name: contestName,
                date,
                rank: contestRank,
                oldRating,
                newRating,
                rating: newRating, // for backward compatibility
                ratingChange: newRating - oldRating
              });
            }
          }
        });
        
        // If we still couldn't find the contest history, try an alternative approach
        if (contestHistory.length === 0) {
          // Try to look for contest cards or other UI elements
          $('.contest-card, .rating-history-item').each((i, elem) => {
            const name = $(elem).find('.contest-name, .event-name').text().trim();
            let date = $(elem).find('.contest-date, .date').text().trim();
            
            // Parse date if needed
            if (date.includes('/')) {
              try {
                const parts = date.split('/');
                if (parts.length === 3) {
                  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                  date = `${year}-${parts[1]}-${parts[0]}`;
                }
              } catch (e) {
                // Keep original date if parsing fails
              }
            }
            
            // Extract rank
            let rank = 0;
            const rankElem = $(elem).find('.rank, .contest-rank');
            if (rankElem.length > 0) {
              const rankText = rankElem.text().trim();
              const rankMatch = rankText.match(/(\d+)/);
              if (rankMatch) {
                rank = parseInt(rankMatch[1].replace(/,/g, ''));
              }
            }
            
            // Extract rating
            let rating = 0;
            const ratingElem = $(elem).find('.rating, .contest-rating');
            if (ratingElem.length > 0) {
              const ratingText = ratingElem.text().trim();
              const ratingMatch = ratingText.match(/(\d+)/);
              if (ratingMatch) {
                rating = parseInt(ratingMatch[1]);
              }
            }
            
            if (name && date) {
              contestHistory.push({
                name,
                date,
                rank,
                oldRating: rating,
                newRating: rating,
                rating: rating,
                ratingChange: 0
              });
            }
          });
        }
      }
    }
    
    // Sort contest history by date (newest first)
    contestHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Extract activity data for heatmap (full 365 days)
    const activityHeatmap: ActivityPoint[] = [];
    
    // Try to fetch the submissions page which has detailed activity data
    try {
      console.log(`Fetching CodeChef submissions page for ${username}...`);
      const submissionsPageResponse = await axios.get(`https://www.codechef.com/users/${username}/teams/list`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const submissionsPage = cheerio.load(submissionsPageResponse.data);
      
      // Create a map to store activity by date
      const activityMap = new Map<string, number>();
      
      // Process submissions table
      submissionsPage('table.dataTable tbody tr').each((i, row) => {
        const columns = submissionsPage(row).find('td');
        if (columns.length >= 3) {
          // The date column is typically the last one
          const dateText = columns.last().text().trim();
          
          // Try to parse the date
          try {
            let dateStr: string | null = null;
            
            // Handle various date formats
            if (dateText.includes('/')) {
              // Format like DD/MM/YY or DD/MM/YYYY
              const parts = dateText.split('/');
              if (parts.length === 3) {
                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                dateStr = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else if (dateText.match(/\d{2}-\d{2}-\d{4}/)) {
              // Format like DD-MM-YYYY
              const parts = dateText.split('-');
              dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else {
              // Try standard date parsing
              const dateObj = new Date(dateText);
              if (!isNaN(dateObj.getTime())) {
                dateStr = dateObj.toISOString().split('T')[0];
              }
            }
            
            if (dateStr) {
              activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
            }
          } catch (e) {
            // Skip this entry if date parsing fails
          }
        }
      });
      
      // Generate the heatmap data
      activityMap.forEach((count, date) => {
        activityHeatmap.push({ date, count });
      });
    } catch (submissionsPageError) {
      console.warn('Failed to fetch CodeChef submissions page, falling back to profile page data:', submissionsPageError);
      
      // Fall back to extracting activity from the main profile page
      const submissionDates = new Map<string, number>();
      
      // Try to extract activity from problems solved section
      $('.problems-solved a').each((i, elem) => {
        // Get the submission date from the tooltip or title attribute if available
        const tooltip = $(elem).attr('data-content') || $(elem).attr('title') || '';
        const dateMatch = tooltip.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        
        if (dateMatch) {
          // Convert to YYYY-MM-DD format
          const date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          // Increment the count for this date
          submissionDates.set(date, (submissionDates.get(date) || 0) + 1);
        }
      });
      
      // Also check for recent activity sections
      $('.recent-activity li, .activity-item').each((i, elem) => {
        const dateText = $(elem).find('.date-label, .activity-date').text().trim();
        const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        
        if (dateMatch) {
          // Convert to YYYY-MM-DD format
          const date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          // Increment the count for this date
          submissionDates.set(date, (submissionDates.get(date) || 0) + 1);
        }
      });
      
      // If we found submission dates, create a heatmap entry for each
      submissionDates.forEach((count, date) => {
        activityHeatmap.push({ date, count });
      });
    }
    
    // Sort heatmap data by date
    activityHeatmap.sort((a, b) => a.date.localeCompare(b.date));
    
    // Ensure we have a full 365 days in the heatmap
    const fullHeatmap = fillMissingDates(activityHeatmap);
    
    // Extract total problems solved from the <h3>Total Problems Solved: NNN</h3> element
    let totalSolved = 0;
    const totalSolvedText = $('h3').filter((i, el) => $(el).text().includes('Total Problems Solved')).text();
    const totalSolvedMatch = totalSolvedText.match(/Total Problems Solved:\s*(\d+)/i);
    if (totalSolvedMatch) {
      totalSolved = parseInt(totalSolvedMatch[1]);
    } else {
      // fallback to sum if not found
      totalSolved = fullySolvedCount + partiallySolvedCount;
    }

    // Compute streak and total active days from the heatmap
    let streak = 0;
    let maxStreak = 0;
    let totalActiveDays = 0;
    let prevDate: Date | null = null;
    let currentStreak = 0;
    for (const point of fullHeatmap) {
      if (point.count > 0) {
        totalActiveDays++;
        if (prevDate) {
          const diff = (new Date(point.date).getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
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
        prevDate = new Date(point.date);
      } else {
        currentStreak = 0;
        prevDate = new Date(point.date);
      }
    }

    // Fetch additional data from the unofficial CodeChef API
    let badgeNames: string[] = [];
    let profileImage: string | undefined = undefined;
    let highestRating: number | undefined = undefined;
    let country: string | undefined = undefined;
    let countryFlag: string | undefined = undefined;
    let globalRank: number | undefined = undefined;
    let countryRank: number | undefined = undefined;
    let starsString: string | undefined = undefined;
    let apiHeatMap: any = undefined;
    let apiRatingData: any = undefined;
    try {
      const apiUrl = `https://codechef-api.vercel.app/handle/${username}`;
      const apiResponse = await axios.get(apiUrl);
      if (apiResponse.data && apiResponse.data.success) {
        if (Array.isArray(apiResponse.data.badges)) {
          badgeNames = apiResponse.data.badges.map((b: any) => b.name || b);
        }
        profileImage = apiResponse.data.profile || undefined;
        highestRating = apiResponse.data.highestRating || undefined;
        country = apiResponse.data.countryName || undefined;
        countryFlag = apiResponse.data.countryFlag || undefined;
        globalRank = apiResponse.data.globalRank || undefined;
        countryRank = apiResponse.data.countryRank || undefined;
        starsString = apiResponse.data.stars || undefined;
        apiHeatMap = apiResponse.data.heatMap || undefined;
        apiRatingData = apiResponse.data.ratingData || undefined;
      }
    } catch (e) {
      // Ignore errors from this API, fallback to your own data
    }

    // Add recentHeatmap (last 183 days)
    const recentHeatmap = fullHeatmap.slice(-183);
    
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
      badgeNames: badgeNames.length > 0 ? badgeNames : undefined,
      problemsByDifficulty,
      contestHistory,
      activityHeatmap: fullHeatmap,
      recentHeatmap,
      profileImage,
      highestRating,
      country,
      countryFlag,
      globalRank,
      countryRank,
      starsString,
      apiHeatMap,
      apiRatingData,
      stats: {
        streak,
        maxStreak,
        totalActiveDays
      }
    };
  } catch (e: any) {
    console.error('CodeChef fetch error:', e);
    return { platform: 'codechef', username, error: e.message };
  }
}

/**
 * Fills in missing dates in the heatmap to ensure a complete 365-day record
 * @param heatmap The original heatmap data
 * @returns Complete 365-day heatmap
 */
function fillMissingDates(heatmap: ActivityPoint[]): ActivityPoint[] {
  if (heatmap.length === 0) return [];
  
  // Sort the heatmap by date first
  heatmap.sort((a, b) => a.date.localeCompare(b.date));
  
  // Determine the date range to fill
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 364); // 365 days including today
  
  const startDate = new Date(oneYearAgo);
  const endDate = new Date(today);
  
  // Convert dates to YYYY-MM-DD strings for comparison
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Create a map of existing dates
  const dateMap = new Map<string, number>();
  heatmap.forEach(point => {
    dateMap.set(point.date, point.count);
  });
  
  // Generate the full heatmap
  const fullHeatmap: ActivityPoint[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    fullHeatmap.push({
      date: dateStr,
      count: dateMap.get(dateStr) || 0
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return fullHeatmap;
} 