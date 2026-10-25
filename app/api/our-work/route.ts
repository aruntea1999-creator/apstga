import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.ourWork.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: items.map((w) => ({
        id: w.id,
        url: w.url,
        title: w.title,
        description: w.description,
        image: w.image,
        video: w.video,
        createdAt: w.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load works" }, { status: 500 });
  }
}
