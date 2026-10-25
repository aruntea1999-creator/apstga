import { NextResponse } from "next/server";
import { GET_PUBLIC } from "@/lib/settings";

export async function GET() {
  return GET_PUBLIC();
}