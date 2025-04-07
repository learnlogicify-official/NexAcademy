import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.course.count();
    const active = await prisma.course.count({
      where: { isVisible: true },
    });
    const inactive = await prisma.course.count({
      where: { isVisible: false },
    });

    return NextResponse.json({
      total,
      active,
      inactive,
    });
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch course stats" },
      { status: 500 }
    );
  }
} 