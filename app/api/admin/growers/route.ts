import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const count = await prisma.grower.count();
    const membershipId = `APSTGA${String(count + 1).padStart(6, "0")}`;

    const grower = await prisma.grower.create({
      data: {
        membershipId,
        name: body.name,
        fatherName: body.fatherName,
        gender: body.gender,
        dob: new Date(body.dob),
        mobile: body.mobile,
        email: body.email || null,
        districtId: body.districtId,
        circle: body.circle,
        villageId: body.villageId,
        address: body.address,
        aadhaar: body.aadhaar,
        pan: body.pan || null,
        photo: body.photo || null,
        teaGardenName: body.teaGardenName,
        teaArea: parseFloat(body.teaArea),
        plantationYear: body.plantationYear ? parseInt(body.plantationYear) : null,
        annualProduction: body.annualProduction ? parseFloat(body.annualProduction) : 0,
        organicStatus: body.organicStatus || "CONVENTIONAL",
        teaVariety: body.teaVariety || "MIXED",
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        bankName: body.bankName || null,
        accountNumber: body.accountNumber || null,
        ifscCode: body.ifscCode || null,
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });
    return NextResponse.json(grower, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create grower" }, { status: 500 });
  }
}
