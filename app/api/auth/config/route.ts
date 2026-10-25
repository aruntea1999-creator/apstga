import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminConfig, updateAdminCredentials } from "@/lib/admin-config";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getAdminConfig();
  return NextResponse.json({ username: config.username });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, currentPassword, newPassword } = await req.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const config = getAdminConfig();
    const valid = config.password === currentPassword;
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    await updateAdminCredentials(username, newPassword);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update credentials" }, { status: 500 });
  }
}
