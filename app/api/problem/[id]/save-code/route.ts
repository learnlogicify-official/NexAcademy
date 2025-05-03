import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/problem/[id]/save-code
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const problemId = params.id;
  const body = await request.json();
  const { code, language } = body;
  if (!code || !language) {
    return NextResponse.json({ error: "Missing code or language" }, { status: 400 });
  }
  // Upsert the draft
  const draft = await prisma.userCodeDraft.upsert({
    where: { userId_problemId_language: { userId, problemId, language } },
    update: { code },
    create: { userId, problemId, language, code },
  });
  return NextResponse.json({ success: true, draft });
} 