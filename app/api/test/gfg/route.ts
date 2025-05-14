import { NextRequest, NextResponse } from 'next/server';
import { fetchGFGProfile } from '@/lib/fetchers/gfg';

export async function GET(request: NextRequest) {
  try {
    // Get username from query params or use default
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username') || 'sachinjeevan';
    
    console.log(`Testing GFG profile fetcher for username: ${username}`);
    
    // Fetch the profile data
    const profile = await fetchGFGProfile(username);
    
    // Return the profile data as JSON
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error testing GFG fetcher:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch GFG profile' 
    }, { status: 500 });
  }
}