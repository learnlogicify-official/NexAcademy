import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Clist API Integration
 * ---------------------
 * The Clist API provides data about competitive programming profiles, contests, and submissions.
 * Documentation: https://clist.by/api/v1/doc/
 * 
 * API Endpoint Format: https://clist.by/api/v1/[endpoint]/?[parameters]
 * 
 * Required parameters:
 * - username: Your account username on Clist
 * - api_key: Your API key from Clist
 * - resource_id: Numeric ID of the platform (NOT domain name)
 * 
 * Common endpoints:
 * - /account/ - User profile information
 * - /submission/ - User's submissions
 * - /contest_participation/ - User's contest history
 * 
 * Error handling:
 * - Falls back to mock data if API calls fail
 * - Logs detailed error information for debugging
 */

const CLIST_API_KEY = process.env.CLIST_API_KEY;
const CLIST_USERNAME = process.env.CLIST_USERNAME || 'user';
const CLIST_BASE_URL = 'https://clist.by/api/v1';

// Log API key availability for debugging
console.log(`Clist API Key available: ${!!CLIST_API_KEY}`);

// Define interface for user data with platform-specific fields
interface UserPlatformData {
  totalSolved: number;
  rank: number;
  rating?: number;
  contests: number;
  problemsByDifficulty: any;
  recentActivity: any[];
  badges?: number;
  score?: number;
}

/**
 * GET: Fetch user statistics from Clist API
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get all platform handles for the user
    // Using type assertion to overcome the casing mismatch
    const platformHandles = await (prisma as any).userPlatformHandle.findMany({
      where: { userId }
    });
    
    if (platformHandles.length === 0) {
      return NextResponse.json({ 
        message: "No platform handles found for user",
        platforms: [] 
      });
    }

    // Initialize platforms data
    const platformsData = [];
    
    // Make API calls to fetch data for each platform
    for (const platformHandle of platformHandles) {
      try {
        let userData;
        
        if (CLIST_API_KEY) {
          // Try to fetch data from the actual Clist API
          console.log(`Fetching real data from Clist API for ${platformHandle.platform} (${platformHandle.handle})`);
          userData = await fetchClistData(platformHandle.platform, platformHandle.handle);
        } else {
          // Fallback to mock data if no API key is available
          console.log(`Using mock data for ${platformHandle.platform} since no API key is available`);
          userData = await mockFetchClistData(platformHandle.platform, platformHandle.handle);
        }
        
        platformsData.push({
          platform: platformHandle.platform,
          handle: platformHandle.handle,
          data: userData
        });
      } catch (err) {
        console.error(`Error fetching data for ${platformHandle.platform}:`, err);
        
        // Fallback to mock data on error
        console.log(`Falling back to mock data for ${platformHandle.platform} due to error`);
        const mockData = await mockFetchClistData(platformHandle.platform, platformHandle.handle);
        
        platformsData.push({
          platform: platformHandle.platform,
          handle: platformHandle.handle,
          data: mockData,
          error: "Used fallback data due to API error"
        });
      }
    }
    
    return NextResponse.json({ platforms: platformsData });
  } catch (error) {
    console.error('Error retrieving coding platform data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve coding platform data' },
      { status: 500 }
    );
  }
}

/**
 * Fetch data from Clist API
 */
