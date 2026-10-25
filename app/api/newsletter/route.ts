import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (!existing) {
    await prisma.newsletter.create({ data: { email } });
  }

  return NextResponse.json({ success: true, message: "Subscribed successfully. Thank you!" });
}