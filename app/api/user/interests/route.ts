import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      );
    }
    
    // Extract user ID
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session: User ID missing" },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    const { interests } = data;
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'data', 'user-interests');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Store interests in a JSON file
    const interestsFile = path.join(backupDir, `${userId}.json`);
    fs.writeFileSync(interestsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      userId,
      interests
    }, null, 2));
    
    return NextResponse.json({
      success: true,
      message: "Interests saved successfully"
    });
    
  } catch (error: any) {
    console.error("Error saving interests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save interests" },
      { status: 500 }
    );
  }
} 