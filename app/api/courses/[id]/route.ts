import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure we have the ID
    const id = await Promise.resolve(params.id);
    
    const body = await req.json();
    const { title, subtitle, description, startDate, endDate, categoryId, isVisible } = body;

    const updatedCourse = await prisma.course.update({
      where: {
        id,
      },
      data: {
        ...(title && { title }),
        ...(subtitle && { subtitle }),
        ...(description && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(categoryId && { 
          category: {
            connect: { id: categoryId }
          }
        }),
        ...(typeof isVisible === "boolean" && { isVisible }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.course.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 