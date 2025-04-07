import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  visibility: z.enum(["SHOW", "HIDE"]),
});

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = context.params;

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update categories" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const updatedCategory = await prisma.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id },
        data: validatedData,
      });
      return category;
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = context.params;

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete categories" },
        { status: 403 }
      );
    }

    // Check if category has associated courses
    const categoryWithCourses = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        include: {
          courses: true,
        },
      });
      return category;
    });

    if (!categoryWithCourses) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (categoryWithCourses.courses.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated courses" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 