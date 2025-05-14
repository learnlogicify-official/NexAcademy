#!/usr/bin/env node

/**
 * Standalone script to fetch HackerEarth profiles using Puppeteer
 * This avoids Next.js static analysis issues by running as a separate process
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

async function fetchHackerEarthProfile(username, debugDump = false) {
  const url = `https://www.hackerearth.com/@${username}`;
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
    
    console.log(`Navigating to ${url}...`);
    
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
      await page.waitForSelector('h1, .profile-main, .he-header', { timeout: 15000 });
    } catch (err) {
      console.log('Timeout waiting for selector, proceeding with dump anyway');
    }

    // Dump the full HTML for selector discovery if debugDump is true
    if (debugDump) {
      const html = await page.content();
      fs.writeFileSync('hackerearth_profile_dump.html', html, 'utf-8');
      
      // Take a screenshot as well
      await page.screenshot({ path: 'hackerearth_profile_screenshot.png' });
      
      console.log('Saved HTML dump and screenshot for debugging');
      
      // Check for page title to see if we got the actual profile or an error page
      const pageTitle = await page.title();
      console.log(`Page title: "${pageTitle}"`);
      
      if (pageTitle.includes('Page not found') || pageTitle.includes('Error') || pageTitle.includes('404')) {
        return { 
          platform: 'hackerearth', 
          username, 
          error: 'Profile not found' 
        };
      }
    }

    // Extract data using more reliable browser context
    const data = await page.evaluate(() => {
      // Helper function to find text content by selector with fallbacks
      const findText = (selectors) => {
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            for (const el of elements) {
              const text = el.textContent.trim();
              if (text) return text;
            }
          }
        }
        return '';
      };
      
      // Helper function to find elements matching a pattern in their text
      const findElementsByTextPattern = (pattern) => {
        const result = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent.trim();
          if (text && pattern.test(text)) {
            result.push({
              text,
              nodeName: node.nodeName,
              className: node.className
            });
          }
        }
        return result;
      };
      
      // Get profile name
      const name = findText(['h1', '.profile-name', '.name', '.username', '.user-name']);
      
      // Get rating (any number after "Rating" or in a rating-related element)
      let rating = 0;
      let ratingElements = document.querySelectorAll('[class*="rating"]');
      for (const el of ratingElements) {
        const text = el.textContent.trim();
        const match = text.match(/(\d+(\.\d+)?)/);
        if (match) {
          rating = parseFloat(match[1]);
          break;
        }
      }
      
      // If rating not found in specific elements, try to find it in the page text
      if (rating === 0) {
        const ratingPattern = /rating[^\d]*(\d+(\.\d+)?)/i;
        const elements = findElementsByTextPattern(ratingPattern);
        if (elements.length > 0) {
          const match = elements[0].text.match(ratingPattern);
          if (match) rating = parseFloat(match[1]);
        }
      }
      
      // Get problems solved count
      let solved = 0;
      // Try typical solved problem elements
      const solvedElements = document.querySelectorAll('[class*="solved"], [class*="problem"]');
      for (const el of solvedElements) {
        const text = el.textContent.trim();
        const match = text.match(/(\d+)/);
        if (match && text.toLowerCase().includes('problem') && text.toLowerCase().includes('solved')) {
          solved = parseInt(match[1]);
          break;
        }
      }
      
      // If not found in elements, try text pattern
      if (solved === 0) {
        const solvedPattern = /(\d+)\s*problems?\s*solved/i;
        const elements = findElementsByTextPattern(solvedPattern);
        if (elements.length > 0) {
          const match = elements[0].text.match(solvedPattern);
          if (match) solved = parseInt(match[1]);
        }
      }
      
      // Get contest count
      let contests = 0;
      const contestPattern = /(\d+)\s*contests?/i;
      const contestElements = findElementsByTextPattern(contestPattern);
      if (contestElements.length > 0) {
        for (const item of contestElements) {
          if (item.text.toLowerCase().includes('participated')) {
            const match = item.text.match(contestPattern);
            if (match) {
              contests = parseInt(match[1]);
              break;
            }
          }
        }
      }
      
      // Get badges/achievements
      let badges = 0;
      const badgeElements = document.querySelectorAll('[class*="badge"], [class*="achievement"]');
      if (badgeElements.length > 0) {
        // Either count elements or look for a number in text
        const badgeText = findText(['[class*="badge-count"]', '[class*="achievement-count"]']);
        if (badgeText) {
          const match = badgeText.match(/(\d+)/);
          if (match) badges = parseInt(match[1]);
        } else {
          badges = badgeElements.length;
        }
      }
      
      // Check if we can extract categories/difficulty stats
      const problemsByDifficulty = {};
      const categoryElements = document.querySelectorAll('[class*="track"], [class*="category"], [class*="difficulty"]');
      if (categoryElements.length > 0) {
        for (const el of categoryElements) {
          // Look for category name and count within each element
          const categoryName = el.querySelector('[class*="name"], [class*="label"]')?.textContent.trim();
          const countEl = el.querySelector('[class*="count"], [class*="number"], [class*="value"]');
          
          if (categoryName && countEl) {
            const countText = countEl.textContent.trim();
            const match = countText.match(/(\d+)/);
            if (match) {
              const count = parseInt(match[1]);
              if (count > 0) {
                problemsByDifficulty[categoryName] = count;
              }
            }
          }
        }
      }
      
      return {
        name,
        rating,
        solved,
        contests,
        badges,
        problemsByDifficulty
      };
    });

    // Fetch recent submissions and rating graph data
    let recentSubmissions = [];
    let ratingHistory = [];
    try {
      // 1. Fetch recent submissions (first page only for performance)
      const submissionsUrl = `https://www.hackerearth.com/AJAX/feed/newsfeed/submission/user/${username}/?page=1`;
      const submissionsRes = await page.evaluate(async (url) => {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) return null;
        return await res.text();
      }, submissionsUrl);
      if (submissionsRes) {
        // Parse the returned HTML for submissions
        const parser = new DOMParser();
        const doc = parser.parseFromString(submissionsRes, 'text/html');
        const rows = doc.querySelectorAll('tbody tr');
        for (const tr of rows) {
          const tds = tr.querySelectorAll('td');
          const as = tr.querySelectorAll('a');
          if (tds.length >= 6 && as.length >= 2) {
            const time = tds[tds.length-1].querySelector('[title]')?.getAttribute('title') || '';
            const problemLink = as[1].href;
            const problemName = as[1].textContent.trim();
            let status = tds[2].querySelector('[title]')?.getAttribute('title') || tds[2].textContent.trim();
            if (status.includes('Accepted')) status = 'AC';
            else if (status.includes('Partially')) status = 'PS';
            else if (status.includes('Wrong')) status = 'WA';
            else if (status.includes('Compilation')) status = 'CE';
            else if (status.includes('Runtime')) status = 'RE';
            else if (status.includes('Memory')) status = 'MLE';
            else if (status.includes('Time')) status = 'TLE';
            else status = 'OTH';
            const language = tds[5].textContent.trim();
            const submissionId = tr.id?.split('-').pop();
            const submissionLink = submissionId ? `https://www.hackerearth.com/submission/${submissionId}` : '';
            recentSubmissions.push({ time, problemName, problemLink, status, language, submissionLink });
          }
        }
      }
      // 2. Fetch rating graph data
      const ratingGraphUrl = `https://www.hackerearth.com/ratings/AJAX/rating-graph/${username}`;
      const ratingGraphRes = await page.evaluate(async (url) => {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) return null;
        return await res.text();
      }, ratingGraphUrl);
      if (ratingGraphRes && ratingGraphRes.includes('var dataset =')) {
        try {
          const match = ratingGraphRes.match(/var dataset = (\[.*?\]);/);
          if (match && match[1]) {
            const dataset = eval(match[1]);
            for (const contest of dataset) {
              ratingHistory.push({
                name: contest.event_title,
                date: contest.event_start,
                rating: contest.rating,
                rank: contest.rank,
                url: 'https://www.hackerearth.com' + contest.event_url
              });
            }
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }

    return {
      platform: 'hackerearth',
      username,
      totalSolved: data.solved || 0,
      rating: data.rating || 0,
      contests: data.contests || 0,
      badges: data.badges || 0,
      problemsByDifficulty: Object.keys(data.problemsByDifficulty).length > 0 ? data.problemsByDifficulty : undefined,
      recentSubmissions: recentSubmissions.length > 0 ? recentSubmissions : undefined,
      ratingHistory: ratingHistory.length > 0 ? ratingHistory : undefined
    };
  } catch (e) {
    return { platform: 'hackerearth', username, error: e.message };
  } finally {
    if (browser) await browser.close();
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  const username = process.argv[2];
  
  if (!username) {
    console.error('Usage: node fetch-hackerearth.js <username> [--debug]');
    process.exit(1);
  }
  
  const debugMode = process.argv.includes('--debug');
  
  fetchHackerEarthProfile(username, debugMode)
    .then(result => {
      // Output JSON to stdout so the parent process can capture it
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} 