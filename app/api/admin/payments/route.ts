import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { collectedAt: "desc" },
      take: 50,
      include: { grower: { select: { name: true, membershipId: true } } },
    });
    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        growerId: p.growerId,
        growerName: p.grower.name,
        membershipId: p.grower.membershipId,
        amount: p.amount,
        method: p.method,
        date: p.collectedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const growerId = String(body?.growerId || "");
    const amount = parseFloat(body?.amount);
    const method = String(body?.method || "Cash");
    if (!growerId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Grower and a valid amount are required." }, { status: 400 });
    }
    const payment = await prisma.payment.create({
      data: {
        growerId,
        amount,
        method,
        collectedAt: body?.collectedAt ? new Date(body.collectedAt) : new Date(),
      },
      include: { grower: { select: { name: true, membershipId: true } } },
    });
    return NextResponse.json(
      {
        payment: {
          id: payment.id,
          growerId: payment.growerId,
          growerName: payment.grower.name,
          membershipId: payment.grower.membershipId,
          amount: payment.amount,
          method: payment.method,
          date: payment.collectedAt,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}