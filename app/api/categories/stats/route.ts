import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.category.count();
    const active = await prisma.category.count({
      where: { isVisible: true },
    });
    const inactive = await prisma.category.count({
      where: { isVisible: false },
    });

    return NextResponse.json({
      total,
      active,
      inactive,
    });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch category stats" },
      { status: 500 }
    );
  }
} 