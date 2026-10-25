import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const { id, docId } = await params;
    const doc = await prisma.growerDocument.findFirst({ where: { id: docId, growerId: id } });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const filename = doc.name.replace(/["\r\n]/g, "_");
    return new NextResponse(new Uint8Array(doc.data), {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Length": String(doc.data.byteLength),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}
