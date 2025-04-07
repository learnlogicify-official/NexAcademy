import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await request.json();

    const submodule = await prisma.submodule.update({
      where: { id: params.id },
      data: { title },
    });

    return NextResponse.json(submodule);
  } catch (error) {
    console.error("Error updating submodule:", error);
    return NextResponse.json(
      { error: "Failed to update submodule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.submodule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting submodule:", error);
    return NextResponse.json(
      { error: "Failed to delete submodule" },
      { status: 500 }
    );
  }
} 