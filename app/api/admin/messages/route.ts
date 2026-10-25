import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        read: m.read,
        date: m.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, read } = await request.json();
    if (typeof read !== "boolean" || !id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await prisma.contactMessage.update({ where: { id }, data: { read } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}