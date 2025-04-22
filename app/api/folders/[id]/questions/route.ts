import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: folderId } = params;
    const url = new URL(request.url);
    const includeSubfolders = url.searchParams.get("includeSubfolders") === "true";

    // Validate folder exists
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

    // Collect all folder IDs to query (main folder + subfolders if requested)
    const folderIds = [folderId];
    
    if (includeSubfolders) {
      // Add all subfolder IDs
      folder.subfolders.forEach(subfolder => {
        folderIds.push(subfolder.id);
      });
    }

    // Get all questions in this folder and subfolders if requested
    const questions = await prisma.question.findMany({
      where: { 
        folderId: { in: folderIds } 
      },
      include: {
        folder: true,
        mCQQuestion: {
          include: {
            options: true
          }
        },
        codingQuestion: {
          include: {
            languageOptions: true,
            testCases: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      folder,
      questions,
      count: questions.length,
      includesSubfolders: includeSubfolders
    });
  } catch (error) {
    console.error("Error fetching folder questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions for this folder" },
      { status: 500 }
    );
  }
} 