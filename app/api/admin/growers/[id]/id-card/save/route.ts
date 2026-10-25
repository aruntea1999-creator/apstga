import { NextResponse } from "next/server";
import { mkdir, readdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const DATA_URL_RE = /^data:(image\/png|application\/pdf);base64,([A-Za-z0-9+/=]+)$/;
const LABELS: Record<string, string> = { pngFront: "FRONT", pngBack: "BACK", pdf: "CARD" };

function cardDir() {
  return path.join(process.cwd(), "public", "uploads", "id-cards");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const grower = await prisma.grower.findUnique({ where: { id }, select: { membershipId: true } });
    if (!grower) return NextResponse.json({ error: "Grower not found" }, { status: 404 });
    const files = (await readdir(cardDir()).catch(() => []))
      .filter((f) => f.startsWith(`${grower.membershipId}-`) && (f.endsWith(".png") || f.endsWith(".pdf")))
      .sort()
      .reverse()
      .map((name) => ({ name, url: `/uploads/id-cards/${name}` }));
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to list saved files" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const grower = await prisma.grower.findUnique({ where: { id }, select: { membershipId: true } });
    if (!grower) return NextResponse.json({ error: "Grower not found" }, { status: 404 });

    const body = await request.json();
    const dir = cardDir();
    await mkdir(dir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const files: { name: string; url: string }[] = [];

    for (const key of Object.keys(LABELS)) {
      const dataUrl = typeof body[key] === "string" ? (body[key] as string) : undefined;
      if (!dataUrl) continue;
      const m = DATA_URL_RE.exec(dataUrl);
      if (!m) return NextResponse.json({ error: `Invalid ${key} data URL` }, { status: 400 });
      const ext = m[1] === "application/pdf" ? "pdf" : "png";
      const name = `${grower.membershipId}-${stamp}-${LABELS[key]}.${ext}`;
      await writeFile(path.join(dir, name), Buffer.from(m[2], "base64"));
      files.push({ name, url: `/uploads/id-cards/${name}` });
    }

    if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to save ID card files" }, { status: 500 });
  }
}
