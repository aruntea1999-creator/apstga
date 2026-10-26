import { NextResponse } from "next/server";
import { describeDatabaseError, prisma } from "@/lib/db";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body: ContactPayload =
    raw && typeof raw === "object" ? (raw as ContactPayload) : {};

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const phone = String(body.phone || "").trim() || null;

  if (!name) return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  if (!subject) return NextResponse.json({ error: "A subject is required." }, { status: 400 });
  if (!message || message.length < 10) return NextResponse.json({ error: "Your message must be at least 10 characters." }, { status: 400 });

  try {
    await prisma.contactMessage.create({ data: { name, email, phone, subject, message } });
    return NextResponse.json({ success: true, message: "Message sent successfully. We will get back to you soon." }, { status: 201 });
  } catch (error: unknown) {
    const dbError = describeDatabaseError(error);
    console.error("Contact POST failed:", dbError.code);
    return NextResponse.json(
      { error: dbError.message, code: dbError.code },
      { status: dbError.status },
    );
  }
}
