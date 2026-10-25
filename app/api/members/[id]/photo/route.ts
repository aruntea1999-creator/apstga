import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const member = await prisma.executiveMember.findUnique({
      where: { id },
      select: { photo: true, photoType: true },
    });

    if (!member?.photo) {
      return new Response("Not found", { status: 404 });
    }

    const bytes = member.photo instanceof Uint8Array ? member.photo : new Uint8Array(member.photo as ArrayBuffer);

    return new Response(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": member.photoType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
