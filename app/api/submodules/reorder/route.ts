import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Submodule {
  id: string;
  order: number;
  moduleId: string;
}

export async function PATCH(request: Request) {
  try {
    const { submoduleId, oldOrder, newOrder, sourceModuleId, targetModuleId } = await request.json();

    if (sourceModuleId === targetModuleId) {
      // Reordering within the same module
      const submodules = await prisma.submodule.findMany({
        where: { moduleId: sourceModuleId },
        orderBy: { order: 'asc' },
      });

      const updates = submodules.map((submodule: Submodule) => {
        let newSubmoduleOrder = submodule.order;

        if (submodule.id === submoduleId) {
          // This is the submodule being moved
          newSubmoduleOrder = newOrder;
        } else if (oldOrder < newOrder) {
          // Moving down: decrease order of submodules in between
          if (submodule.order > oldOrder && submodule.order <= newOrder) {
            newSubmoduleOrder = submodule.order - 1;
          }
        } else if (oldOrder > newOrder) {
          // Moving up: increase order of submodules in between
          if (submodule.order >= newOrder && submodule.order < oldOrder) {
            newSubmoduleOrder = submodule.order + 1;
          }
        }

        return prisma.submodule.update({
          where: { id: submodule.id },
          data: { order: newSubmoduleOrder },
        });
      });

      await prisma.$transaction(updates);
    } else {
      // Moving to a different module
      // Get submodules from both source and target modules
      const [sourceSubmodules, targetSubmodules] = await Promise.all([
        prisma.submodule.findMany({
          where: { moduleId: sourceModuleId },
          orderBy: { order: 'asc' },
        }),
        prisma.submodule.findMany({
          where: { moduleId: targetModuleId },
          orderBy: { order: 'asc' },
        }),
      ]);

      const updates = [];

      // Update orders in source module (remove the submodule)
      sourceSubmodules
        .filter(sub => sub.id !== submoduleId)
        .forEach((sub, index) => {
          updates.push(
            prisma.submodule.update({
              where: { id: sub.id },
              data: { order: index },
            })
          );
        });

      // Update orders in target module (insert the submodule)
      targetSubmodules.forEach((sub, index) => {
        if (index === newOrder) {
          // Insert the moved submodule
          updates.push(
            prisma.submodule.update({
              where: { id: submoduleId },
              data: {
                moduleId: targetModuleId,
                order: newOrder,
              },
            })
          );
        }
        updates.push(
          prisma.submodule.update({
            where: { id: sub.id },
            data: { order: index + (index >= newOrder ? 1 : 0) },
          })
        );
      });

      // If inserting at the end
      if (newOrder >= targetSubmodules.length) {
        updates.push(
          prisma.submodule.update({
            where: { id: submoduleId },
            data: {
              moduleId: targetModuleId,
              order: targetSubmodules.length,
            },
          })
        );
      }

      await prisma.$transaction(updates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering submodules:", error);
    return NextResponse.json(
      { message: "Failed to reorder submodules" },
      { status: 500 }
    );
  }
} 