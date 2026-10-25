import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await request.json();
    const update: any = {};
    for (const field of ["title", "slug", "content", "excerpt", "image", "category"] as const) {
      if (body[field] !== undefined) update[field] = String(body[field]).trim();
    }
    if (body.published !== undefined) update.published = Boolean(body.published);
    if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    const item = await prisma.news.update({ where: { id }, data: update });
    return NextResponse.json({ item });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "A news item with this slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}