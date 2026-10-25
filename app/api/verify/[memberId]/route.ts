import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { membershipExpiry, isMembershipActive } from "@/lib/id-card";

export const dynamic = "force-dynamic";

const NOT_A_VALID_MEMBER = "NOT A VALID MEMBER";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId: rawMemberId } = await params;
    const memberId = decodeURIComponent(rawMemberId || "").trim();
    if (!memberId) {
      return NextResponse.json({ error: NOT_A_VALID_MEMBER }, { status: 404 });
    }

    let grower = await prisma.grower.findUnique({
      where: { membershipId: memberId },
      include: { district: true },
    });

    // QR readers and manual entry can change case; member IDs are uppercase.
    if (!grower && memberId !== memberId.toUpperCase()) {
      grower = await prisma.grower.findUnique({
        where: { membershipId: memberId.toUpperCase() },
        include: { district: true },
      });
    }

    // Pending and rejected/cancelled memberships are not valid members.
    if (!grower || grower.status !== "APPROVED") {
      return NextResponse.json({ error: NOT_A_VALID_MEMBER }, { status: 404 });
    }

    return NextResponse.json({
      name: grower.name,
      membershipId: grower.membershipId,
      district: grower.district.name,
      status: isMembershipActive(grower) ? "ACTIVE" : "EXPIRED",
      validUntil: membershipExpiry(grower).toISOString(),
    });
  } catch {
    return NextResponse.json({ error: NOT_A_VALID_MEMBER }, { status: 500 });
  }
}
