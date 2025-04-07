import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.user.count();
    const active = await prisma.user.count({
      where: { isActive: true },
    });
    const inactive = await prisma.user.count({
      where: { isActive: false },
    });

    return NextResponse.json({
      total,
      active,
      inactive,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
} 