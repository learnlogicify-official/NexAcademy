import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [visibleCourses, hiddenCourses] = await Promise.all([
      prisma.course.count({
        where: { visibility: "SHOW" },
      }),
      prisma.course.count({
        where: { visibility: "HIDE" },
      }),
    ]);

    return NextResponse.json({
      visible: visibleCourses,
      hidden: hiddenCourses,
      total: visibleCourses + hiddenCourses,
    });
  } catch (error) {
    console.error("[COURSES_STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch course stats" },
      { status: 500 }
    );
  }
} 