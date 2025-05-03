import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, description } = await req.json();
  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: { name, description },
  });
  return NextResponse.json(tag);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.tag.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 