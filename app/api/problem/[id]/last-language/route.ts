import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getJudge0LanguageName } from '@/utils/getJudge0LanguageName';

// Default Judge0 API URL as fallback
const DEFAULT_JUDGE0_API_URL = 'http://128.199.24.150:2358';

// Map of Judge0 language IDs to their display names for backward compatibility
// This can be expanded with more languages as needed
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

// Helper function to get proper Judge0 language name
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
    // First check our static map
    if (JUDGE0_LANGUAGE_MAP[numericId]) {
      return JUDGE0_LANGUAGE_MAP[numericId];
    }
    
    try {
      // Try to get name from Judge0LanguageName utility
      const fullName = await getJudge0LanguageName(numericId);
      if (fullName) {
        return fullName;
      }
    } catch (error) {
      // Silent error - will fallback
    }
  }
  
  // If all else fails, return the original (better than nothing)
  return languageIdOrName;
}

// GET: fetch last selected language for this user/problem
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  // Properly await the context
  const { params } = await context;
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const problemId = params.id;
  
  try {
    // Get user problem settings to find lastLanguage
    const settings = await prisma.userProblemSettings.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    
    // Get any saved code for this problem and language
    let savedCode = null;
    if (settings?.lastLanguage) {
      const codeDraft = await prisma.userCodeDraft.findFirst({
        where: {
          userId,
          problemId,
          language: settings.lastLanguage
        },
        select: {
          code: true
        }
      });
      
      savedCode = codeDraft?.code || null;
    }
    
    // Return both lastLanguage and savedCode in one response
    return NextResponse.json({ 
      lastLanguage: settings?.lastLanguage || null,
      savedCode
    });
  } catch (error) {
    console.error("Error getting last language:", error);
    return NextResponse.json({ error: "Failed to get last language" }, { status: 500 });
  }
}

// POST: set last selected language for this user/problem
export async function POST(request: Request, context: Promise<{ params: { id: string } }>) {
  // Properly await the context
  const { params } = await context;
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const problemId = params.id;
  
  try {
    const { language } = await request.json();
    if (!language) {
      return NextResponse.json({ error: "Missing language parameter" }, { status: 400 });
    }
    
    // Get proper language name with version
    const languageToStore = await getProperLanguageName(language);

    await prisma.userProblemSettings.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: { lastLanguage: languageToStore },
      create: { userId, problemId, lastLanguage: languageToStore },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting last language:", error);
    return NextResponse.json({ error: "Failed to set last language" }, { status: 500 });
  }
} 