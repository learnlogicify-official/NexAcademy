import { NextRequest, NextResponse } from 'next/server';
import { fetchLeetCodeProfile } from '@/lib/fetchers/leetcode';
import { fetchCodeforcesProfile } from '@/lib/fetchers/codeforces';
import { fetchCodechefProfile } from '@/lib/fetchers/codechef';
import { fetchGFGProfile } from '@/lib/fetchers/gfg';
import { fetchHackerEarthProfile } from '@/lib/fetchers/hackerearth';
import { PlatformProfile } from '@/lib/fetchers/types';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { getServerSession } from 'next-auth/next'; 
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; 

const execPromise = promisify(execCb);
const prisma = new PrismaClient();

// Apply the migration if PlatformData table doesn't exist
async function ensurePlatformDataTable() {
  try {
    // Try to check if the table exists and create it if it doesn't
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'PlatformData'
      );
    `;
    
    // @ts-ignore - We know this returns a boolean
    if (!tableExists[0].exists) {
      console.log('PlatformData table does not exist, creating it...');
      
      // Create the table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "PlatformData" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "platform" TEXT NOT NULL,
          "data" JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "PlatformData_pkey" PRIMARY KEY ("id")
        );
      `;
      
      // Create indexes
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "PlatformData_userId_platform_idx" ON "PlatformData"("userId", "platform");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "PlatformData_userId_idx" ON "PlatformData"("userId");
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "PlatformData_platform_idx" ON "PlatformData"("platform");
      `;
      
      // Add foreign key constraint
      await prisma.$executeRaw`
        ALTER TABLE "PlatformData" 
        ADD CONSTRAINT "PlatformData_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      
      console.log('PlatformData table created successfully');
    }
    return true;
  } catch (error) {
    console.error('Error ensuring PlatformData table exists:', error);
    return false;
  }
}

// Function to store platform data using raw SQL
async function storePlatformData(userId: string, platform: string, data: any) {
  try {
    console.log(`Storing data for platform ${platform} for user ${userId}...`);
    
    // First, check if the record exists
    const existingRecord = await prisma.$queryRaw`
      SELECT id FROM "PlatformData" 
      WHERE "userId" = ${userId} AND "platform" = ${platform}
      LIMIT 1;
    `;
    
    // Convert the data to JSON string
    const jsonData = JSON.stringify(data);
    
    if (Array.isArray(existingRecord) && existingRecord.length > 0) {
      // @ts-ignore - We know this returns an object with an id
      const recordId = existingRecord[0].id;
      console.log(`Updating existing record (id: ${recordId}) for ${platform}`);
      
      // Update the existing record
      await prisma.$executeRaw`
        UPDATE "PlatformData"
        SET "data" = ${jsonData}::jsonb, "updatedAt" = NOW()
        WHERE "id" = ${recordId};
      `;
    } else {
      // Insert a new record
      const id = uuidv4();
      console.log(`Creating new record (id: ${id}) for ${platform}`);
      
      await prisma.$executeRaw`
        INSERT INTO "PlatformData" ("id", "userId", "platform", "data", "createdAt", "updatedAt")
        VALUES (${id}, ${userId}, ${platform}, ${jsonData}::jsonb, NOW(), NOW());
      `;
    }
    
    console.log(`Successfully stored ${platform} data in database`);
    return true;
  } catch (error) {
    console.error(`Error storing platform data for ${platform}:`, error);
    return false;
  }
}

