import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getJudge0LanguageName } from '@/utils/getJudge0LanguageName';

// GET /api/problem/[id]/load-code?language=...
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  // Properly await the context
  const { params } = await context;
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  const problemId = params.id;
  
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    if (!language) {
      return NextResponse.json({ error: "Missing language" }, { status: 400 });
    }

    let draft = null;
    let judge0LanguageName = null;
    const languageId = Number(language);
    if (!isNaN(languageId)) {
      // Special handling for Python versions
      if (languageId === 70) {
        judge0LanguageName = "Python (2.7.17)";
      } else if (languageId === 71) {
        judge0LanguageName = "Python (3.8.1)";
      } else {
        judge0LanguageName = await getJudge0LanguageName(languageId);
      }
    }

    // Try to find a draft by exact Judge0 language name
    if (judge0LanguageName) {
      draft = await prisma.userCodeDraft.findUnique({
        where: { userId_problemId_language: { userId, problemId, language: judge0LanguageName } },
      });
    }

    // Fallback: try to find legacy drafts
    if (!draft) {
      const allDrafts = await prisma.userCodeDraft.findMany({
        where: { userId, problemId }
      });
      draft = allDrafts.find(d =>
        d.language === language ||
        (judge0LanguageName && d.language.includes(judge0LanguageName)) ||
        d.language.includes(String(languageId))
      );
    }

    if (!draft) {
      return NextResponse.json({ code: null });
    }
    return NextResponse.json({ code: draft.code });
  } catch (error) {
    console.error("Error loading code:", error);
    return NextResponse.json({ error: "Failed to load code" }, { status: 500 });
  }
} 