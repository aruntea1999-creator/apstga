import { NextResponse } from "next/server";
import { describeDatabaseError, prisma } from "@/lib/db";

type NewsletterPayload = { email?: unknown };

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body: NewsletterPayload =
    raw && typeof raw === "object" ? (raw as NewsletterPayload) : {};
  const email = String(body.email || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (!existing) {
      await prisma.newsletter.create({ data: { email } });
    }
    return NextResponse.json({ success: true, message: "Subscribed successfully. Thank you!" });
  } catch (error: unknown) {
    const dbError = describeDatabaseError(error);
    if (dbError.code === "P2002") {
      return NextResponse.json({ success: true, message: "Subscribed successfully. Thank you!" });
    }
    console.error("Newsletter POST failed:", dbError.code);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status },
    );
  }
}
