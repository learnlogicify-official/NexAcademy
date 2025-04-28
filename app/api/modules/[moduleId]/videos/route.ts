import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// List videos for a module
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const videos = await prisma.video.findMany({
    where: { moduleId: params.moduleId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(videos);
}

// Add a new video to a module
export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { vimeoUrl, title, order } = await req.json();
  const video = await prisma.video.create({
    data: {
      vimeoUrl,
      title,
      order,
      moduleId: params.moduleId,
    },
  });
  return NextResponse.json(video);
}

// Edit a video (title, vimeoUrl, order)
export async function PATCH(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { id, ...data } = await req.json();
  const video = await prisma.video.update({
    where: { id },
    data,
  });
  return NextResponse.json(video);
}

// Delete a video
export async function DELETE(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { id } = await req.json();
  await prisma.video.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
} 