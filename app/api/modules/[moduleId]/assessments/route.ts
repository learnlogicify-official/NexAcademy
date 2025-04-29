import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Type assertion for Prisma client to avoid TypeScript errors
const prismaAny = prisma as any;

// Get all assessments for a module
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  // Fetch the module and include its assessments
  const module = await prismaAny.module.findUnique({
    where: { id: params.moduleId },
    include: { assessments: true },
  });
  return NextResponse.json(module?.assessments ?? []);
}

// Add an assessment to a module
export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { assessmentId } = await req.json();
  const updated = await prismaAny.module.update({
    where: { id: params.moduleId },
    data: {
      assessments: {
        connect: { id: assessmentId }
      }
    },
    include: { assessments: true }
  });
  return NextResponse.json(updated);
}

// Remove an assessment from a module
export async function DELETE(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { assessmentId } = await req.json();
  const updated = await prismaAny.module.update({
    where: { id: params.moduleId },
    data: {
      assessments: {
        disconnect: { id: assessmentId }
      }
    },
    include: { assessments: true }
  });
  return NextResponse.json(updated);
} 