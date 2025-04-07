import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, description, startDate, endDate, categoryId, isVisible = true } = body;

    const course = await prisma.course.create({
      data: {
        title,
        subtitle,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        categoryId,
        isVisible,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const visibility = searchParams.get("visibility") || "";
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { subtitle: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (visibility && visibility !== "all") {
      where.isVisible = visibility === "true";
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
} 