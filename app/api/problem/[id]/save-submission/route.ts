import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getJudge0LanguageName } from '@/utils/getJudge0LanguageName';

// Map of Judge0 language IDs to their display names for backward compatibility
const JUDGE0_LANGUAGE_MAP: Record<number, string> = {
  45: "Assembly (NASM 2.14.02)",
  46: "Bash (5.0.0)",
  47: "Basic (FBC 1.07.1)",
  75: "C (Clang 7.0.1)",
  76: "C++ (Clang 7.0.1)",
  48: "C (GCC 7.4.0)",
  52: "C++ (GCC 7.4.0)",
  49: "C (GCC 8.3.0)",
  53: "C++ (GCC 8.3.0)",
  50: "C (GCC 9.2.0)",
  54: "C++ (GCC 9.2.0)",
  86: "Clojure (1.10.1)",
  51: "C# (Mono 6.6.0.161)",
  77: "COBOL (GnuCOBOL 2.2)",
  55: "Common Lisp (SBCL 2.0.0)",
  56: "D (DMD 2.089.1)",
  57: "Elixir (1.9.4)",
  58: "Erlang (OTP 22.2)",
  44: "Executable",
  87: "F# (.NET Core SDK 3.1.202)",
  59: "Fortran (GFortran 9.2.0)",
  60: "Go (1.13.5)",
  88: "Groovy (3.0.3)",
  61: "Haskell (GHC 8.8.1)",
  62: "Java (OpenJDK 13.0.1)",
  63: "JavaScript (Node.js 12.14.0)",
  78: "Kotlin (1.3.70)",
  64: "Lua (5.3.5)",
  89: "Multi-file program",
  79: "Objective-C (Clang 7.0.1)",
  65: "OCaml (4.09.0)",
  66: "Octave (5.1.0)",
  67: "Pascal (FPC 3.0.4)",
  85: "Perl (5.28.1)",
  68: "PHP (7.4.1)",
  43: "Plain Text",
  69: "Prolog (GNU Prolog 1.4.5)",
  70: "Python (2.7.17)",
  71: "Python (3.8.1)",
  80: "R (4.0.0)",
  72: "Ruby (2.7.0)",
  73: "Rust (1.40.0)",
  81: "Scala (2.13.2)",
  82: "SQL (SQLite 3.27.2)",
  83: "Swift (5.2.3)",
  74: "TypeScript (3.7.4)",
  84: "Visual Basic.Net (vbnc 0.0.0.5943)"
};

// POST /api/problem/[id]/save-submission
export async function POST(request: Request, context: { params: { id: string } }) {
  
  try {
    // Step 1: Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const problemId = context.params.id;
    
    
    // Step 2: Ensure tables exist
    try {
      // Load and execute the setup script
      const setupScript = fs.readFileSync(path.join(process.cwd(), 'scripts', 'setup-tables.sql'), 'utf8');
      
      await prisma.$executeRawUnsafe(setupScript);
    } catch (setupError) {
      console.error("[API] save-submission: Error setting up tables:", setupError instanceof Error ? setupError.message : String(setupError));
      // Continue anyway - tables might already exist
    }
    
    // Step 3: Parse request body
    try {
      const body = await request.json();
      
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
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      // Convert language ID to full name if needed
      let fullLanguageName = language;
      if (!isNaN(Number(language))) {
        const languageId = Number(language);
        const mappedName = await getJudge0LanguageName(languageId);
        if (mappedName) {
          fullLanguageName = mappedName;
        }
      }
      
      
      // Step 4: Save submission
      
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
          '${submissionId}', '${userId}', '${problemId}', '${fullLanguageName.replace(/'/g, "''")}', '${code.replace(/'/g, "''")}', 
          NOW(), ${testcasesPassed}, ${totalTestcases}, 
          ${!!allPassed}, ${runtime ? `'${runtime}'` : 'NULL'}, ${memory ? `'${memory}'` : 'NULL'}, 
          ${runtimePercentile ? `'${runtimePercentile}'` : 'NULL'}, ${memoryPercentile ? `'${memoryPercentile}'` : 'NULL'}
        )
      `;
      
      
      // Save the submission using raw SQL
      await prisma.$executeRawUnsafe(insertSQL);
      
      
      // Step 5: Update user settings if submission passed all tests
      if (allPassed) {
        
        try {
          // Check if a setting exists first
          const checkSettingsSQL = `
            SELECT id FROM "UserProblemSettings"
            WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            LIMIT 1
          `;
          
          
          const existingSettings = await prisma.$queryRawUnsafe(checkSettingsSQL);
          const hasSettings = Array.isArray(existingSettings) && existingSettings.length > 0;
          
          if (hasSettings) {
            // Update existing settings
            const updateSettingsSQL = `
              UPDATE "UserProblemSettings"
              SET "lastLanguage" = '${fullLanguageName.replace(/'/g, "''")}',
                  "lastAcceptedSubmissionId" = '${submissionId}',
                  "hideAcceptedTab" = false
              WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
            `;
            
            await prisma.$executeRawUnsafe(updateSettingsSQL);
          } else {
            // Create new settings
            const insertSettingsSQL = `
              INSERT INTO "UserProblemSettings" (
                "id", "userId", "problemId", "lastLanguage", "lastAcceptedSubmissionId", "hideAcceptedTab"
              )
              VALUES (
                '${crypto.randomUUID()}', '${userId}', '${problemId}', '${fullLanguageName.replace(/'/g, "''")}', '${submissionId}', false
              )
            `;
            
            await prisma.$executeRawUnsafe(insertSettingsSQL);
          }
          
        } catch (settingsError) {
          console.error("[API] save-submission: Error updating settings:", settingsError instanceof Error ? settingsError.message : String(settingsError));
          // Still return success even if settings update fails
        }
      }
      
      // Step 6: Return success response
      return NextResponse.json({ 
        success: true, 
        submission: {
          id: submissionId,
          userId,
          problemId,
          language: fullLanguageName,
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