import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/marketplace";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const products = getProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const price = formData.get("price") as string;
      const badge = formData.get("badge") as string || null;
      const badgeColor = formData.get("badgeColor") as string || "";
      const active = formData.get("active") === "true";
      const file = formData.get("image") as File | null;

      let image = "/logo/logo.png";
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `product-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const dir = path.join(process.cwd(), "public", "uploads", "marketplace");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, filename), buffer);
        image = `/uploads/marketplace/${filename}`;
      }

      const product = createProduct({ name, description, price, badge, badgeColor, image, active });
      return NextResponse.json(product, { status: 201 });
    }

    const body = await req.json();
    const product = createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const id = formData.get("id") as string;
      if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const price = formData.get("price") as string;
      const badge = formData.get("badge") as string || null;
      const badgeColor = formData.get("badgeColor") as string || "";
      const active = formData.get("active") === "true";
      const file = formData.get("image") as File | null;

      const existing = getProduct(id);
      if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      let image = existing.image;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `product-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const dir = path.join(process.cwd(), "public", "uploads", "marketplace");
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, filename), buffer);
        image = `/uploads/marketplace/${filename}`;
      }

      const product = updateProduct(id, { name, description, price, badge, badgeColor, image, active });
      return NextResponse.json(product);
    }

    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const product = updateProduct(id, data);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const ok = deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
