import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/problem/[id]/load-code?language=...
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const problemId = params.id;
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  if (!language) {
    return NextResponse.json({ error: "Missing language" }, { status: 400 });
  }
  const draft = await prisma.userCodeDraft.findUnique({
    where: { userId_problemId_language: { userId, problemId, language } },
  });
  if (!draft) {
    return NextResponse.json({ code: null });
  }
  return NextResponse.json({ code: draft.code });
} 