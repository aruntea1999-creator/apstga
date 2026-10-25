import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS, parseSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await prisma.setting.findMany();
    return NextResponse.json(parseSettings(rows));
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const sections = Object.keys(DEFAULT_SETTINGS);
    const updates: Array<Promise<unknown>> = [];

    for (const section of sections) {
      const value = body?.[section];
      if (!value || typeof value !== "object") continue;
      updates.push(
        prisma.setting.upsert({
          where: { key: section },
          create: { key: section, value: JSON.stringify(value) },
          update: { value: JSON.stringify(value) },
        })
      );
    }
    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}