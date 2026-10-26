import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-guard";

const ROLES = ["SUPER_ADMIN", "DISTRICT_ADMIN", "OPERATOR", "VIEWER"] as const;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        district: u.district,
        createdAt: u.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load administrators" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const role = ROLES.includes(body?.role) ? body.role : "VIEWER";
    const password = String(body?.password || "");

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const hash = password ? bcrypt.hashSync(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hash,
        active: body?.active !== false,
        district: body?.district ? String(body.district).trim() : null,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          district: user.district,
        },
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create administrator" },
      { status: 500 },
    );
  }
}
