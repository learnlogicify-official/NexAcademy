import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformProfile, ContestEntry, ActivityPoint } from './types';

export async function fetchHackerRankProfile(username: string): Promise<PlatformProfile> {
  try {
    // HackerRank doesn't have an open API, so we need to scrape the profile page
    const response = await axios.get(`https://www.hackerrank.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract profile data from script tags (HackerRank stores profile data in a JS object)
    let profileData: any = {};
    let solved = 0;
    let badges = 0;
    let rank = 'N/A';
    let score = 0;
    let contestHistory: ContestEntry[] = [];
    let activityHeatmap: ActivityPoint[] = [];
    
    // Try to find the data in the page script
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html() || '';
      if (scriptContent.includes('hackerProfile')) {
        try {
          const dataMatch = scriptContent.match(/window\.HACKERRANK\.bootstrapped\.hackerProfile\s*=\s*({[\s\S]+?});/);
          if (dataMatch && dataMatch[1]) {
            profileData = JSON.parse(dataMatch[1]);
            
            // Extract solved problem count
            if (profileData.solved_challenges) {
              solved = profileData.solved_challenges.length;
            }
            
            // Extract badges
            if (profileData.badges) {
              badges = profileData.badges.length;
            }
            
            // Extract rank or level
            if (profileData.level) {
              rank = profileData.level;
            }
            
            // Extract score
            if (profileData.totalPoints) {
              score = profileData.totalPoints;
            }
            
            // Extract contest history if available
            if (profileData.contest_participations) {
              contestHistory = profileData.contest_participations
                .slice(0, 10) // Get only the 10 most recent contests
                .map((contest: any) => {
                  const contestDate = new Date(contest.created_at || contest.timestamp || Date.now());
                  return {
                    name: contest.name || contest.contest_name || 'HackerRank Contest',
                    date: contestDate.toISOString().split('T')[0],
                    rank: contest.rank || 0,
                    // HackerRank may not have rating information
                    rating: contest.score || contest.rating || 0
                  };
                });
            }
            
            // Extract activity data for heatmap
            // HackerRank doesn't provide direct activity data in the profile, so we need to derive it
            // from the submissions or other activity data available
            const activityMap = new Map<string, number>();
            
            // Try to get activity from submissions
            if (profileData.recent_submissions) {
              profileData.recent_submissions.forEach((submission: any) => {
                const date = new Date(submission.created_at || submission.timestamp || Date.now());
                const dateStr = date.toISOString().split('T')[0];
                activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
              });
            }
            
            // Also try to get activity from solved challenges
            if (profileData.solved_challenges) {
              profileData.solved_challenges.forEach((challenge: any) => {
                if (challenge.solved_at || challenge.timestamp) {
                  const date = new Date(challenge.solved_at || challenge.timestamp);
                  const dateStr = date.toISOString().split('T')[0];
                  activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
                }
              });
            }
            
            // Convert activity map to array format for heatmap
            activityHeatmap = Array.from(activityMap.entries())
              .map(([date, count]) => ({ date, count }))
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(-90); // Last 90 days
          }
        } catch (e) {
          console.error('Error parsing HackerRank profile data:', e);
        }
      }
    });
    
    // Extract additional contest data from the UI if not found in the script
    if (contestHistory.length === 0) {
      const contestRows = $('.contests-participated .table tbody tr');
      if (contestRows.length > 0) {
        contestRows.each((i, row) => {
          if (i < 10) { // Limit to 10 contests
            const nameElem = $(row).find('td:nth-child(1)');
            const dateElem = $(row).find('td:nth-child(2)');
            const rankElem = $(row).find('td:nth-child(3)');
            
            const name = nameElem.text().trim();
            let date = dateElem.text().trim();
            const rankText = rankElem.text().trim();
            
            // Try to parse date
            try {
              const dateObj = new Date(date);
              if (!isNaN(dateObj.getTime())) {
                date = dateObj.toISOString().split('T')[0];
              }
            } catch (e) {
              // Keep original date format if parsing fails
            }
            
            // Parse rank
            const rank = parseInt(rankText.replace(/[^0-9]/g, '')) || 0;
            
            contestHistory.push({
              name,
              date,
              rank
            });
          }
        });
      }
    }
    
    // If we don't have activity data from the script, try to extract it from the UI
    if (activityHeatmap.length === 0) {
      const activityMap = new Map<string, number>();
      
      // Look for recent submissions in the UI
      $('.recent-challenge-submission, .recent-submission').each((i, elem) => {
        const dateText = $(elem).find('.time-stamp, .timeago').text().trim();
        
        // Try to parse date from text like "2 days ago", "1 month ago", etc.
        let date: Date | null = null;
        
        if (dateText.includes('minute') || dateText.includes('hour') || 
            dateText.includes('day') || dateText.includes('month') || 
            dateText.includes('year')) {
          
          const now = new Date();
          
          if (dateText.includes('minute')) {
            const minutes = parseInt(dateText) || 0;
            date = new Date(now.getTime() - minutes * 60 * 1000);
          } else if (dateText.includes('hour')) {
            const hours = parseInt(dateText) || 0;
            date = new Date(now.getTime() - hours * 60 * 60 * 1000);
          } else if (dateText.includes('day')) {
            const days = parseInt(dateText) || 0;
            date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          } else if (dateText.includes('month')) {
            const months = parseInt(dateText) || 0;
            date = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
          } else if (dateText.includes('year')) {
            const years = parseInt(dateText) || 0;
            date = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
          }
        } else {
          // Try to parse as a standard date
          try {
            date = new Date(dateText);
          } catch (e) {
            // Ignore invalid dates
          }
        }
        
        if (date && !isNaN(date.getTime())) {
          const dateStr = date.toISOString().split('T')[0];
          activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
        }
      });
      
      // Convert activity map to array
      const additionalActivity = Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-90); // Last 90 days
      
      // Add to existing heatmap data
      activityHeatmap.push(...additionalActivity);
      
      // Remove duplicates by date
      const seen = new Set();
      activityHeatmap = activityHeatmap.filter(item => {
        const duplicate = seen.has(item.date);
        seen.add(item.date);
        return !duplicate;
      });
      
      // Re-sort
      activityHeatmap.sort((a, b) => a.date.localeCompare(b.date));
    }
    
    // Get problem distribution by category/difficulty
    const problemsByDifficulty: Record<string, number> = {};
    $('.badge-list .badge-title').each((i, elem) => {
      const category = $(elem).text().trim();
      if (category) {
        const countElem = $(elem).siblings('.badge-count');
        const count = parseInt(countElem.text().trim()) || 0;
        if (count > 0) {
          problemsByDifficulty[category] = count;
        }
      }
    });
    
    // Alternative way to get problem distribution
    if (Object.keys(problemsByDifficulty).length === 0) {
      $('.hacker-skills .badge-title').each((i, elem) => {
        const category = $(elem).text().trim();
        if (category) {
          const countElem = $(elem).siblings('.badge-count');
          const count = parseInt(countElem.text().trim()) || 0;
          if (count > 0) {
            problemsByDifficulty[category] = count;
          }
        }
      });
    }
    
    return {
      platform: 'hackerrank',
      username,
      totalSolved: solved,
      rank,
      score,
      badges,
      problemsByDifficulty,
      contestHistory: contestHistory.length > 0 ? contestHistory : undefined,
      activityHeatmap: activityHeatmap.length > 0 ? activityHeatmap : undefined
    };
  } catch (e: any) {
    console.error('HackerRank fetch error:', e);
    return { platform: 'hackerrank', username, error: e.message };
  }
} 