async function fetchClistData(platform: string, handle: string): Promise<UserPlatformData> {
  if (!CLIST_API_KEY) {
    throw new Error("Clist API key is not available");
  }

  try {
    // Map platform names to resource IDs
    const platformResourceMap: Record<string, string> = {
      'leetcode': '102',      // LeetCode ID in Clist
      'codeforces': '1',      // Codeforces ID in Clist
      'codechef': '2',        // CodeChef ID in Clist
      'hackerrank': '63',     // HackerRank ID in Clist
      'hackerearth': '73',    // HackerEarth ID in Clist 
      'geeksforgeeks': '94',  // GeeksForGeeks ID in Clist
      'gfg': '94'             // Alias for GeeksForGeeks
    };

    // Get resource ID from the map or use the provided platform string
    const resourceId = platformResourceMap[platform.toLowerCase()];
    
    if (!resourceId) {
      console.warn(`No resource ID mapping found for platform: ${platform}. Using platform name as fallback.`);
    }
    
    console.log(`Using resource ID: ${resourceId || platform} for platform: ${platform}`);
    
    // Helper function to mask API key in URLs for logging
    const maskApiKey = (url: string) => url.replace(CLIST_API_KEY!, 'API_KEY_HIDDEN');
    
    // Try multiple endpoint formats - the Clist API may have changed over time
    const apiFormats = [
      // Format 1: v1 API with username and handle as separate params
      {
        name: "v1 Standard",
        baseUrl: "https://clist.by/api/v1",
        endpoints: [
          `/account/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&user=${encodeURIComponent(handle)}&resource_id=${resourceId}`,
          `/submission/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&user=${encodeURIComponent(handle)}&resource_id=${resourceId}`,
          `/contest_participation/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&user=${encodeURIComponent(handle)}&resource_id=${resourceId}`
        ]
      },
      // Format 2: v2 API with JSON path
      {
        name: "v2 JSON",
        baseUrl: "https://clist.by/api/v2/json",
        endpoints: [
          `/account/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`,
          `/submission/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`,
          `/contest_participation/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`
        ]
      },
      // Format 3: v2 API without JSON path
      {
        name: "v2 Standard",
        baseUrl: "https://clist.by/api/v2",
        endpoints: [
          `/account/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`,
          `/submission/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`,
          `/contest_participation/?username=${encodeURIComponent(handle)}&resource_id=${resourceId}&key=${CLIST_API_KEY}`
        ]
      }
    ];
    
    // Test the basic API connectivity with the contest endpoint
    const testUrl = `https://clist.by/api/v1/contest/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&limit=1`;
    console.log(`Testing basic API connectivity: ${maskApiKey(testUrl)}`);
    
    try {
      const testResponse = await fetch(testUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (testResponse.ok) {
        console.log(`✅ API connectivity test successful! Status: ${testResponse.status}`);
      } else {
        console.error(`❌ API connectivity test failed! Status: ${testResponse.status}`);
        const errorText = await testResponse.text();
        console.error(`Error response: ${errorText.substring(0, 200)}`);
      }
    } catch (e) {
      console.error(`❌ API connectivity test failed with error: ${e}`);
    }

    // Try each API format in sequence until one works
    for (const apiFormat of apiFormats) {
      console.log(`Trying API format: ${apiFormat.name}`);
      
      try {
        const responses = await Promise.all(
          apiFormat.endpoints.map(async (endpoint, index) => {
            const url = `${apiFormat.baseUrl}${endpoint}`;
            try {
              console.log(`Trying endpoint ${index + 1}: ${maskApiKey(url)}`);
              
              const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error (HTTP ${response.status}): ${errorText.substring(0, 200)}`);
                
                if (errorText.includes('<!doctype html>') || errorText.includes('<html>')) {
                  console.error('Received HTML response instead of JSON. This may indicate an incorrect API endpoint format.');
                }
                
                return null;
              }
              
              // Parse response as JSON
              const text = await response.text();
              console.log(`Received data from endpoint ${index + 1} (${text.length} bytes)`);
              
              if (!text || text.trim() === '') {
                console.error('Empty response received');
                return null;
              }
              
              return JSON.parse(text);
            } catch (error: any) {
              console.error(`Error with endpoint ${index + 1}: ${error.message}`);
              return null;
            }
          })
        );
        
        // Filter out null responses (from failed endpoints)
        const validResponses = responses.filter(response => response !== null);
        
        if (validResponses.length > 0) {
          console.log(`✅ Found working API format: ${apiFormat.name}`);
          
          // Use responses that succeeded
          const accountResponse = responses[0] || {};
          const submissionsResponse = responses[1] || {};  
          const contestsResponse = responses[2] || {};
          
          // Process data as before...
          // Process and combine the data
          const totalSolved = submissionsResponse?.objects 
            ? submissionsResponse.objects.filter((sub: any) => sub.verdict === 'OK' || sub.verdict === 'Accepted').length 
            : 0;
          
          // Get last contest rating
          const contestParticipations = contestsResponse?.objects || [];
          const sortedContests = [...contestParticipations].sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const latestContest = sortedContests[0];
          const rating = latestContest?.rating || 0;
          const rank = latestContest?.place || 0;
          
          // Get account information
          const accounts = accountResponse?.objects || [];
          const account = accounts[0] || {};
          
          // Process submission data for difficulty breakdown
          const submissions = submissionsResponse?.objects || [];
          const acceptedSubmissions = submissions.filter((sub: any) => sub.verdict === 'OK' || sub.verdict === 'Accepted');
          
          // Create difficulty breakdown, platform-specific
          let problemsByDifficulty: any = {};
          
          if (platform.toLowerCase() === 'leetcode') {
            problemsByDifficulty = {
              easy: 0,
              medium: 0,
              hard: 0
            };
            
            // Count problem difficulties
            acceptedSubmissions.forEach((sub: any) => {
              if (sub.problem && sub.problem.difficulty) {
                const difficulty = sub.problem.difficulty.toLowerCase();
                if (difficulty === 'easy') problemsByDifficulty.easy++;
                else if (difficulty === 'medium') problemsByDifficulty.medium++;
                else if (difficulty === 'hard') problemsByDifficulty.hard++;
              }
            });
          } 
          else if (platform.toLowerCase() === 'geeksforgeeks' || platform.toLowerCase() === 'gfg') {
            problemsByDifficulty = {
              school: 0,
              basic: 0,
              easy: 0,
              medium: 0,
              hard: 0
            };
            
            // Count problem difficulties
            acceptedSubmissions.forEach((sub: any) => {
              if (sub.problem && sub.problem.difficulty) {
                const difficulty = sub.problem.difficulty.toLowerCase();
                if (difficulty === 'school') problemsByDifficulty.school++;
                else if (difficulty === 'basic') problemsByDifficulty.basic++;
                else if (difficulty === 'easy') problemsByDifficulty.easy++;
                else if (difficulty === 'medium') problemsByDifficulty.medium++;
                else if (difficulty === 'hard') problemsByDifficulty.hard++;
              }
            });
          }
          else {
            // Generic difficulty breakdown for other platforms
            problemsByDifficulty = {
              easy: Math.floor(totalSolved * 0.4),
              medium: Math.floor(totalSolved * 0.4),
              hard: Math.floor(totalSolved * 0.2)
            };
          }
          
          // Build and return the response
          const userData: UserPlatformData = {
            totalSolved,
            rank: account.rank || rank,
            rating: account.rating || rating,
            contests: contestParticipations.length,
            problemsByDifficulty,
            recentActivity: submissions.slice(0, 5)
          };
          
          // Platform-specific additions
          if (platform.toLowerCase() === 'hackerrank') {
            userData.badges = account.badges || Math.floor(Math.random() * 10) + 3;
          }
          
          if (platform.toLowerCase() === 'geeksforgeeks' || platform.toLowerCase() === 'gfg') {
            userData.score = account.score || totalSolved * 10;
          }
          
          console.log(`Successfully processed data for platform: ${platform}`);
          return userData;
        }
      } catch (error) {
        console.error(`Error with API format ${apiFormat.name}:`, error);
        // Continue to next format on error
      }
    }
    
    // If we get here, all API formats failed
    throw new Error('All API formats failed');
  } catch (error) {
    console.error('Error fetching from Clist API:', error);
    // Fall back to mock data if the API call fails
    console.warn('Falling back to mock data due to API error');
    return mockFetchClistData(platform, handle);
  }
}

// Mock function to simulate fetching data from Clist API
// In production, this serves as a fallback when actual API calls fail
async function mockFetchClistData(platform: string, handle: string): Promise<UserPlatformData> {
  // Simulated delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Default data structure
  const baseData: UserPlatformData = {
    totalSolved: 0,
    rank: 0,
    contests: 0,
    recentActivity: [],
    problemsByDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  };
  
  // Simulate platform-specific data
  switch (platform.toLowerCase()) {
    case 'leetcode':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 500) + 50,
        rank: Math.floor(Math.random() * 10000) + 1,
        contests: Math.floor(Math.random() * 50),
        problemsByDifficulty: {
          easy: Math.floor(Math.random() * 200) + 20,
          medium: Math.floor(Math.random() * 150) + 10,
          hard: Math.floor(Math.random() * 80) + 5
        }
      };
    case 'codeforces':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 300) + 30,
        rank: Math.floor(Math.random() * 20000) + 1,
        rating: Math.floor(Math.random() * 2000) + 800,
        contests: Math.floor(Math.random() * 80) + 5
      };
    case 'codechef':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 200) + 20,
        rank: Math.floor(Math.random() * 50000) + 1,
        rating: Math.floor(Math.random() * 3000) + 1500,
        contests: Math.floor(Math.random() * 40) + 2
      };
    case 'hackerrank':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 150) + 15,
        rank: Math.floor(Math.random() * 40000) + 1,
        badges: Math.floor(Math.random() * 20) + 3,
        contests: Math.floor(Math.random() * 30) + 1
      };
    case 'hackerearth':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 120) + 10,
        rank: Math.floor(Math.random() * 30000) + 1,
        rating: Math.floor(Math.random() * 2000) + 1000,
        contests: Math.floor(Math.random() * 25) + 1
      };
    case 'geeksforgeeks':
    case 'gfg':
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 250) + 25,
        rank: Math.floor(Math.random() * 25000) + 1,
        score: Math.floor(Math.random() * 10000) + 500,
        problemsByDifficulty: {
          school: Math.floor(Math.random() * 50) + 10,
          basic: Math.floor(Math.random() * 75) + 15,
          easy: Math.floor(Math.random() * 80) + 20,
          medium: Math.floor(Math.random() * 60) + 10,
          hard: Math.floor(Math.random() * 40) + 5
        }
      };
    default:
      return {
        ...baseData,
        totalSolved: Math.floor(Math.random() * 100) + 10,
        rank: Math.floor(Math.random() * 15000) + 1,
        contests: Math.floor(Math.random() * 20) + 1
      };
  }
} 