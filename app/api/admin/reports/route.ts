import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "custom";
  const year = parseInt(searchParams.get("year") || "2026");

  try {
    if (type === "district") {
      const groups = await prisma.grower.groupBy({
        by: ["districtId"],
        _count: true,
        _sum: { teaArea: true, annualProduction: true },
        orderBy: { _count: { districtId: "desc" } },
      });
      const districts = await prisma.district.findMany({ select: { id: true, name: true } });
      const names = new Map(districts.map((d) => [d.id, d.name]));
      const csv = toCsv([
        ["District", "Growers", "Tea Area (Ha)", "Annual Production (Kg)"],
        ...groups.map((g) => [
          names.get(g.districtId) || "Unknown",
          g._count,
          g._sum.teaArea || 0,
          g._sum.annualProduction || 0,
        ]),
      ]);
      return new Response(csv, { headers: csvHeaders("district-report") });
    }

    if (type === "monthly") {
      const groups = await prisma.grower.groupBy({
        by: ["registeredAt"],
        where: { registeredAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
        _count: true,
      });
      const buckets = Array.from({ length: 12 }, (_, i) => ({ month: MONTHS[i], growers: 0 }));
      for (const g of groups) buckets[g.registeredAt.getMonth()].growers += g._count;
      const csv = toCsv([
        ["Month", "New Growers", "Year"],
        ...buckets.map((b) => [b.month, b.growers, year]),
      ]);
      return new Response(csv, { headers: csvHeaders(`monthly-report-${year}`) });
    }

    if (type === "yearly") {
      const groups = await prisma.grower.groupBy({
        by: ["registeredAt"],
        _count: true,
      });
      const years = new Map<number, number>();
      for (const g of groups) {
        const y = g.registeredAt.getFullYear();
        years.set(y, (years.get(y) || 0) + g._count);
      }
      const csv = toCsv([
        ["Year", "New Growers"],
        ...[...years.entries()].sort((a, b) => a[0] - b[0]).map(([y, c]) => [y, c]),
      ]);
      return new Response(csv, { headers: csvHeaders("yearly-report") });
    }

    const growers = await prisma.grower.findMany({
      include: { district: { select: { name: true } }, village: { select: { name: true } } },
      orderBy: { registeredAt: "desc" },
    });
    const csv = toCsv([
      ["Membership ID", "Name", "District", "Village", "Mobile", "Tea Area (Ha)", "Annual Production (Kg)", "Status", "Registered"],
      ...growers.map((g) => [
        g.membershipId || "",
        g.name,
        g.district?.name || "",
        g.village?.name || "",
        g.mobile,
        g.teaArea || 0,
        g.annualProduction || 0,
        g.status,
        g.registeredAt.toLocaleDateString("en-IN"),
      ]),
    ]);
    return new Response(csv, { headers: csvHeaders("growers-report") });
  } catch (error) {
    console.error("Reports API error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate report" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function csvHeaders(filename: string) {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}.csv"`,
  };
}
