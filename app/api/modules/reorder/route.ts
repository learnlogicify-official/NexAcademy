import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Module {
  id: string;
  order: number;
}

export async function PATCH(request: Request) {
  try {
    const { moduleId, oldOrder, newOrder, courseId } = await request.json();

    // Get all modules for the course
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    // Calculate the new orders
    const updates = modules.map((module: Module) => {
      let newModuleOrder = module.order;

      if (module.id === moduleId) {
        // This is the module being moved
        newModuleOrder = newOrder;
      } else if (oldOrder < newOrder) {
        // Moving down: decrease order of modules in between
        if (module.order > oldOrder && module.order <= newOrder) {
          newModuleOrder = module.order - 1;
        }
      } else if (oldOrder > newOrder) {
        // Moving up: increase order of modules in between
        if (module.order >= newOrder && module.order < oldOrder) {
          newModuleOrder = module.order + 1;
        }
      }

      return prisma.module.update({
        where: { id: module.id },
        data: { order: newModuleOrder },
      });
    });

    // Update all modules in a transaction
    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering modules:", error);
    return NextResponse.json(
      { message: "Failed to reorder modules" },
      { status: 500 }
    );
  }
} 