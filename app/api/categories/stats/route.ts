import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [visibleCategories, hiddenCategories] = await Promise.all([
      prisma.category.count({
        where: { visibility: "SHOW" },
      }),
      prisma.category.count({
        where: { visibility: "HIDE" },
      }),
    ]);

    return NextResponse.json({
      visible: visibleCategories,
      hidden: hiddenCategories,
      total: visibleCategories + hiddenCategories,
    });
  } catch (error) {
    console.error("[CATEGORIES_STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch category stats" },
      { status: 500 }
    );
  }
} 