import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getJudge0LanguageName } from '@/utils/getJudge0LanguageName';
import fetch from 'node-fetch';

// Judge0 API URL
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://128.199.24.150:2358';

// Helper to get proper Judge0 language name
async function getProperLanguageName(languageIdOrName: string): Promise<string> {
  // If it's already a name with version, return it
  if (typeof languageIdOrName === 'string' && !languageIdOrName.startsWith('Language ') && isNaN(Number(languageIdOrName))) {
    return languageIdOrName;
  }
  
  // Handle "Language X" format (extract the ID)
  let languageId = languageIdOrName;
  if (typeof languageIdOrName === 'string' && languageIdOrName.startsWith('Language ')) {
    languageId = languageIdOrName.split(' ')[1];
  }
  
  // Convert to number if it's a numeric string
  const numericId = Number(languageId);
  if (!isNaN(numericId)) {
    try {
      // Handle known Python versions specifically
      if (numericId === 70) return "Python (2.7.17)";
      if (numericId === 71) return "Python (3.8.1)";
      
      // Try to fetch from Judge0 API directly
      const res = await fetch(`${JUDGE0_API_URL}/languages`);
      if (res.ok) {
        const languages = await res.json();
        const language = languages.find((lang: any) => lang.id === numericId);
        if (language && language.name) {
          return language.name;
        }
      }
      
      // Fallback to utility
      const fullName = await getJudge0LanguageName(numericId);
      if (fullName) {
        return fullName;
      }
    } catch (error) {
      // Silent error - will return default below
    }
  }
  
  // If all else fails, return the original (better than nothing)
  return languageIdOrName;
}

// POST /api/problem/[id]/save-code
export async function POST(request: Request, context: Promise<{ params: { id: string } }>) {
  // Await the context to get params
  const { params } = await context;
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Use the awaited params
  const userId = session.user.id;
  const problemId = params.id;
  
  try {
    const body = await request.json();
    const { code, language } = body;
    if (!code || !language) {
      return NextResponse.json({ error: "Missing code or language" }, { status: 400 });
    }

    // Get proper language name with version
    const languageToStore = await getProperLanguageName(language);
    
    // Upsert the draft
    const draft = await prisma.userCodeDraft.upsert({
      where: { userId_problemId_language: { userId, problemId, language: languageToStore } },
      update: { code },
      create: { userId, problemId, language: languageToStore, code },
    });
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("Error saving code:", error);
    return NextResponse.json({ error: "Failed to save code" }, { status: 500 });
  }
} 