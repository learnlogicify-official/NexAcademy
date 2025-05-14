#!/usr/bin/env node

/**
 * Standalone script to fetch Coding Ninjas profiles using Puppeteer
 * This avoids Next.js static analysis issues by running as a separate process
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

async function fetchCodingNinjasProfile(profileId, debugDump = false) {
  const url = `https://www.naukri.com/code360/profile/${profileId}`;
  let browser;
  
  try {
    // Launch with additional evasion settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-notifications'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // Set viewport to look like a real desktop
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });
    
    // Disable webdriver flag to avoid detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    // Add realistic behavior - random wait times
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    // Random wait to simulate human behavior
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000 + Math.random() * 2000);
      });
    });

    // Wait for a selector you know will be present on a loaded profile
    try {
      await page.waitForSelector('h1, .profile-main', { timeout: 15000 });
    } catch (err) {
      console.log('Timeout waiting for selector, proceeding with dump anyway');
    }

    // Dump the full HTML for selector discovery if debugDump is true
    if (debugDump) {
      const html = await page.content();
      fs.writeFileSync('codingninjas_profile_dump.html', html, 'utf-8');
      
      // Take a screenshot as well
      await page.screenshot({ path: 'codingninjas_profile_screenshot.png' });
      
      return { 
        platform: 'codingninjas', 
        username: profileId, 
        error: 'HTML dump and screenshot created for selector discovery.'
      };
    }

    // Existing minimal extraction (to be expanded after selector discovery)
    const data = await page.evaluate(() => {
      // Extract name from profile
      const name = document.querySelector('h1')?.textContent?.trim() || '';
      
      // For problem count, try multiple potential selectors
      let totalSolved = 0;
      
      // Method 1: Look for specific elements with problem solved text
      const totalProblemElements = [
        ...document.querySelectorAll('.total-problem-solved-container'),
        ...document.querySelectorAll('.profile-user-stats-graph-container'),
        ...document.querySelectorAll('.problems-solved'),
        ...document.querySelectorAll('[class*="problem-solved"]'),
        ...document.querySelectorAll('[class*="total-problem"]')
      ];
      
      // Try to find the total problems count
      for (const element of totalProblemElements) {
        const text = element.textContent || '';
        const match = text.match(/(\d+)\s*(?:problem|problems)/i);
        if (match) {
          totalSolved = parseInt(match[1]);
          break;
        }
      }
      
      // Method 2: Look for potential problem difficulty sections which often have the counts
      if (totalSolved === 0) {
        let easyCount = 0, mediumCount = 0, hardCount = 0, ninjaCount = 0;
        
        // Check for elements with difficulty classes
        const easyElements = document.querySelectorAll('.problem-difficulty-stat.easy, [class*="difficulty"].easy');
        const mediumElements = document.querySelectorAll('.problem-difficulty-stat.medium, [class*="difficulty"].medium');
        const hardElements = document.querySelectorAll('.problem-difficulty-stat.hard, [class*="difficulty"].hard');
        const ninjaElements = document.querySelectorAll('.problem-difficulty-stat.ninja, [class*="difficulty"].ninja');
        
        // Extract numbers from these elements
        for (const el of easyElements) {
          const match = el.textContent.match(/(\d+)/);
          if (match) easyCount = parseInt(match[1]);
        }
        
        for (const el of mediumElements) {
          const match = el.textContent.match(/(\d+)/);
          if (match) mediumCount = parseInt(match[1]);
        }
        
        for (const el of hardElements) {
          const match = el.textContent.match(/(\d+)/);
          if (match) hardCount = parseInt(match[1]);
        }
        
        for (const el of ninjaElements) {
          const match = el.textContent.match(/(\d+)/);
          if (match) ninjaCount = parseInt(match[1]);
        }
        
        // Sum up the difficulty counts
        totalSolved = easyCount + mediumCount + hardCount + ninjaCount;
      }
      
      // Method 3: Look for other stats sections
      if (totalSolved === 0) {
        const statsElements = document.querySelectorAll('.profile-user-other-stats-item-container, [class*="stats-item"]');
        for (const el of statsElements) {
          const text = el.textContent;
          if (text.includes('Problem') && text.includes('Solved')) {
            const match = text.match(/(\d+)/);
            if (match) {
              totalSolved = parseInt(match[1]);
              break;
            }
          }
        }
      }
      
      // Extract contest information
      let contestRating = 0;
      let contestRank = '';
      let contestHistory = [];
      
      // Look for contest rating
      const ratingElements = document.querySelectorAll(
        '.weekly-contest-rating, [class*="contest-rating"], [class*="rating-wrapper"], .rating'
      );
      
      for (const el of ratingElements) {
        const text = el.textContent;
        const ratingMatch = text.match(/rating[:\s]*(\d+)/i) || text.match(/(\d+)\s*(?:points|rating)/i);
        if (ratingMatch) {
          contestRating = parseInt(ratingMatch[1]);
          break;
        }
      }
      
      // Look for contest rank
      const rankElements = document.querySelectorAll(
        '.contest-ranks, [class*="ranking"], [class*="rank"]'
      );
      
      for (const el of rankElements) {
        const text = el.textContent;
        const rankMatch = text.match(/rank[:\s]*(\d+)/i) || text.match(/(\d+)(?:st|nd|rd|th)/i);
        if (rankMatch) {
          contestRank = rankMatch[1];
          break;
        }
      }
      
      // Try to find contest history (list of contests with ranks/ratings)
      const contestElements = document.querySelectorAll(
        '.contest-list li, .contest-ranks .list div, [class*="contest-item"]'
      );
      
      if (contestElements.length > 0) {
        for (const el of contestElements) {
          const text = el.textContent.trim();
          if (text) {
            // Try to extract contest name, rank, rating, etc.
            const nameMatch = text.match(/(.+?)(?:rank|rating|-|:)/i);
            const rankMatch = text.match(/rank[:\s]*(\d+)/i) || text.match(/(\d+)(?:st|nd|rd|th)/i);
            const ratingMatch = text.match(/rating[:\s]*(\d+)/i) || text.match(/(\d+)\s*(?:points|rating)/i);
            
            const contestEntry = {
              name: nameMatch ? nameMatch[1].trim() : text,
              rank: rankMatch ? rankMatch[1] : undefined,
              rating: ratingMatch ? parseInt(ratingMatch[1]) : undefined
            };
            
            contestHistory.push(contestEntry);
          }
        }
      }
      
      return {
        name,
        solved: totalSolved.toString(),
        contestRating,
        contestRank,
        contestHistory
      };
    });

    return {
      platform: 'codingninjas',
      username: profileId,
      totalSolved: parseInt(data.solved) || 0,
      rating: data.contestRating || undefined,
      rank: data.contestRank || undefined,
      contestHistory: data.contestHistory && data.contestHistory.length > 0 ? data.contestHistory : undefined
    };
  } catch (e) {
    return { platform: 'codingninjas', username: profileId, error: e.message };
  } finally {
    if (browser) await browser.close();
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  const profileId = process.argv[2];
  
  if (!profileId) {
    console.error('Usage: node fetch-codingninjas.js <profileId>');
    process.exit(1);
  }
  
  const debugMode = process.argv.includes('--debug');
  
  fetchCodingNinjasProfile(profileId, debugMode)
    .then(result => {
      // Output JSON to stdout so the parent process can capture it
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} 