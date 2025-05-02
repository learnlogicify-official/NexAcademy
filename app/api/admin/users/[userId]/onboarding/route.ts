import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  // Check authentication and admin role
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized. Admin access required." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const userId = params.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { hasOnboarded } = await req.json();
    
    // Update user onboarding status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        hasOnboarded,
        // Reset onboarding fields if setting hasOnboarded to false
        ...(hasOnboarded === false && {
          username: null,
          bio: null,
          profilePic: null,
          preferredLanguage: null
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        hasOnboarded: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user onboarding status:", error);
    return new Response(JSON.stringify({ error: "Failed to update user onboarding status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 