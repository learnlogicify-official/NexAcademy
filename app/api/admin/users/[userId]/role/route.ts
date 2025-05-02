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
    const { role } = await req.json();
    
    // Validate role
    if (role !== "ADMIN" && role !== "STUDENT") {
      return new Response(JSON.stringify({ error: "Invalid role. Must be ADMIN or STUDENT." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
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
    console.error("Error updating user role:", error);
    return new Response(JSON.stringify({ error: "Failed to update user role" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 