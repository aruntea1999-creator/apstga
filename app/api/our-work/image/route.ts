import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchImageBytes } from "@/lib/our-work";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  let url = searchParams.get("u");
  if (!id && !url) return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
  if (url && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Invalid url" }, { status: 400 });

  try {
    if (id) {
      const item = await prisma.ourWork.findUnique({ where: { id }, select: { imageData: true, imageType: true, image: true } });
      if (item?.imageData) {
        const data = new Uint8Array(Buffer.from(item.imageData));
        return new NextResponse(data, {
          headers: {
            "Content-Type": item.imageType || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      url = item?.image || url;
    }
    if (!url) return NextResponse.json({ error: "No image available" }, { status: 404 });
    const image = await fetchImageBytes(url);
    if (!image) return NextResponse.json({ error: "Failed to load image" }, { status: 502 });
    return new NextResponse(image.data, {
      headers: {
        "Content-Type": image.type,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load image" }, { status: 502 });
  }
}
