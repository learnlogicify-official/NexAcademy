import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

export async function GET() {
  try {
    // Fetch all root folders and their subfolders (2 levels deep)
    const folders = await db.folder.findMany({
      where: { parentId: null },
      include: {
        subfolders: {
          include: {
            subfolders: true
          }
        }
      }
    });
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received folder data:', body);

    // Validate the request body
    const validatedData = createFolderSchema.parse(body);
    
    // Create the folder
    const folder = await db.folder.create({
      data: {
        name: validatedData.name,
        parentId: validatedData.parentId,
      },
    });

    console.log('Created folder:', folder);
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) }, 
      { status: 500 }
    );
  }
} 