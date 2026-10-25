import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/marketplace";

export async function GET() {
  try {
    const products = getActiveProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
