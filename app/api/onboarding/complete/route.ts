import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as fs from 'fs';
import * as path from 'path';

// Function to backup data that might not be stored in the database yet
async function backupOnboardingData(userId: string, data: any) {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'data', 'onboarding-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup file
    const backupFile = path.join(backupDir, `${userId}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      data
    }, null, 2));
    
    console.log(`Backup created for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error creating backup:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    console.log("Starting onboarding completion process...");
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log("Session data:", JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      console.log("No valid session found");
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      );
    }
    
    // Extract user ID - Using just session.user.id as that's what we have in the session
    const userId = session.user.id;
    if (!userId) {
      console.log("No user ID found in session");
      return NextResponse.json(
        { error: "Invalid session: User ID missing" },
        { status: 400 }
      );
    }
    
    console.log("User ID from session:", userId);
    const data = await req.json();
    console.log("Request data:", data);
    
    const { username, profilePicture, userBio, userInterests, programmingLanguage, learningPath, skillLevel } = data;
    
    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }
    
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        NOT: {
          id: userId
        }
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }
    
    console.log("Updating user with ID:", userId);
    
    // Create a backup of all onboarding data including interests
    await backupOnboardingData(userId, data);
    
    // Update user with all onboarding data
    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        username,
        hasOnboarded: true,
        profilePic: profilePicture || undefined, // Save profile picture if provided
        bio: userBio || undefined, // Save bio as a separate field
        interests: userInterests || [], // Save the user's interests
        preferredLanguage: programmingLanguage || undefined, // Save preferred programming language
        learningPath: learningPath || undefined, // Save learning path directly
        skillLevel: skillLevel || undefined, // Save skill level directly
      }
    });
    
    console.log("User updated successfully");
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        hasOnboarded: updatedUser.hasOnboarded
      }
    });
    
  } catch (error: any) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
} 