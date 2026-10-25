import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const items = await prisma.download.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      items: items.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        file: d.file,
        category: d.category,
        size: d.size,
        date: d.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const file = String(body?.file || "").trim();
    if (!title || !file) {
      return NextResponse.json({ error: "Document title and file URL are required." }, { status: 400 });
    }
    const item = await prisma.download.create({
      data: {
        title,
        description: body?.description ? String(body.description).trim() : null,
        file,
        category: body?.category ? String(body.category).trim() : null,
        size: body?.size ? String(body.size).trim() : null,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add document" }, { status: 500 });
  }
}