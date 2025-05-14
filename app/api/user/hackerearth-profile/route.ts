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
    
    console.log(`Fetching HackerEarth profile for username: ${username}`);
    
    // Determine the script path relative to the project root
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-hackerearth.js');
    
    console.log('process.cwd():', process.cwd());
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
    // Execute the standalone script as a child process
    const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${username}" --debug`);
    console.log('Script stdout:', stdout);
    if (stderr) {
      console.error('Error from script:', stderr);
      throw new Error(stderr);
    }
    // Check for debug files
    const fs = require('fs');
    const htmlPath = require('path').join(process.cwd(), 'scripts', 'hackerearth_profile_dump.html');
    const screenshotPath = require('path').join(process.cwd(), 'scripts', 'hackerearth_profile_screenshot.png');
    if (fs.existsSync(htmlPath)) {
      const htmlStat = fs.statSync(htmlPath);
      console.log('HTML dump size:', htmlStat.size);
      const htmlSnippet = fs.readFileSync(htmlPath, 'utf-8').slice(0, 500);
      console.log('HTML dump snippet:', htmlSnippet);
    } else {
      console.log('HTML dump not found');
    }
    if (fs.existsSync(screenshotPath)) {
      const screenshotStat = fs.statSync(screenshotPath);
      console.log('Screenshot size:', screenshotStat.size);
    } else {
      console.log('Screenshot not found');
    }
    
    // Parse the JSON output from the script
    // Find the last JSON object in stdout
    const jsonMatch = stdout.match(/{[\s\S]*}$/m);
    if (!jsonMatch) throw new Error('No JSON found in script output');
    const profile = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json({
      profile,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in hackerearth-profile API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
} 