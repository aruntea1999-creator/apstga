import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const members = await prisma.executiveMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        designation: true,
        sortOrder: true,
        active: true,
        photoType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation,
        sortOrder: m.sortOrder,
        active: m.active,
        hasPhoto: Boolean(m.photoType),
        photoUrl: m.photoType ? `/api/members/${m.id}/photo` : null,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  const name = String(fd.get("name") || "").trim();
  const designation = String(fd.get("designation") || "").trim();
  const sortOrderRaw = String(fd.get("sortOrder") || "").trim();
  const photo = fd.get("photo");

  if (!name) return NextResponse.json({ error: "Member name is required." }, { status: 400 });
  if (!designation) return NextResponse.json({ error: "Designation is required." }, { status: 400 });
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "A member photo is required." }, { status: 400 });
  }
  if (!photo.type.startsWith("image/")) {
    return NextResponse.json({ error: "The photo must be an image file (JPG, PNG, WebP)." }, { status: 400 });
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "The photo must be smaller than 5 MB." }, { status: 400 });
  }

  const sortOrder = Number.isFinite(Number(sortOrderRaw)) ? Math.trunc(Number(sortOrderRaw)) : 0;

  try {
    const member = await prisma.executiveMember.create({
      data: {
        name,
        designation,
        sortOrder,
        photo: new Uint8Array(await photo.arrayBuffer()),
        photoType: photo.type || "image/jpeg",
        active: true,
      },
    });

    return NextResponse.json(
      {
        member: {
          id: member.id,
          name: member.name,
          designation: member.designation,
          sortOrder: member.sortOrder,
          active: member.active,
          hasPhoto: true,
          photoUrl: `/api/members/${member.id}/photo`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create member error:", error);
    return NextResponse.json({ error: "Failed to add member." }, { status: 500 });
  }
}
