import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const APPROVED = { status: "APPROVED" as const };

export async function GET() {
  try {
    const [totalGrowers, areaAgg, productionAgg, statusGroups, districtGroups, areaGroups, monthGroups, events, newsItems] =
      await Promise.all([
        prisma.grower.count({ where: APPROVED }),
        prisma.grower.aggregate({ where: APPROVED, _sum: { teaArea: true } }),
        prisma.grower.aggregate({ where: APPROVED, _sum: { annualProduction: true } }),
        prisma.grower.groupBy({ where: APPROVED, by: ["organicStatus"], _count: { _all: true } }),
        prisma.grower.groupBy({ where: APPROVED, by: ["districtId"], _count: { _all: true } }),
        prisma.grower.groupBy({ where: APPROVED, by: ["districtId"], _sum: { teaArea: true } }),
        prisma.productionRecord.groupBy({ by: ["month"], _sum: { quantityMt: true } }),
        prisma.event.findMany({ orderBy: { date: "desc" }, take: 3, select: { title: true, date: true } }),
        prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3, select: { title: true, createdAt: true, category: true } }),
      ]);

    const districts = await prisma.district.findMany({ select: { id: true, name: true } });
    const districtMap = new Map(districts.map((d) => [d.id, d.name]));

    const growersByDistrict = districtGroups
      .map((g) => ({ name: districtMap.get(g.districtId) ?? "Other", value: g._count._all }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const areaByDistrict = areaGroups
      .map((g) => ({ name: districtMap.get(g.districtId) ?? "Other", area: g._sum.teaArea ?? 0 }))
      .sort((a, b) => b.area - a.area)
      .slice(0, 6);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthSum = new Map(monthGroups.map((g) => [g.month, g._sum.quantityMt ?? 0]));
    const monthlyProduction = months.map((month, i) => ({ month, prod: monthSum.get(i + 1) ?? 0 }));

    const organicCount = statusGroups.find((g) => g.organicStatus === "ORGANIC")?._count._all ?? 0;
    const conventionalCount =
      statusGroups.filter((g) => g.organicStatus !== "ORGANIC").reduce((s, g) => s + g._count._all, 0) ?? 0;

    const noticeList = [
      ...events.map((e) => ({ title: e.title, date: e.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), tag: "Event" })),
      ...newsItems.map((n) => ({ title: n.title, date: n.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), tag: n.category || "News" })),
    ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);

    return NextResponse.json({
      totalGrowers,
      teaArea: areaAgg._sum.teaArea ?? 0,
      annualProduction: productionAgg._sum.annualProduction ?? 0,
      organicGrowers: organicCount,
      conventionalGrowers: conventionalCount,
      growersByDistrict,
      areaByDistrict,
      monthlyProduction,
      notices: noticeList,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load statistics" }, { status: 500 });
  }
}
