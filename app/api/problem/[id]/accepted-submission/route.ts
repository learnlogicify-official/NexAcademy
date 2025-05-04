import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// GET /api/problem/[id]/accepted-submission
export async function GET(request: Request, context: { params: { id: string } }) {
  console.log("[API] accepted-submission: Starting request");
  
  try {
    // Step 1: Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("[API] accepted-submission: Unauthorized - no session user id");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const problemId = context.params.id;
    
    console.log(`[API] accepted-submission: Processing for user ${userId}, problem ${problemId}`);
    
    // Step 2: Ensure tables exist
    try {
      // Load and execute the setup script
      const setupScript = fs.readFileSync(path.join(process.cwd(), 'scripts', 'setup-tables.sql'), 'utf8');
      console.log("[API] accepted-submission: Setting up database tables");
      
      await prisma.$executeRawUnsafe(setupScript);
      console.log("[API] accepted-submission: Database tables setup completed");
    } catch (setupError) {
      console.error("[API] accepted-submission: Error setting up tables:", setupError instanceof Error ? setupError.message : String(setupError));
      // Continue anyway - tables might already exist
    }
    
    try {
      // Step 3: Check if there's a last accepted submission ID in the settings
      console.log("[API] accepted-submission: Querying for user settings and last submission");
      
      const userSettingsQuery = `
        SELECT 
          ups."lastAcceptedSubmissionId", 
          ups."hideAcceptedTab",
          ps."id", ps."userId", ps."problemId", ps."language", ps."code", 
          ps."submittedAt", ps."testcasesPassed", ps."totalTestcases", 
          ps."allPassed", ps."runtime", ps."memory", 
          ps."runtimePercentile", ps."memoryPercentile"
        FROM "UserProblemSettings" ups
        LEFT JOIN "ProblemSubmission" ps ON ups."lastAcceptedSubmissionId" = ps."id"
        WHERE ups."userId" = '${userId}' AND ups."problemId" = '${problemId}'
        LIMIT 1
      `;
      
      console.log("[API] accepted-submission: Executing query:", userSettingsQuery);
      
      const userSettingsWithSubmission = await prisma.$queryRawUnsafe(userSettingsQuery);
      
      // Check if we got results with a valid submission
      if (userSettingsWithSubmission && 
          Array.isArray(userSettingsWithSubmission) && 
          userSettingsWithSubmission.length > 0 && 
          userSettingsWithSubmission[0].id) {
        
        const submission = userSettingsWithSubmission[0];
        const hideAcceptedTab = !!userSettingsWithSubmission[0].hideAcceptedTab;
        console.log("[API] accepted-submission: Found submission from settings:", submission.id);
        
        return NextResponse.json({ 
          hasAcceptedSubmission: true, 
          submission,
          hideAcceptedTab
        });
      }

      // Step 4: If no setting exists or submission not found, try to find the most recent accepted submission
      console.log("[API] accepted-submission: No submission found in settings, searching for latest accepted");
      
      const latestAcceptedQuery = `
        SELECT 
          "id", "userId", "problemId", "language", "code", 
          "submittedAt", "testcasesPassed", "totalTestcases", 
          "allPassed", "runtime", "memory", 
          "runtimePercentile", "memoryPercentile"
        FROM "ProblemSubmission" 
        WHERE "userId" = '${userId}' 
          AND "problemId" = '${problemId}'
          AND "allPassed" = true
        ORDER BY "submittedAt" DESC
        LIMIT 1
      `;
      
      console.log("[API] accepted-submission: Executing query:", latestAcceptedQuery);
      
      const latestAccepted = await prisma.$queryRawUnsafe(latestAcceptedQuery);

      if (latestAccepted && Array.isArray(latestAccepted) && latestAccepted.length > 0) {
        const submission = latestAccepted[0];
        console.log("[API] accepted-submission: Found latest accepted submission:", submission.id);
        
        // Step 5: Update the user settings for future requests
        try {
          console.log("[API] accepted-submission: Updating user settings with latest submission");
          
          // Check if settings record exists
          const existingSettingsQuery = `
            SELECT id FROM "UserProblemSettings"
            WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            LIMIT 1
          `;
          
          console.log("[API] accepted-submission: Checking for existing settings:", existingSettingsQuery);
          
          const existingSettings = await prisma.$queryRawUnsafe(existingSettingsQuery);
          const hasSettings = Array.isArray(existingSettings) && existingSettings.length > 0;
          
          if (hasSettings) {
            // Update existing settings
            const updateSettingsQuery = `
              UPDATE "UserProblemSettings"
              SET "lastAcceptedSubmissionId" = '${submission.id}'
              WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            `;
            
            console.log("[API] accepted-submission: Updating settings:", updateSettingsQuery);
            await prisma.$executeRawUnsafe(updateSettingsQuery);
          } else {
            // Create new settings
            const insertSettingsQuery = `
              INSERT INTO "UserProblemSettings" (
                "id", "userId", "problemId", "lastLanguage", "lastAcceptedSubmissionId"
              )
              VALUES (
                '${crypto.randomUUID()}', '${userId}', '${problemId}', '${submission.language.replace(/'/g, "''")}', '${submission.id}'
              )
            `;
            
            console.log("[API] accepted-submission: Creating settings:", insertSettingsQuery);
            await prisma.$executeRawUnsafe(insertSettingsQuery);
          }
          
          console.log("[API] accepted-submission: User settings updated successfully");
        } catch (settingsError) {
          console.error("[API] accepted-submission: Error updating settings:", settingsError instanceof Error ? settingsError.message : String(settingsError));
          // Still return success even if settings update fails
        }

        return NextResponse.json({ 
          hasAcceptedSubmission: true, 
          submission
        });
      }

      console.log("[API] accepted-submission: No accepted submissions found");
      return NextResponse.json({ 
        hasAcceptedSubmission: false,
        hideAcceptedTab: false
      });
    } catch (error) {
      console.error("[API] accepted-submission: Error processing request:", error instanceof Error ? error.message : String(error));
      return NextResponse.json({ 
        error: "Server error", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  } catch (outerError) {
    console.error("[API] accepted-submission: Outer error:", outerError instanceof Error ? outerError.message : String(outerError));
    return NextResponse.json({ 
      error: "Server error", 
      details: outerError instanceof Error ? outerError.message : String(outerError) 
    }, { status: 500 });
  }
}

// Add POST endpoint to hide the accepted tab
export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const problemId = context.params.id;
    // Set hideAcceptedTab to true for this user/problem
    const updateSQL = `
      UPDATE "UserProblemSettings"
      SET "hideAcceptedTab" = true
      WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
    `;
    await prisma.$executeRawUnsafe(updateSQL);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 