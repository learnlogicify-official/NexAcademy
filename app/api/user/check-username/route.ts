import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, error: "Username required and must be at least 3 characters." }, { status: 400 });
  }
  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } as any },
    select: { id: true },
  });
  return NextResponse.json({ available: !existing });
} 