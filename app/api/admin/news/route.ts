import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "article"
  );
}

function sanitize(body: any): { title: string; slug: string; content: string; excerpt?: string | null; image?: string | null; category?: string | null; published: boolean } | { error: string } {
  const title = String(body?.title || "").trim();
  const content = String(body?.content || "").trim();
  if (!title || !content) return { error: "Title and content are required." };
  const slug = String(body?.slug || "").trim() || slugify(title);
  return {
    title,
    slug,
    content,
    excerpt: body?.excerpt ? String(body.excerpt).trim() : null,
    image: body?.image ? String(body.image).trim() : null,
    category: body?.category ? String(body.category).trim() : null,
    published: Boolean(body?.published),
  };
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const items = await prisma.news.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const data: any = sanitize(body);
    if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });
    const item = await prisma.news.create({ data });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "A news item with this slug already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}