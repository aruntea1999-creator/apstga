import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const item = await prisma.news.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        image: true,
        category: true,
        createdAt: true,
        published: true,
      },
    });
    if (!item) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Failed to load article" }, { status: 500 });
  }
}