// Store fetched data directly in the database
async function savePlatformData(userId: string, profile: any) {
  if (profile.error) return false;
  
  try {
    console.log(`Saving ${profile.platform} data directly to database...`);
    
    // Store the data directly in the database
    const result = await storePlatformData(userId, profile.platform, profile);
    
    if (result) {
      console.log(`Successfully stored ${profile.platform} data in database`);
      return true;
    } else {
      console.error(`Failed to store ${profile.platform} data in database`);
      return false;
    }
  } catch (error) {
    console.error(`Error saving ${profile.platform} data to database:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  console.log('Profile data API request received:', request.nextUrl.searchParams.toString());
  
  try {
    // Verify authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const handles = {
      leetcode: searchParams.get('leetcode'),
      codeforces: searchParams.get('codeforces'),
      codechef: searchParams.get('codechef'),
      gfg: searchParams.get('gfg'),
      hackerrank: searchParams.get('hackerrank'),
      hackerearth: searchParams.get('hackerearth'),
      codingninjas: searchParams.get('codingninjas'),
    };

    console.log('Fetching profiles for handles:', handles);

    // Create a map of which platform uses which fetcher function
    const fetchers = {
      leetcode: fetchLeetCodeProfile,
      codeforces: fetchCodeforcesProfile,
      codechef: fetchCodechefProfile,
      gfg: fetchGFGProfile,
      hackerearth: fetchHackerEarthProfile,
    };
    
    // Fetch profiles in parallel with timeouts to prevent hanging requests
    const fetchWithTimeout = async (platform: string, username: string, timeoutMs = 15000) => {
      console.log(`Starting fetch for ${platform} profile: ${username}`);
      const startTime = Date.now();
      
      try {
        let fetchFn;
        
        // Special case for Coding Ninjas - call our dedicated API instead
        if (platform === 'codingninjas') {
          // Use our dedicated Node.js API route for Coding Ninjas
          console.log('Proxying request to dedicated Coding Ninjas API route');
          const response = await fetch(`${request.nextUrl.origin}/api/user/codingninjas-profile?username=${encodeURIComponent(username)}`, {
            signal: AbortSignal.timeout(timeoutMs)
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch from Coding Ninjas API: ${response.status}`);
          }
          
          const data = await response.json();
          return data.profile;
        } else if (platform === 'hackerrank') {
          // Use our dedicated Node.js script for HackerRank
          console.log('Proxying request to standalone HackerRank script');
          const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-hackerrank.js');
          const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${username}"`);
          if (stderr) {
            console.error('Error from script:', stderr);
            throw new Error(stderr);
          }
          const data = JSON.parse(stdout);
          return data;
        } else if (platform === 'hackerearth') {
          // Use our dedicated Node.js API route for HackerEarth
          console.log('Proxying request to dedicated HackerEarth API route');
          const response = await fetch(`${request.nextUrl.origin}/api/user/hackerearth-profile?username=${encodeURIComponent(username)}`, {
            signal: AbortSignal.timeout(timeoutMs)
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch from HackerEarth API: ${response.status}`);
          }
          const data = await response.json();
          return data.profile;
        } else {
          fetchFn = fetchers[platform as keyof typeof fetchers];
        }
        
        if (!fetchFn) {
          console.warn(`No fetcher found for platform: ${platform}`);
          return {
            platform,
            username,
            error: 'Unsupported platform'
          } as PlatformProfile;
        }
        
        // Create a promise that resolves with the profile after the fetcher resolves
        const fetchPromise = fetchFn(username);
        
        // Create a promise that rejects after timeoutMs
        const timeoutPromise = new Promise<PlatformProfile>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timed out after ${timeoutMs}ms`));
          }, timeoutMs);
        });
        
        // Race the fetch promise against the timeout
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        const duration = Date.now() - startTime;
        
        console.log(`Completed fetch for ${platform} in ${duration}ms: ${result.error ? 'Error' : 'Success'}`);
        return result;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`Error fetching ${platform} profile for ${username} after ${duration}ms:`, error);
        return {
          platform,
          username,
          error: error.message || 'Failed to fetch profile'
        } as PlatformProfile;
      }
    };
    
    // Create promises for each platform with a handle
    const fetchPromises = Object.entries(handles)
      .filter(([_, handle]) => handle) // Filter out null/empty handles
      .map(([platform, handle]) => {
        // Use a longer timeout for HackerEarth
        const timeout = platform === 'hackerearth' ? 30000 : 15000;
        return fetchWithTimeout(platform, handle as string, timeout);
      });
    
    console.log(`Started ${fetchPromises.length} profile fetch requests`);
    
    // Wait for all fetches to complete
    const profiles = await Promise.all(fetchPromises);
    
    console.log(`Completed all profile fetches: ${profiles.length} results`);
    console.log(`Success rate: ${profiles.filter(p => !p.error).length}/${profiles.length}`);

    // Ensure the PlatformData table exists before saving profiles
    const tableExists = await ensurePlatformDataTable();
    if (!tableExists) {
      console.error('Failed to ensure PlatformData table exists, profiles won\'t be saved');
    }

    // Save successful profiles directly to the database
    const savePromises = profiles
      .filter(profile => !profile.error)
      .map(profile => savePlatformData(user.id, profile));
    
    const saveResults = await Promise.all(savePromises);
    const savedCount = saveResults.filter(Boolean).length;
    
    console.log(`Saved ${savedCount}/${saveResults.length} platform profiles to database`);

    return NextResponse.json({
      profiles,
      savedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in profile-data API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}