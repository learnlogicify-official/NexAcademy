import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        subfolders: true,
        questions: true,
        parent: true,
      },
      where: {
        parentId: null, // Only get top-level folders
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parentId } = body;

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
      },
      include: {
        subfolders: true,
        questions: true,
        parent: true,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
} 