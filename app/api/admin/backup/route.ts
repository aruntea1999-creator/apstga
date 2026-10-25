import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const TABLE_COUNTS: Record<string, () => Promise<number>> = {
  Grower: () => prisma.grower.count(),
  District: () => prisma.district.count(),
  Village: () => prisma.village.count(),
  News: () => prisma.news.count(),
  Event: () => prisma.event.count(),
  Gallery: () => prisma.gallery.count(),
  Download: () => prisma.download.count(),
  Payment: () => prisma.payment.count(),
  Notification: () => prisma.notification.count(),
  ProductionRecord: () => prisma.productionRecord.count(),
  Newsletter: () => prisma.newsletter.count(),
  ContactMessage: () => prisma.contactMessage.count(),
  Setting: () => prisma.setting.count(),
  User: () => prisma.user.count(),
};

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const dbSizeRaw = await prisma.$queryRawUnsafe<{ size: string }[]>(
      "SELECT pg_size_pretty(pg_database_size(current_database())) AS size"
    );
    const databaseSize = dbSizeRaw[0]?.size ?? "—";

    const entries = await Promise.all(
      Object.entries(TABLE_COUNTS).map(async ([table, count]) => ({
        table,
        rows: await count(),
      }))
    );

    return NextResponse.json({
      databaseSize,
      lastBackup: null,
      storageNote: "Managed by the hosting provider",
      tables: entries,
      totalRows: entries.reduce((sum, e) => sum + e.rows, 0),
    });
  } catch (error) {
    console.error("Backup status API error:", error);
    return NextResponse.json({ error: "Failed to load backup status" }, { status: 500 });
  }
}
