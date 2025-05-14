import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Generate a GitHub OAuth URL with custom state that includes user ID
export async function GET() {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }
    
    // Generate a random state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    })).toString('base64');
    
    // Store state in a cookie for verification when GitHub redirects back
    const response = NextResponse.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user,user:email,repo&state=${state}`
    );
    
    // Set cookie with state
    response.cookies.set("github_oauth_state", state, { 
      httpOnly: true,
      maxAge: 3600,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    return response;
  } catch (error) {
    console.error("Error initiating GitHub connection:", error);
    return NextResponse.json(
      { error: "Failed to initiate GitHub connection" },
      { status: 500 }
    );
  }
} 