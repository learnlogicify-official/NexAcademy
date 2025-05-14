import { NextRequest, NextResponse } from 'next/server';

const CLIST_API_KEY = process.env.CLIST_API_KEY;
const CLIST_USERNAME = process.env.CLIST_USERNAME || 'user';
const CLIST_BASE_URL = 'https://clist.by/api/v1';

// Define endpoint type with proper typing for headers
interface TestEndpoint {
  name: string;
  url: string;
  headers: Record<string, string>;
}

/**
 * GET: Test endpoint for Clist API
 * Use this to debug API connection issues without requiring authentication
 * Example: /api/debug/clist-test?platform=leetcode&handle=username
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'leetcode';
    const handle = searchParams.get('handle') || 'user123';
    
    console.log(`Testing Clist API for ${platform} (${handle})`);
    
    if (!CLIST_API_KEY) {
      return NextResponse.json({ 
        error: "No API key available",
        success: false
      }, { status: 400 });
    }
    
    // Map platform names to resource IDs
    const platformResourceMap: Record<string, string> = {
      'leetcode': '102',
      'codeforces': '1',
      'codechef': '2',
      'hackerrank': '63',
      'hackerearth': '73',
      'geeksforgeeks': '94',
      'gfg': '94'
    };
    
    const resourceId = platformResourceMap[platform.toLowerCase()] || platform;
    
    // Generate and test different endpoint formats according to v1 documentation
    const testEndpoints: TestEndpoint[] = [
      // Test contest endpoint (most common use case)
      {
        name: 'v1 contest endpoint',
        url: `${CLIST_BASE_URL}/contest/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&limit=1`,
        headers: { 'Accept': 'application/json' }
      },
      // Test resource listing endpoint
      {
        name: 'v1 resource endpoint',
        url: `${CLIST_BASE_URL}/resource/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&limit=5`,
        headers: { 'Accept': 'application/json' }
      },
      // Test account endpoint with username
      {
        name: 'v1 account with user param',
        url: `${CLIST_BASE_URL}/account/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&user=${encodeURIComponent(handle)}&resource_id=${resourceId}`,
        headers: { 'Accept': 'application/json' }
      },
      // Test with resource name instead of ID
      {
        name: 'v1 with resource name',
        url: `${CLIST_BASE_URL}/account/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&user=${encodeURIComponent(handle)}&resource__name=${platform}`,
        headers: { 'Accept': 'application/json' }
      },
      // Test v2 endpoint for comparison
      {
        name: 'v2 format',
        url: `https://clist.by/api/v2/json/contest/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&limit=1`,
        headers: { 'Accept': 'application/json' }
      }
    ];

    // Try all endpoint formats
    const results = await Promise.all(
      testEndpoints.map(async (endpoint) => {
        try {
          console.log(`Testing: ${endpoint.name}`);
          const response = await fetch(endpoint.url, {
            headers: endpoint.headers
          });
          
          const status = response.status;
          let data: any = null;
          let error: any = null;
          let contentType = response.headers.get('content-type');
          
          try {
            if (contentType?.includes('application/json')) {
              data = await response.json();
            } else {
              error = await response.text();
              error = error.substring(0, 200) + (error.length > 200 ? '...' : '');
            }
          } catch (e: any) {
            error = `Failed to parse response: ${e.message}`;
          }
          
          return {
            endpoint: endpoint.name,
            url: endpoint.url.replace(CLIST_API_KEY, 'API_KEY_HIDDEN'),
            status,
            contentType,
            success: response.ok,
            data: data,
            error: error
          };
        } catch (e: any) {
          return {
            endpoint: endpoint.name,
            url: endpoint.url.replace(CLIST_API_KEY, 'API_KEY_HIDDEN'),
            error: e.message,
            success: false
          };
        }
      })
    );
    
    // Find the successful endpoint if any
    const successfulEndpoint = results.find(r => r.success);
    
    return NextResponse.json({
      platform,
      handle,
      resourceId,
      results,
      recommendedFormat: successfulEndpoint 
        ? successfulEndpoint.endpoint
        : "No successful format found"
    });
  } catch (error: any) {
    console.error('Error testing Clist API:', error);
    return NextResponse.json(
      { error: 'Failed to test API', details: error.message },
      { status: 500 }
    );
  }
} 