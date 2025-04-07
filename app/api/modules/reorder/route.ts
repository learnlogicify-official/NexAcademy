import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { modules } = await request.json();

    // Update all modules in a transaction
    await prisma.$transaction(
      modules.map((module: { id: string; order: number }) =>
        prisma.module.update({
          where: { id: module.id },
          data: { order: module.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering modules:", error);
    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
} 