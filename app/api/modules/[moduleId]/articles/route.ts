import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// List articles for a module
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const articles = await prisma.article.findMany({
    where: { moduleId: params.moduleId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(articles);
}

// Add a new article to a module
export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { title, content, order } = await req.json();
  const article = await prisma.article.create({
    data: {
      title,
      content,
      order,
      moduleId: params.moduleId,
    },
  });
  return NextResponse.json(article);
}

// Edit an article (title, content, order)
export async function PATCH(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { id, ...data } = await req.json();
  const article = await prisma.article.update({
    where: { id },
    data,
  });
  return NextResponse.json(article);
}

// Delete an article
export async function DELETE(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const { id } = await req.json();
  await prisma.article.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
} 