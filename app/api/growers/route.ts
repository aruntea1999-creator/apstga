import { NextResponse } from "next/server";
import { describeDatabaseError, prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const aadhaarQuery = q.replace(/[\s-]/g, "");
    const searchFilters = [
      { name: { contains: q, mode: "insensitive" as const } },
      { membershipId: { contains: q, mode: "insensitive" as const } },
      { teaGardenName: { contains: q, mode: "insensitive" as const } },
      ...(/^\d{12}$/.test(aadhaarQuery) ? [{ aadhaar: { equals: aadhaarQuery } }] : []),
    ];
    const where = {
      status: "APPROVED" as const,
      ...(q ? { OR: searchFilters } : {}),
    };

    const growers = await prisma.grower.findMany({
      where,
      orderBy: { membershipId: "asc" },
      take: 50,
      select: {
        id: true,
        membershipId: true,
        name: true,
        teaGardenName: true,
        teaArea: true,
        organicStatus: true,
        teaVariety: true,
        plantationYear: true,
        district: { select: { name: true } },
        village: { select: { name: true } },
      },
    });

    return NextResponse.json({
      growers: growers.map((g) => ({
        id: g.id,
        membershipId: g.membershipId,
        name: g.name,
        teaGardenName: g.teaGardenName,
        teaArea: g.teaArea,
        organicStatus: g.organicStatus,
        teaVariety: g.teaVariety,
        plantationYear: g.plantationYear,
        district: g.district?.name ?? "",
        village: g.village?.name ?? "",
      })),
    });
  } catch (error: unknown) {
    const dbError = describeDatabaseError(error);
    console.error("Growers GET failed:", dbError.code);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status },
    );
  }
}
