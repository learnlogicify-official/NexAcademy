import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { profilePic, bannerImage } = await req.json();
  const data: any = {};
  if (profilePic !== undefined) data.profilePic = profilePic;
  if (bannerImage !== undefined) data.bannerImage = bannerImage;
  await prisma.user.update({
    where: { email: session.user.email },
    data,
  });
  return NextResponse.json({ success: true });
} 