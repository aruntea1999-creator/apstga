import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["SUPER_ADMIN", "DISTRICT_ADMIN", "OPERATOR", "VIEWER"];

export async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function isSuperAdmin(role?: string | null) {
  return role === "SUPER_ADMIN";
}