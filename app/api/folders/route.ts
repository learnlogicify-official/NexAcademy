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
    // Fetch all folders as a flat array
    const folders = await db.folder.findMany();
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

    // Validate the request body
    const validatedData = createFolderSchema.parse(body);
    
    // Create the folder
    const folder = await db.folder.create({
      data: {
        name: validatedData.name,
        parentId: validatedData.parentId,
      },
    });

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