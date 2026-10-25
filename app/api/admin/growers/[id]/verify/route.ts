import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { clearDashboardCache } from "@/lib/dashboard-cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    let action: "approve" | "reject" = "approve";
    try {
      const body = await request.json();
      if (body?.action === "reject") action = "reject";
    } catch {
      /* no body — treat as approve (backward compatible) */
    }
    const grower = await prisma.grower.update({
      where: { id },
      data: action === "approve" ? { status: "APPROVED", approvedAt: new Date() } : { status: "REJECTED" },
    });
    clearDashboardCache();

    // ID cards are generated client-side from the grower profile page
    // (components/idcard). No server-side rendering happens on approval.

    return NextResponse.json(grower);
  } catch {
    return NextResponse.json({ error: "Failed to verify grower" }, { status: 500 });
  }
}
