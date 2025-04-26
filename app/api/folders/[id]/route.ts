import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: folderId } = params;

    // Fetch the folder with its subfolders
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        subfolders: true
      }
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    // Count questions in this folder
    const questionCount = await prisma.question.count({
      where: { folderId }
    });

    // Count questions in all subfolders
    const subfoldersWithCounts = await Promise.all(
      folder.subfolders.map(async (subfolder) => {
        const count = await prisma.question.count({
          where: { folderId: subfolder.id }
        });
        return {
          ...subfolder,
          questionCount: count
        };
      })
    );

    return NextResponse.json({
      ...folder,
      questionCount,
      subfolders: subfoldersWithCounts
    });
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();
    const folder = await prisma.folder.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all questions in the folder
    await prisma.question.deleteMany({
      where: { folderId: params.id },
    });

    // Then delete all assessments in the folder
    await prisma.assessment.deleteMany({
      where: { folderId: params.id },
    });

    // Delete all subfolders and their contents
    const subfolders = await prisma.folder.findMany({
      where: { parentId: params.id },
      select: { id: true }
    });

    for (const subfolder of subfolders) {
      // Delete questions in subfolder
      await prisma.question.deleteMany({
        where: { folderId: subfolder.id },
      });

      // Delete assessments in subfolder
      await prisma.assessment.deleteMany({
        where: { folderId: subfolder.id },
    });

      // Delete the subfolder
      await prisma.folder.delete({
        where: { id: subfolder.id },
      });
    }

    // Finally delete the main folder
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
} 