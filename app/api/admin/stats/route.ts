import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [categoryCount, courseCount, userCount] = await Promise.all([
      prisma.category.count(),
      prisma.course.count(),
      prisma.user.count(),
    ]);
    return NextResponse.json({
      categories: categoryCount,
      courses: courseCount,
      users: userCount,
    });
  } catch (error) {
    console.error("Error counting admin stats:", error);
    return NextResponse.json(
      { error: "Failed to count admin stats" },
      { status: 500 }
    );
  }
} 