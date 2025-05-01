import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const { username, bio, profilePic, preferredLanguage } = data;

  // Username uniqueness check (case-insensitive)
  if (username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        email: { not: session.user.email },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
    }
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      username,
      bio,
      profilePic,
      preferredLanguage,
      hasOnboarded: true,
    },
  });

  return NextResponse.json({ success: true });
} 