import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = session?.user?.role as string | undefined;
    const ADMIN_ROLES = ["SUPER_ADMIN", "DISTRICT_ADMIN", "OPERATOR", "VIEWER"];
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const grower = await prisma.grower.findUnique({
      where: { id },
      select: { aadhaar: true, pan: true },
    });
    if (!grower) return NextResponse.json({ error: "Grower not found" }, { status: 404 });

    // Never log sensitive values
    return NextResponse.json({ aadhaar: grower.aadhaar ?? null, pan: grower.pan ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sensitive data" }, { status: 500 });
  }
}
