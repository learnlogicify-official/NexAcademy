import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting users:", error);
    return NextResponse.json(
      { error: "Failed to count users" },
      { status: 500 }
    );
  }
} 