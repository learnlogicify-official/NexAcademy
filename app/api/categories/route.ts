import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
  visibility: z.enum(["SHOW", "HIDE"]),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create categories" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);
    const { name, description = "", visibility } = validatedData;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        visibility,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
} 