import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: { course: true, submodules: true },
    });
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    return NextResponse.json(module);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const body = await request.json();
    const { title, description, learningObjectives } = body;
    const module = await prisma.module.update({
      where: { id: params.moduleId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(learningObjectives !== undefined && { learningObjectives }),
      },
    });
    return NextResponse.json(module);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
} 