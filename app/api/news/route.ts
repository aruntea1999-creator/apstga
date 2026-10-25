import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({
      items: items.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        image: n.image,
        category: n.category,
        date: n.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}