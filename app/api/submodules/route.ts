import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { title, moduleId, order } = await request.json();

    const submodule = await prisma.submodule.create({
      data: {
        title,
        moduleId,
        order,
      },
    });

    return NextResponse.json(submodule);
  } catch (error) {
    console.error("Error creating submodule:", error);
    return NextResponse.json(
      { error: "Failed to create submodule" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    const submodules = await prisma.submodule.findMany({
      where: {
        moduleId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(submodules);
  } catch (error) {
    console.error("Error fetching submodules:", error);
    return NextResponse.json(
      { error: "Failed to fetch submodules" },
      { status: 500 }
    );
  }
} 