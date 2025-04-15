import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();

    if (!params.id) {
      return NextResponse.json(
        { error: "Parent folder ID is required" },
        { status: 400 }
      );
    }

    const subfolder = await prisma.folder.create({
      data: {
        name,
        parentId: params.id,
      },
    });

    return NextResponse.json(subfolder);
  } catch (error) {
    console.error("Error creating subfolder:", error);
    return NextResponse.json(
      { error: "Failed to create subfolder" },
      { status: 500 }
    );
  }
} 