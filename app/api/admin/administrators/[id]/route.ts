import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await request.json();
    const update: any = {};
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.active !== undefined) update.active = Boolean(body.active);
    if (body.district !== undefined) update.district = body.district ? String(body.district).trim() : null;
    if (body.role !== undefined) {
      const role = String(body.role);
      if (!["SUPER_ADMIN", "DISTRICT_ADMIN", "OPERATOR", "VIEWER"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      update.role = role;
    }
    if (body.password) {
      if (String(body.password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
      update.password = bcrypt.hashSync(String(body.password), 10);
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    const user = await prisma.user.update({ where: { id }, data: update });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, district: user.district } });
  } catch {
    return NextResponse.json({ error: "Failed to update administrator" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete administrator" }, { status: 500 });
  }
}