import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: fetch last selected language for this user/problem
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const problemId = params.id;
  const settings = await prisma.userProblemSettings.findUnique({
    where: { userId_problemId: { userId, problemId } },
  });
  return NextResponse.json({ lastLanguage: settings?.lastLanguage || null });
}

// POST: set last selected language for this user/problem
export async function POST(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const problemId = context.params.id;
  const { language } = await request.json();
  await prisma.userProblemSettings.upsert({
    where: { userId_problemId: { userId, problemId } },
    update: { lastLanguage: language },
    create: { userId, problemId, lastLanguage: language },
  });
  return NextResponse.json({ success: true });
} 