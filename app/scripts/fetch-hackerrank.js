#!/usr/bin/env node

/**
 * Standalone script to fetch HackerRank profiles using Puppeteer
 * This avoids Next.js static analysis issues by running as a separate process
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

async function fetchHackerRankProfile(username, debugDump = false) {
  const url = `https://www.hackerrank.com/${username}`;
  let browser;
  try {
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000)));
    try {
      await page.waitForSelector('h1, .profile-heading, .profileHeader', { timeout: 15000 });
    } catch (err) {
      console.log('Timeout waiting for selector, proceeding with dump anyway');
    }
    if (debugDump) {
      const html = await page.content();
      const debugHtmlPath = path.join(__dirname, 'hackerrank_profile_dump.html');
      const debugScreenshotPath = path.join(__dirname, 'hackerrank_profile_screenshot.png');
      fs.writeFileSync(debugHtmlPath, html, 'utf-8');
      await page.screenshot({ path: debugScreenshotPath });
      console.log('Saved HTML dump and screenshot for debugging');
      const pageTitle = await page.title();
      console.log(`Page title: "${pageTitle}"`);
      if (pageTitle.includes('Page Not Found') || pageTitle.includes('Error') || pageTitle.includes('404')) {
        return { platform: 'hackerrank', username, error: 'Profile not found' };
      }
    }
    // Extract data using HackerRank's public REST API endpoints
    const apiResults = await page.evaluate(async (username) => {
      function safeGet(obj, path, def = undefined) {
        return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : def), obj);
      }
      const profileUrl = `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?offset=0&limit=1000`;
      const ratingUrl = `https://www.hackerrank.com/rest/hackers/${username}/rating_histories_elo`;
      let name = '', totalSolved = 0, badges = [], ratingHistory = [];
      let error = null;
      try {
        // Fetch recent challenges
        const profileRes = await fetch(profileUrl);
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          const models = profileJson.models || [];
          totalSolved = models.length;
          // Try to get name from first challenge if available
          if (models.length > 0) {
            name = models[0].hacker || '';
          }
        } else {
          error = 'Profile not found or API error';
        }
        // Fetch rating history
        const ratingRes = await fetch(ratingUrl);
        if (ratingRes.ok) {
          const ratingJson = await ratingRes.json();
          ratingHistory = ratingJson.models || [];
        }
        // Try to fetch badges (not always available via API)
        // There is no public badge API, so fallback to HTML if needed
      } catch (e) {
        error = e.message;
      }
      return { name, totalSolved, badges, ratingHistory, error };
    }, username);

    // If API worked, return those results
    if (apiResults && !apiResults.error) {
      return {
        platform: 'hackerrank',
        username,
        name: apiResults.name,
        totalSolved: apiResults.totalSolved,
        badges: apiResults.badges,
        ratingHistory: apiResults.ratingHistory
      };
    }
    // Fallback: Try to extract from visible elements (legacy)
    const data = await page.evaluate(() => {
      let solved = 0, badges = 0, rank = '', score = 0, name = '';
      name = document.querySelector('h1, .profile-heading, .profileHeader')?.textContent?.trim() || '';
      return { name, solved, badges, rank, score };
    });
    return {
      platform: 'hackerrank',
      username,
      name: data.name,
      totalSolved: data.solved || 0,
      badges: data.badges || 0,
      rank: data.rank || '',
      score: data.score || 0,
      error: apiResults ? apiResults.error : 'Could not fetch profile stats'
    };
  } catch (e) {
    return { platform: 'hackerrank', username, error: e.message };
  } finally {
    if (browser) await browser.close();
  }
}

if (require.main === module) {
  const username = process.argv[2];
  if (!username) {
    console.error('Usage: node fetch-hackerrank.js <username> [--debug]');
    process.exit(1);
  }
  const debugMode = process.argv.includes('--debug');
  fetchHackerRankProfile(username, debugMode)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} 