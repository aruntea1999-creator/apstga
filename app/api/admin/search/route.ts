import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const [growers, districts] = await Promise.all([
      prisma.grower.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q } },
          ],
        },
        include: { district: { select: { name: true } }, village: { select: { name: true } } },
        take: 10,
        orderBy: { registeredAt: "desc" },
      }),
      prisma.district.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      results: [
        ...growers.map((g) => ({
          type: "grower" as const,
          id: g.id,
          label: g.name,
          sublabel: `${g.district.name} — ${g.village.name}`,
        })),
        ...districts.map((d) => ({
          type: "district" as const,
          id: d.id,
          label: d.name,
          sublabel: "District",
        })),
      ],
    });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
