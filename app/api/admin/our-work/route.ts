import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchLinkMeta, fetchImageBytes } from "@/lib/our-work";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const items = await prisma.ourWork.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      items: items.map((w) => ({
        id: w.id,
        url: w.url,
        title: w.title,
        description: w.description,
        image: w.image,
        video: w.video,
        published: w.published,
        createdAt: w.createdAt,
        hasImageData: Boolean(w.imageData),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load works" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const url = String(body?.url || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "A valid link (starting with http or https) is required." }, { status: 400 });
    }
    const meta = await fetchLinkMeta(url);
    const item = await prisma.ourWork.create({
      data: {
        url,
        title: meta.title,
        description: meta.description?.slice(0, 500),
        image: meta.image,
        video: meta.video,
        published: true,
      },
    });
    if (meta.image) {
      const image = await fetchImageBytes(meta.image).catch(() => null);
      if (image) {
        await prisma.ourWork.update({
          where: { id: item.id },
          data: { imageData: image.data, imageType: image.type },
        });
      }
    }
    const saved = await prisma.ourWork.findUnique({ where: { id: item.id } });
    return NextResponse.json({ item: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add work" }, { status: 500 });
  }
}