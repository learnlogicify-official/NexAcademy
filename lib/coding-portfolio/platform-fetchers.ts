import { fetchLeetCodeProfile } from '@/lib/fetchers/leetcode';
import { fetchCodechefProfile } from '@/lib/fetchers/codechef';
import { fetchCodeforcesProfile } from '@/lib/fetchers/codeforces';
import { fetchGFGProfile } from '@/lib/fetchers/gfg';
import { PlatformProfile } from '@/lib/fetchers/types';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import https from 'https';
import http from 'http';
import fetch from 'node-fetch';

const execPromise = promisify(execCb);

/**
 * Fetch platform-specific data for the given platform and username
 */
export async function fetchPlatformData(
  platform: string,
  username: string,
  apiKey?: string | null,
  serverHost?: string // Optional parameter for server host when called from server
): Promise<any> {
  try {
    // Normalize the platform name - always use 'codingninjas' internally
    const normalizedPlatform = platform.toLowerCase() === 'codestudio' 
      ? 'codingninjas' 
      : platform.toLowerCase();
    
    console.log(`Fetching data for ${normalizedPlatform}/${username}`);
    
    let profileData: PlatformProfile | null = null;
    
    // Special handling for platforms that require custom approaches
    if (normalizedPlatform === 'hackerrank') {
      console.log('Using standalone script for HackerRank');
      try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-hackerrank.js');
        const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${username}"`);
        if (stderr) {
          console.error('Error from HackerRank script:', stderr);
          throw new Error(stderr);
        }
        profileData = JSON.parse(stdout);
      } catch (error) {
        console.error('Failed to execute HackerRank script:', error);
        throw error;
      }
    } else if (normalizedPlatform === 'hackerearth') {
      console.log('Using direct API call for HackerEarth');
      profileData = await fetchPlatformFromAPI(
        `/api/user/hackerearth-profile?username=${encodeURIComponent(username)}`,
        serverHost
      );
    } else if (normalizedPlatform === 'codingninjas') {
      console.log('Using direct API call for CodingNinjas');
      profileData = await fetchPlatformFromAPI(
        `/api/user/codingninjas-profile?username=${encodeURIComponent(username)}`,
        serverHost
      );
    } else {
      // Use the direct fetchers for other platforms
      switch (normalizedPlatform) {
        case 'leetcode':
          profileData = await fetchLeetCodeProfile(username);
          break;
        case 'codechef':
          profileData = await fetchCodechefProfile(username);
          break;
        case 'codeforces':
          profileData = await fetchCodeforcesProfile(username);
          break;
        case 'geeksforgeeks':
          profileData = await fetchGFGProfile(username);
          break;
        default:
          throw new Error(`Unsupported platform: ${normalizedPlatform}`);
      }
    }
    
    // Process the data to standardize it for our database
    return {
      ...profileData,
      platform: normalizedPlatform, // Always use the normalized platform name
      username,
      // Keep the raw data for reference
      rawData: profileData
    };
  } catch (error) {
    console.error(`Error fetching ${platform} data for ${username}:`, error);
    return {
      platform: platform.toLowerCase() === 'codestudio' ? 'codingninjas' : platform.toLowerCase(),
      username,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      rawData: {},
      totalSolved: 0,
      rating: 0,
      rank: '',
      activityHeatmap: []
    };
  }
}

/**
 * Helper function to fetch from internal API routes
 */
async function fetchPlatformFromAPI(apiPath: string, serverHost?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Determine protocol based on host
    let host =
      serverHost ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      'localhost:3000';
    // Remove protocol if present in env var
    host = host.replace(/^https?:\/\//, '');
    const isHttps = !host.includes('localhost') && !host.startsWith('127.0.0.1');
    const httpModule = isHttps ? https : http;
    // Construct full URL
    const fullPath = `${isHttps ? 'https' : 'http'}://${host}${apiPath}`;
    console.log(`Making request to: ${fullPath}`);
    const req = httpModule.get(fullPath, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`API request failed with status code ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData.profile);
        } catch (e: unknown) {
          reject(new Error(`Failed to parse API response: ${e instanceof Error ? e.message : String(e)}`));
        }
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.end();
  });
} 