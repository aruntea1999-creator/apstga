import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const grower = await prisma.grower.findUnique({
      where: { id },
      include: {
        district: true,
        village: true,
        payments: true,
        attachments: { select: { id: true, type: true, name: true, mimeType: true, size: true, createdAt: true } },
      },
    });
    if (!grower) return NextResponse.json({ error: "Grower not found" }, { status: 404 });
    // Strip sensitive/bank fields from the public grower profile response
    const { bankName, bankBranch, accountNumber, ifscCode, aadhaar, pan, ...rest } = grower;
    return NextResponse.json(rest);
  } catch {
    return NextResponse.json({ error: "Failed to fetch grower" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const grower = await prisma.grower.update({ where: { id }, data: body });
    return NextResponse.json(grower);
  } catch {
    return NextResponse.json({ error: "Failed to update grower" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.grower.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete grower" }, { status: 500 });
  }
}
