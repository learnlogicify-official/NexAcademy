import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; subfolderId: string } }
) {
  try {
    const { id, subfolderId } = params;

    if (!id || !subfolderId) {
      return NextResponse.json(
        { error: "Folder ID and subfolder ID are required" },
        { status: 400 }
      );
    }

    // Verify parent-child relationship
    const folder = await prisma.folder.findUnique({
      where: {
        id: subfolderId,
        parentId: id
      }
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Subfolder not found or does not belong to the specified folder" },
        { status: 404 }
      );
    }

    // Delete the subfolder
    await prisma.folder.delete({
      where: {
        id: subfolderId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subfolder:", error);
    return NextResponse.json(
      { error: "Failed to delete subfolder" },
      { status: 500 }
    );
  }
} 