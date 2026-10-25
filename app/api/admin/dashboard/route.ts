import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCachedDashboard, setCachedDashboard } from "@/lib/dashboard-cache";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const cacheKey = request.url;
  const cached = getCachedDashboard(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const currentYear = now.getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear));
    const districtId = searchParams.get("districtId") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const currentMonth = now.getMonth() + 1;

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const [
      growerCounts,
      districtList,
      pendingDocsGrowers,
      productionRecords,
      paymentAgg,
      paymentMethods,
      notifications,
      events,
    ] = await Promise.all([
      (async () => {
        const approved = { status: "APPROVED" as const };
        const total = prisma.grower.count({ where: approved });
        const prev = prisma.grower.count({
          where: { ...approved, registeredAt: { lt: new Date(currentYear, currentMonth - 1, 1), gte: new Date(prevMonthYear, prevMonth - 1, 1) } },
        });
        const pending = prisma.grower.count({ where: { status: "PENDING" } });
        const pendingPrev = prisma.grower.count({
          where: { status: "PENDING", registeredAt: { lt: new Date(currentYear, currentMonth - 1, 1), gte: new Date(prevMonthYear, prevMonth - 1, 1) } },
        });
        const districtsCovered = prisma.grower.groupBy({ where: approved, by: ["districtId"] }).then((r) => r.length);
        const growthRecords = prisma.grower.groupBy({
          by: ["registeredAt"],
          where: { ...approved, registeredAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
          _count: true,
        });
        const districtGroups = prisma.grower.groupBy({ where: approved, by: ["districtId"], _count: true });
        const mapGroups = prisma.grower.groupBy({ where: approved, by: ["districtId"], _count: true });
        const teaArea = prisma.grower.aggregate({ where: approved, _sum: { teaArea: true } });
        const teaAreaGroups = prisma.grower.groupBy({ where: approved, by: ["districtId"], _sum: { teaArea: true } });
        const totalProduction = prisma.grower.aggregate({ where: approved, _sum: { annualProduction: true } });
        const productionGroups = prisma.grower.groupBy({ where: approved, by: ["districtId"], _sum: { annualProduction: true } });

        const [t, pv, p, pp, dc, gr, dg, mg, teg, tag, tp, pg] = await Promise.all([
          total, prev, pending, pendingPrev, districtsCovered, growthRecords, districtGroups, mapGroups,
          teaArea, teaAreaGroups, totalProduction, productionGroups,
        ]);
        return {
          total: t, prev: pv, pending: p, pendingPrev: pp, districtsCovered: dc, growthRecords: gr, districtGroups: dg, mapGroups: mg,
          teaArea: teg._sum.teaArea || 0, areaGroups: tag, totalProduction: tp._sum.annualProduction || 0, productionGroups: pg,
        };
      })(),
      prisma.district.findMany({ orderBy: { name: "asc" } }),
      prisma.grower.findMany({
        where: { status: "PENDING" },
        include: { district: { select: { name: true } } },
        take: 4,
        orderBy: { registeredAt: "desc" },
      }),
      (async () => {
        const districtFilter = districtId !== "all" ? { districtId } : {};
        return prisma.productionRecord.groupBy({
          by: ["year"],
          where: { ...districtFilter, year: { gte: currentYear - 2 } },
          _sum: { quantityMt: true },
          orderBy: { year: "asc" },
        });
      })(),
      (async () => {
        const todayStart = new Date(currentYear, currentMonth - 1, now.getDate());
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const yearStart = new Date(currentYear, 0, 1);
        const [today, month, year] = await Promise.all([
          prisma.payment.aggregate({ _sum: { amount: true }, where: { collectedAt: { gte: todayStart } } }),
          prisma.payment.aggregate({ _sum: { amount: true }, where: { collectedAt: { gte: monthStart } } }),
          prisma.payment.aggregate({ _sum: { amount: true }, where: { collectedAt: { gte: yearStart } } }),
        ]);
        return { today: today._sum.amount || 0, month: month._sum.amount || 0, year: year._sum.amount || 0 };
      })(),
      prisma.payment.groupBy({ by: ["method"], _sum: { amount: true }, where: { collectedAt: { gte: new Date(currentYear, currentMonth - 1, 1) } } }),
      prisma.notification.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { grower: { select: { name: true } } } }),
      prisma.event.findMany({ where: { date: { gte: now } }, orderBy: { date: "asc" }, take: 4 }),
    ]);

    const growthMonths = Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      growers: 0,
    }));
    for (const r of growerCounts.growthRecords) {
      growthMonths[r.registeredAt.getMonth()].growers += r._count;
    }

    const distMap = new Map(districtList.map((d) => [d.id, d.name]));
    const districtChart = growerCounts.districtGroups
      .map((g) => ({ name: distMap.get(g.districtId) || "Unknown", growers: g._count }))
      .sort((a, b) => b.growers - a.growers)
      .slice(0, 6);

    const statMap = new Map(districtList.map((d) => [d.id, { name: d.name, areaHa: 0, production: 0 }]));

    const areaMap = new Map(growerCounts.areaGroups.map((g) => [g.districtId, g._sum.teaArea || 0]));
    const productionMap = new Map(growerCounts.productionGroups.map((g) => [g.districtId, g._sum.annualProduction || 0]));

    const mapData = growerCounts.mapGroups.map((g) => {
      const d = statMap.get(g.districtId);
      return {
        district: d?.name || "Unknown",
        growers: g._count,
        areaHa: areaMap.get(g.districtId) || 0,
        production: productionMap.get(g.districtId) || 0,
      };
    });

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }
    const [rows, totalRows] = await Promise.all([
      prisma.grower.findMany({
        where,
        include: { district: { select: { name: true } }, village: { select: { name: true } } },
        orderBy: { registeredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.grower.count({ where }),
    ]);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return "+100%";
      const pct = ((current - previous) / previous) * 100;
      return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    const body = {
      kpi: {
        registeredGrowers: { value: growerCounts.total, trend: calcTrend(growerCounts.total, growerCounts.prev) },
        districtsCovered: { value: growerCounts.districtsCovered },
        pendingRegistrations: { value: growerCounts.pending, trend: calcTrend(growerCounts.pending, growerCounts.pendingPrev) },
        totalTeaArea: { value: growerCounts.teaArea, trend: "+0%" },
        totalProduction: { value: growerCounts.totalProduction, trend: "+0%" },
      },
      growthChart: growthMonths,
      districtChart,
      productionChart: productionRecords.map((r) => ({ year: String(r.year), production: r._sum.quantityMt || 0 })),
      recentRegistrations: {
        rows: rows.map((r) => ({
          id: r.id,
          name: r.name,
          district: r.district.name,
          village: r.village.name,
          phone: r.mobile,
          date: r.registeredAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: r.status,
        })),
        total: totalRows,
        page,
        limit,
      },
      pendingVerifications: pendingDocsGrowers.map((g) => ({
        id: g.id,
        name: g.name,
        district: g.district.name,
        registeredAt: g.registeredAt,
        verifications: [
          ...(g.documents ? [] : ["Document Verification"]),
          ...(g.status === "PENDING" ? ["Identity Verification"] : []),
        ],
      })),
      revenue: {
        today: Math.round(paymentAgg.today),
        month: Math.round(paymentAgg.month),
        year: Math.round(paymentAgg.year),
        methods: paymentMethods.map((m) => ({
          name: m.method,
          value: m._sum.amount || 0,
          pct: paymentAgg.month > 0 ? Math.round(((m._sum.amount || 0) / paymentAgg.month) * 100) : 0,
        })),
      },
      notifications: notifications.map((n) => ({
        type: n.type,
        title: n.title,
        detail: n.description || "",
        time: getRelativeTime(n.createdAt),
      })),
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date.toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" }),
        day: String(e.date.getDate()).padStart(2, "0"),
        month: e.date.toLocaleDateString("en-US", { month: "short" }),
        location: e.location || "",
        tag: e.category || "",
      })),
      mapData,
    };

    setCachedDashboard(cacheKey, body);
    return NextResponse.json(body);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}

function getRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}
