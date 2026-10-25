import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const date = new Date(body?.date);
    if (!title || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Event title and a valid date are required." }, { status: 400 });
    }
    const event = await prisma.event.create({
      data: {
        title,
        date,
        description: body?.description ? String(body.description).trim() : null,
        location: body?.location ? String(body.location).trim() : null,
        category: body?.category ? String(body.category).trim() : null,
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}