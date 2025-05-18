import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

// Promisify the exec function
const execPromise = promisify(exec);

// Explicitly set to nodejs runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }
    
    // Determine the script path relative to the project root
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-codingninjas.js');
    
    // Execute the fetch script as a child process
    console.log(`Executing ${scriptPath} with username ${username}`);
    const { stdout, stderr } = await execPromise(`node ${scriptPath} ${username} --quiet`);
    
    if (stderr) {
      console.error(`Error fetching CodingNinjas profile: ${stderr}`);
    }
    
    // Parse the output JSON
    const data = JSON.parse(stdout);
    
    // Extract the codingninjas platform data
    const codingNinjasData = data.platforms?.codingninjas;
    
    if (!codingNinjasData) {
      console.error('No codingninjas data found in script output');
      return NextResponse.json(
        { 
          error: 'Failed to fetch CodingNinjas profile data',
          platform: 'codingninjas',
          username 
        },
        { status: 500 }
      );
    }
    
    // Format the response
    const response = {
      platform: 'codingninjas',
      username,
      profileUrl: codingNinjasData.profileUrl,
      totalSolved: codingNinjasData.totalSolved,
      problemsByDifficulty: {
        easy: codingNinjasData.problemsByDifficulty.easy || 0,
        medium: codingNinjasData.problemsByDifficulty.medium || 0,
        hard: codingNinjasData.problemsByDifficulty.hard || 0,
        ninja: codingNinjasData.problemsByDifficulty.ninja || 0
      },
      contests: {
        rating: codingNinjasData.contests.rating || 0,
        rank: codingNinjasData.contests.rank || '',
        contestName: codingNinjasData.contests.contestName || '',
        problemsSolved: codingNinjasData.contests.problemsSolved || 0,
        attended: codingNinjasData.contests.attended || 0
      }
    };
    
    // Return the response
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in CodingNinjas profile fetch:', error);
    return NextResponse.json(
      { 
        error: `Error fetching CodingNinjas profile: ${error.message}`,
        platform: 'codingninjas',
        username: request.nextUrl.searchParams.get('username') 
      },
      { status: 500 }
    );
  }
} 