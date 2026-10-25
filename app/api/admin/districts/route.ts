import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: "asc" },
      include: { villages: { orderBy: { name: "asc" } } },
    });
    return NextResponse.json(districts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
