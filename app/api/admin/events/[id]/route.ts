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
    for (const field of ["title", "description", "location", "category", "image"] as const) {
      if (body[field] !== undefined) update[field] = String(body[field]).trim();
    }
    if (body.date !== undefined) {
      const date = new Date(body.date);
      if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      update.date = date;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    const event = await prisma.event.update({ where: { id }, data: update });
    return NextResponse.json({ event });
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}