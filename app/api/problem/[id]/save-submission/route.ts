import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// POST /api/problem/[id]/save-submission
export async function POST(request: Request, context: { params: { id: string } }) {
  console.log("[API] save-submission: Starting request");
  
  try {
    // Step 1: Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("[API] save-submission: Unauthorized - no session user id");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const problemId = context.params.id;
    
    console.log(`[API] save-submission: Processing for user ${userId}, problem ${problemId}`);
    
    // Step 2: Ensure tables exist
    try {
      // Load and execute the setup script
      const setupScript = fs.readFileSync(path.join(process.cwd(), 'scripts', 'setup-tables.sql'), 'utf8');
      console.log("[API] save-submission: Setting up database tables");
      
      await prisma.$executeRawUnsafe(setupScript);
      console.log("[API] save-submission: Database tables setup completed");
    } catch (setupError) {
      console.error("[API] save-submission: Error setting up tables:", setupError instanceof Error ? setupError.message : String(setupError));
      // Continue anyway - tables might already exist
    }
    
    // Step 3: Parse request body
    try {
      const body = await request.json();
      console.log("[API] save-submission: Request body received");
      
      const { 
        language,
        code,
        testcasesPassed,
        totalTestcases,
        allPassed,
        runtime,
        memory,
        runtimePercentile,
        memoryPercentile
      } = body;

      if (!language || !code || testcasesPassed === undefined || totalTestcases === undefined) {
        console.log("[API] save-submission: Missing required fields");
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      // Step 4: Save submission
      console.log("[API] save-submission: Creating submission record");
      
      // Generate a UUID for the submission
      const submissionId = crypto.randomUUID();
      
      // Log the exact SQL we're about to run
      const insertSQL = `
        INSERT INTO "ProblemSubmission" (
          "id", "userId", "problemId", "language", "code", 
          "submittedAt", "testcasesPassed", "totalTestcases", 
          "allPassed", "runtime", "memory", 
          "runtimePercentile", "memoryPercentile"
        ) 
        VALUES (
          '${submissionId}', '${userId}', '${problemId}', '${language.replace(/'/g, "''")}', '${code.replace(/'/g, "''")}', 
          NOW(), ${testcasesPassed}, ${totalTestcases}, 
          ${!!allPassed}, ${runtime ? `'${runtime}'` : 'NULL'}, ${memory ? `'${memory}'` : 'NULL'}, 
          ${runtimePercentile ? `'${runtimePercentile}'` : 'NULL'}, ${memoryPercentile ? `'${memoryPercentile}'` : 'NULL'}
        )
      `;
      
      console.log("[API] save-submission: Executing SQL:", insertSQL);
      
      // Save the submission using raw SQL
      await prisma.$executeRawUnsafe(insertSQL);
      
      console.log("[API] save-submission: Submission created with ID:", submissionId);
      
      // Step 5: Update user settings if submission passed all tests
      if (allPassed) {
        console.log("[API] save-submission: Updating user problem settings for accepted submission");
        
        try {
          // Check if a setting exists first
          const checkSettingsSQL = `
            SELECT id FROM "UserProblemSettings"
            WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            LIMIT 1
          `;
          
          console.log("[API] save-submission: Checking for existing settings:", checkSettingsSQL);
          
          const existingSettings = await prisma.$queryRawUnsafe(checkSettingsSQL);
          const hasSettings = Array.isArray(existingSettings) && existingSettings.length > 0;
          
          if (hasSettings) {
            // Update existing settings
            const updateSettingsSQL = `
              UPDATE "UserProblemSettings"
              SET "lastLanguage" = '${language.replace(/'/g, "''")}',
                  "lastAcceptedSubmissionId" = '${submissionId}',
                  "hideAcceptedTab" = false
              WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            `;
            
            console.log("[API] save-submission: Updating settings:", updateSettingsSQL);
            await prisma.$executeRawUnsafe(updateSettingsSQL);
          } else {
            // Create new settings
            const insertSettingsSQL = `
              INSERT INTO "UserProblemSettings" (
                "id", "userId", "problemId", "lastLanguage", "lastAcceptedSubmissionId", "hideAcceptedTab"
              )
              VALUES (
                '${crypto.randomUUID()}', '${userId}', '${problemId}', '${language.replace(/'/g, "''")}', '${submissionId}', false
              )
            `;
            
            console.log("[API] save-submission: Creating settings:", insertSettingsSQL);
            await prisma.$executeRawUnsafe(insertSettingsSQL);
          }
          
          console.log("[API] save-submission: User problem settings updated successfully");
        } catch (settingsError) {
          console.error("[API] save-submission: Error updating settings:", settingsError instanceof Error ? settingsError.message : String(settingsError));
          // Still return success even if settings update fails
        }
      }
      
      // Step 6: Return success response
      console.log("[API] save-submission: Returning success response");
      return NextResponse.json({ 
        success: true, 
        submission: {
          id: submissionId,
          userId,
          problemId,
          language,
          testcasesPassed,
          totalTestcases,
          allPassed: !!allPassed,
          runtime,
          memory,
          runtimePercentile,
          memoryPercentile,
          submittedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("[API] save-submission: Error processing request:", error instanceof Error ? error.message : String(error));
      return NextResponse.json({ 
        error: "Server error", 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  } catch (outerError) {
    console.error("[API] save-submission: Outer error:", outerError instanceof Error ? outerError.message : String(outerError));
    return NextResponse.json({ 
      error: "Server error", 
      details: outerError instanceof Error ? outerError.message : String(outerError) 
    }, { status: 500 });
  }
} 