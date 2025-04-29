import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const result = await (prisma as any).attempt.deleteMany({
      where: { status: 'in-progress' }
    });
    return NextResponse.json({ deleted: result.count }, { status: 200 });
  } catch (error) {
    console.error('Delete in-progress attempts error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 