import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformProfile, ContestEntry, ActivityPoint } from './types';

export async function fetchHackerEarthProfile(username: string): Promise<PlatformProfile> {
  try {
    console.log(`Fetching HackerEarth profile for ${username}...`);
    
    // Use more robust HTTP client configuration
    const response = await axios.get(`https://www.hackerearth.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      validateStatus: status => status < 500 // Accept even if 404 or other client errors
    });

    // Check if the page actually loaded or if we got an error
    if (response.status !== 200) {
      console.log(`HackerEarth returned status ${response.status} for user ${username}`);
      return { 
        platform: 'hackerearth', 
        username, 
        error: `Profile not found or server error (status ${response.status})` 
      };
    }

    // Load the HTML content for parsing
    const $ = cheerio.load(response.data);
    
    // Check if the page content indicates profile doesn't exist
    const pageTitle = $('title').text().trim();
    if (pageTitle.includes('Page not found') || pageTitle.includes('Error') || pageTitle.includes('404')) {
      console.log(`HackerEarth profile not found for ${username}`);
      return { platform: 'hackerearth', username, error: 'Profile not found' };
    }
    
    // Debug the page structure if needed
    // console.log(`Page HTML: ${response.data.substring(0, 500)}...`);
    
    // Start with default values
    let profileName = '';
    let solved = 0;
    let rating = 0;
    let rank = 'N/A';
    let contests = 0;
    let badges = 0;
    const problemsByDifficulty: Record<string, number> = {};
    const contestHistory: ContestEntry[] = [];
    
    // First try to get basic profile info
    profileName = $('.profile-name, .name, h1').first().text().trim();
    console.log(`Found profile name: ${profileName || 'not found'}`);
    
    // Try multiple selectors for rating
    const ratingSelectors = [
      '.rating-info', 
      '.rating-number', 
      '.rating-container',
      '[data-rating]'
    ];
    
    for (const selector of ratingSelectors) {
      const el = $(selector);
      if (el.length) {
        // Try direct text
        let ratingText = el.text().trim();
        
        // Try data attribute if available
        if (el.data('rating')) {
          ratingText = String(el.data('rating'));
        }
        
        // Extract any number from the text
        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
          console.log(`Found rating: ${rating}`);
          break;
        }
      }
    }
    
    // Try multiple selectors for problems solved
    const solvedSelectors = [
      '.solved-count', 
      '.problems-solved', 
      '.problem-count',
      '.solved-problems'
    ];
    
    for (const selector of solvedSelectors) {
      const elements = $(selector);
      
      if (elements.length) {
        elements.each((i, elem) => {
          const text = $(elem).text().trim();
          const solvedMatch = text.match(/(\d+)/);
          if (solvedMatch) {
            solved += parseInt(solvedMatch[1]);
          }
        });
        
        if (solved > 0) {
          console.log(`Found problems solved: ${solved}`);
          break;
        }
      }
    }
    
    // If we still couldn't find problems solved, try another approach
    if (solved === 0) {
      // Look for text containing "problems solved" or similar
      $('body').find('*').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.toLowerCase().includes('problem') && text.toLowerCase().includes('solved')) {
          const solvedMatch = text.match(/(\d+)\s+problem/i);
          if (solvedMatch) {
            solved = parseInt(solvedMatch[1]);
            if (solved > 0) {
              console.log(`Found problems solved (alt method): ${solved}`);
              return false; // Break the each loop
            }
          }
        }
      });
    }
    
    // Try to find contest count
    const contestSelectors = [
      '.contests-count',
      '.contest-count',
      '.participated-count'
    ];
    
    for (const selector of contestSelectors) {
      const elements = $(selector);
      if (elements.length) {
        const text = elements.first().text().trim();
        const contestMatch = text.match(/(\d+)/);
        if (contestMatch) {
          contests = parseInt(contestMatch[1]);
          console.log(`Found contests: ${contests}`);
          break;
        }
      }
    }
    
    // If contest count not found, try looking for text containing "contests"
    if (contests === 0) {
      $('body').find('*').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.toLowerCase().includes('contest') && text.toLowerCase().includes('participated')) {
          const contestMatch = text.match(/(\d+)\s+contest/i);
          if (contestMatch) {
            contests = parseInt(contestMatch[1]);
            if (contests > 0) {
              console.log(`Found contests (alt method): ${contests}`);
              return false; // Break the each loop
            }
          }
        }
      });
    }
    
    // Try to get badges/achievements
    const badgeSelectors = [
      '.badge-count',
      '.achievement-count',
      '.achievement-badge',
      '.badge'
    ];
    
    for (const selector of badgeSelectors) {
      const elements = $(selector);
      if (elements.length) {
        // Either count the elements or parse the text
        const firstBadge = elements.first();
        const badgeText = firstBadge.text().trim();
        const badgeMatch = badgeText.match(/(\d+)/);
        
        if (badgeMatch) {
          badges = parseInt(badgeMatch[1]);
        } else {
          badges = elements.length;
        }
        
        if (badges > 0) {
          console.log(`Found badges: ${badges}`);
          break;
        }
      }
    }
    
    // Try to extract problem categories/difficulty distribution
    const categorySelectors = [
      '.track-stats',
      '.category-stats',
      '.difficulty-stats'
    ];
    
    for (const selector of categorySelectors) {
      const container = $(selector);
      if (container.length) {
        console.log(`Found category container: ${selector}`);
        
        // Look for category rows/items inside the container
        container.find('li, .row, .item').each((i, elem) => {
          // Try to find category name and count
          const categoryName = $(elem).find('.name, .category, .label').text().trim();
          const countText = $(elem).find('.count, .value, .number').text().trim();
          
          if (categoryName && countText) {
            const countMatch = countText.match(/(\d+)/);
            if (countMatch) {
              const count = parseInt(countMatch[1]);
        if (count > 0) {
                problemsByDifficulty[categoryName] = count;
                console.log(`Found category: ${categoryName} = ${count}`);
              }
            }
          }
        });
        
        if (Object.keys(problemsByDifficulty).length > 0) {
          break;
        }
      }
    }
    
    // Extract contest history - HackerEarth profile page sometimes lists recent contests
    $('.contests-list li, .recent-contests li, .contest-card').each((i, elem) => {
      if (i < 10) { // Limit to 10 contests
        const contestName = $(elem).find('.contest-name, .title, h4').text().trim();
        
        // Try to extract date - in different formats
        let contestDate = $(elem).find('.contest-date, .date, .timestamp').text().trim();
        // Try to standardize the date format
        let date = contestDate;
        try {
          const dateObj = new Date(contestDate);
          if (!isNaN(dateObj.getTime())) {
            date = dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          // Keep original format if parsing fails
        }
        
        // Try to find rank information
        const rankText = $(elem).find('.rank, .position').text().trim();
        let rank = 0;
        const rankMatch = rankText.match(/(\d+)/);
        if (rankMatch) {
          rank = parseInt(rankMatch[1]);
        }
        
        // Try to find rating or score
        const ratingText = $(elem).find('.rating, .score, .points').text().trim();
        let contestRating: number | undefined;
        if (ratingText) {
          const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
          if (ratingMatch) {
            contestRating = parseFloat(ratingMatch[1]);
          }
        }
        
        if (contestName && date) {
          contestHistory.push({
            name: contestName,
            date,
            rank,
            rating: contestRating
          });
        }
      }
    });
    
    // If the above selectors didn't find contests, try another approach
    if (contestHistory.length === 0) {
      // Look for contest tables
      $('.contest-table, .competitions-table').find('tbody tr').each((i, row) => {
        if (i < 10) {
          const cols = $(row).find('td');
          if (cols.length >= 3) {
            const name = $(cols[0]).text().trim();
            let date = $(cols[1]).text().trim();
            
            // Try to parse date
            try {
              const dateObj = new Date(date);
              if (!isNaN(dateObj.getTime())) {
                date = dateObj.toISOString().split('T')[0];
              }
            } catch (e) {
              // Keep original date
            }
            
            // Extract rank
            let rank = 0;
            const rankCol = $(cols[2]);
            const rankText = rankCol.text().trim();
            const rankMatch = rankText.match(/(\d+)/);
            if (rankMatch) {
              rank = parseInt(rankMatch[1]);
            }
            
            // Extract rating if available
            let contestRating: number | undefined;
            if (cols.length > 3) {
              const ratingText = $(cols[3]).text().trim();
              const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
              if (ratingMatch) {
                contestRating = parseFloat(ratingMatch[1]);
              }
            }
            
            if (name && date) {
              contestHistory.push({
                name,
                date,
                rank,
                rating: contestRating
              });
            }
          }
        }
      });
    }
    
    // Extract activity data for heatmap
    const activityHeatmap: ActivityPoint[] = [];
    
    // HackerEarth doesn't typically show a heatmap or detailed activity history
    // We'll try to extract activity from any recent submissions or solved problems
    // that have timestamps
    
    const activityMap = new Map<string, number>();
    
    // Try to extract activity dates from recent submissions
    $('.recent-activity li, .submission-item, .activity-item').each((i, elem) => {
      const dateText = $(elem).find('.date, .timestamp, .time-ago').text().trim();
      
      // Try to parse the date
      let date: Date | null = null;
      
      // Try direct date parsing
      try {
        date = new Date(dateText);
        if (isNaN(date.getTime())) {
          date = null;
        }
      } catch (e) {
        // Not a standard date format
      }
      
      // Try to handle relative dates like "2 days ago"
      if (!date) {
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
      }
      
      if (date && !isNaN(date.getTime())) {
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
      }
    });
    
    // Convert activity map to array
    activityHeatmap.push(...Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-90) // Last 90 days
    );
    
    // If no activity data was found, try to generate some from solved problems
    if (activityHeatmap.length === 0) {
      // Find any elements with timestamps or date information
      $('[data-timestamp], [title*="date"], [title*="Date"], [title*="solved"], [title*="Solved"]').each((i, elem) => {
        let timestamp = $(elem).data('timestamp');
        if (timestamp) {
          // Convert timestamp to date
          let date: Date | null = null;
          if (typeof timestamp === 'number') {
            date = new Date(timestamp * 1000); // Assuming Unix timestamp (seconds)
          } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
          }
          
          if (date && !isNaN(date.getTime())) {
            const dateStr = date.toISOString().split('T')[0];
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
          }
        } else {
          // Check title attribute for date information
          const title = $(elem).attr('title') || '';
          const dateMatch = title.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
          
          if (dateMatch) {
            let year = dateMatch[3];
            if (year.length === 2) {
              year = `20${year}`;
            }
            const month = dateMatch[2].padStart(2, '0');
            const day = dateMatch[1].padStart(2, '0');
            
            const date = `${year}-${month}-${day}`;
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
          }
        }
      });
      
      // Add to the heatmap
      activityHeatmap.push(...Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-90) // Last 90 days
      );
    }
    
    // Construct the platform profile with all the data we were able to find
    console.log(`HackerEarth profile fetch completed for ${username}`);
    return {
      platform: 'hackerearth',
      username,
      totalSolved: solved,
      rating,
      rank: rank || 'N/A',
      contests,
      badges,
      problemsByDifficulty: Object.keys(problemsByDifficulty).length > 0 ? problemsByDifficulty : undefined,
      contestHistory: contestHistory.length > 0 ? contestHistory : undefined,
      activityHeatmap: activityHeatmap.length > 0 ? activityHeatmap : undefined
    };
  } catch (e: any) {
    console.error(`HackerEarth fetch error for ${username}:`, e.message);
    // Return a more helpful error message with the actual error
    return { 
      platform: 'hackerearth', 
      username, 
      error: `Failed to fetch profile: ${e.message}`
    };
  }
} 