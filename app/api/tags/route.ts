import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tags?page=1&pageSize=12
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
  const skip = (page - 1) * pageSize;

  // For search and sorting (optional, can be extended)
  const search = searchParams.get("search") || undefined;
  const sortField = searchParams.get("sortField") || "name";
  const sortDirection = searchParams.get("sortDirection") === "desc" ? "desc" : "asc";

  // Build where clause for search
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  // Get total count for pagination
  const total = await prisma.tag.count({ where });

  const all = searchParams.get("all") === "true";

  // Fetch paginated tags
  const tags = await prisma.tag.findMany({
    where,
    orderBy: { [sortField]: sortDirection },
    skip: all ? undefined : skip,
    take: all ? undefined : pageSize,
    include: {
      _count: {
        select: { codingQuestions: true }
      }
    }
  });

  // Calculate withDescription and recentlyAdded counts (for all tags, not just current page)
  const allTags = await prisma.tag.findMany({ where });
  const withDescription = allTags.filter(t => t.description && t.description.trim() !== "").length;
  const now = new Date();
  const recentlyAdded = allTags.filter(t => {
    const created = new Date(t.createdAt);
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7;
  }).length;

  return NextResponse.json({ tags, total, withDescription, recentlyAdded });
}

// POST /api/tags
export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const tag = await prisma.tag.create({ data: { name, description } });
  return NextResponse.json(tag);
} 