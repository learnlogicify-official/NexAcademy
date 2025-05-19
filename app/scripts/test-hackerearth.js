#!/usr/bin/env node

/**
 * Standalone script to test HackerEarth profile fetching
 */
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHackerEarthProfile(username) {
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

    // Create debug output file
    const fs = require('fs');
    fs.writeFileSync('hackerearth_debug.html', response.data);
    console.log('Wrote debug HTML to hackerearth_debug.html');

    // Load the HTML content for parsing
    const $ = cheerio.load(response.data);
    
    // Check if the page content indicates profile doesn't exist
    const pageTitle = $('title').text().trim();
    console.log(`Page title: "${pageTitle}"`);
    
    if (pageTitle.includes('Page not found') || pageTitle.includes('Error') || pageTitle.includes('404')) {
      console.log(`HackerEarth profile not found for ${username}`);
      return { platform: 'hackerearth', username, error: 'Profile not found' };
    }
    
    // Start with default values
    let profileName = '';
    let solved = 0;
    let rating = 0;
    let rank = 'N/A';
    let contests = 0;
    let badges = 0;
    
    // First try to get basic profile info
    profileName = $('.profile-name, .name, h1').first().text().trim();
    console.log(`Found profile name: ${profileName || 'not found'}`);
    
    // Print out key selectors to debug
    console.log('\nDEBUG INFO:');
    console.log('============');
    
    // Log all h1-h6 elements
    console.log('\nHeadings found:');
    $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
      console.log(`${$(elem).prop('tagName')}: ${$(elem).text().trim()}`);
    });
    
    // Log all divs with class names containing 'profile', 'stats', 'solved', etc.
    console.log('\nRelevant divs/sections:');
    $('div[class*=profile], div[class*=stats], div[class*=solved], div[class*=rating], section, article').each((i, elem) => {
      const className = $(elem).attr('class') || '';
      const id = $(elem).attr('id') || '';
      console.log(`Div/Section: class="${className}" id="${id}"`);
    });

    // Try multiple selectors for rating
    const ratingSelectors = [
      '.rating-info', 
      '.rating-number', 
      '.rating-container',
      '[data-rating]',
      '*[class*=rating]'
    ];
    
    console.log('\nTrying rating selectors:');
    for (const selector of ratingSelectors) {
      const el = $(selector);
      if (el.length) {
        console.log(`Found selector: ${selector}, elements: ${el.length}`);
        el.each((i, elem) => {
          console.log(`  Element ${i+1} text: "${$(elem).text().trim()}"`);
        });
      } else {
        console.log(`Not found: ${selector}`);
      }
    }
    
    // Try multiple selectors for problems solved
    const solvedSelectors = [
      '.solved-count', 
      '.problems-solved', 
      '.problem-count',
      '.solved-problems',
      '*[class*=solved]',
      '*[class*=problem]'
    ];
    
    console.log('\nTrying solved problem selectors:');
    for (const selector of solvedSelectors) {
      const el = $(selector);
      if (el.length) {
        console.log(`Found selector: ${selector}, elements: ${el.length}`);
        el.each((i, elem) => {
          console.log(`  Element ${i+1} text: "${$(elem).text().trim()}"`);
        });
      } else {
        console.log(`Not found: ${selector}`);
      }
    }
    
    // Search for any text containing "problem" and "solved"
    console.log('\nSearching for "problems solved" text:');
    const problemElements = [];
    $('body *').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.toLowerCase().includes('problem') && text.toLowerCase().includes('solved')) {
        problemElements.push({
          element: $(elem).prop('tagName'),
          text,
          class: $(elem).attr('class') || ''
        });
      }
    });
    
    problemElements.slice(0, 10).forEach((item, i) => {
      console.log(`Element ${i+1}: ${item.element} class="${item.class}" text="${item.text}"`);
    });

    // Check if the site has changed significantly
    console.log('\nHackerEarth profile structure analysis:');
    const isNewDesign = $('.he-header').length > 0 || $('.header-new').length > 0;
    console.log(`Detected new design: ${isNewDesign}`);
    
    // Based on analysis, create a result object
    const result = {
      platform: 'hackerearth',
      username,
      profileName,
      isNewDesign,
      pageReceived: true,
      responseStatus: response.status,
      pageTitle
    };
    
    console.log('\nRESULT:');
    console.log(result);
    return result;
    
  } catch (e) {
    console.error(`HackerEarth fetch error for ${username}:`, e.message);
    return { 
      platform: 'hackerearth', 
      username, 
      error: `Failed to fetch profile: ${e.message}`
    };
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  const username = process.argv[2];
  
  if (!username) {
    console.error('Usage: node test-hackerearth.js <username>');
    process.exit(1);
  }
  
  fetchHackerEarthProfile(username)
    .then(result => {
      console.log('\nFinal Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} 