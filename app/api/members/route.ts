import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.executiveMember.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        designation: true,
        sortOrder: true,
        photoType: true,
      },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation,
        sortOrder: m.sortOrder,
        photoUrl: m.photoType ? `/api/members/${m.id}/photo` : null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
  }
}
