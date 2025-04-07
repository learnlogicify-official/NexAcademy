import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.course.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting courses:", error);
    return NextResponse.json(
      { error: "Failed to count courses" },
      { status: 500 }
    );
  }
} 