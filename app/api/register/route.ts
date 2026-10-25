import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function read(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

function asFile(fd: FormData, name: string): File | null {
  const v = fd.get(name);
  return v instanceof File ? v : null;
}

function pickFile(f: File | null) {
  if (!f) return null;
  return { name: f.name, size: f.size, type: f.type };
}

const FILE_LIMIT = 5 * 1024 * 1024;
const DUPLICATE_AADHAAR_MESSAGE =
  "You are already registered. Search by your name or Aadhaar card number in the search box.";
const FILE_FIELDS = ["passportPhoto", "aadhaarCard"] as const;
type DocType = (typeof FILE_FIELDS)[number];
type CapturedFile = { name: string; mimeType: string; size: number; data: Uint8Array<ArrayBuffer> };

async function captureFiles(fd: FormData): Promise<{ files: Partial<Record<DocType, CapturedFile>>; error?: string }> {
  const files: Partial<Record<DocType, CapturedFile>> = {};
  for (const key of FILE_FIELDS) {
    const f = fd.get(key);
    if (!(f instanceof File)) continue;
    if (f.size > FILE_LIMIT) {
      return { files, error: `${f.name} is larger than 5 MB. Please upload a smaller file.` };
    }
    files[key] = {
      name: f.name,
      mimeType: f.type || "application/octet-stream",
      size: f.size,
      data: new Uint8Array(await f.arrayBuffer()),
    };
  }
  return { files };
}

function mapOrganic(v: string): "ORGANIC" | "CONVENTIONAL" {
  return v.toLowerCase().startsWith("organic") ? "ORGANIC" : "CONVENTIONAL";
}

function mapVariety(v: string): "ASSAM" | "CHINESE" | "CLONAL" | "MIXED" {
  const s = v.toLowerCase();
  if (s.includes("assam")) return "ASSAM";
  if (s.includes("chinese")) return "CHINESE";
  if (s.includes("clonal") || s.includes("clone")) return "CLONAL";
  return "MIXED";
}

async function nextMembershipId(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const count = await prisma.grower.count({ where: { membershipId: { startsWith: "APSTGA" } } });
    const candidate = `APSTGA${String(count + 1).padStart(6, "0")}`;
    const exists = await prisma.grower.findUnique({ where: { membershipId: candidate } });
    if (!exists) return candidate;
  }
  return `APSTGA${Date.now().toString().slice(-6)}`;
}

async function resolveVillage(districtId: string, blockName: string, villageName: string): Promise<string> {
  const name = (blockName || villageName).trim();
  const existing = await prisma.village.findFirst({
    where: { districtId, name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const created = await prisma.village.create({ data: { districtId, name } });
  return created.id;
}

export async function POST(request: Request) {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  const required: Array<[string, string]> = [
    ["fullName", "Full Name"],
    ["fathersName", "Father's / Husband's Name"],
    ["gender", "Gender"],
    ["dateOfBirth", "Date of Birth"],
    ["mobile", "Mobile Number"],
    ["aadhaar", "Aadhaar Number"],
    ["district", "District"],
    ["circle", "Circle / Block"],
    ["village", "Village"],
    ["postOffice", "Post Office"],
    ["policeStation", "Police Station"],
    ["pinCode", "PIN Code"],
    ["estateName", "Estate / Garden Name"],
    ["teaDistrict", "Tea District"],
    ["teaVillage", "Tea Village"],
    ["totalArea", "Total Area"],
    ["teaVariety", "Tea Variety"],
    ["yearStarted", "Year Started"],
    ["annualProduction", "Annual Production"],
    ["organicConventional", "Type"],
  ];

  const missing = required.filter(([k]) => !read(fd, k));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: missing.length === 1 ? `Missing required field: ${missing[0][1]}` : `Missing required fields: ${missing.map(([, l]) => l).join(", ")}` },
      { status: 400 }
    );
  }

  const mobile = read(fd, "mobile").replace(/\s/g, "");
  if (!/^\d{10}$/.test(mobile)) return NextResponse.json({ error: "A valid 10-digit mobile number is required." }, { status: 400 });

  const pin = read(fd, "pinCode").replace(/\s/g, "");
  if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: "A valid 6-digit PIN code is required." }, { status: 400 });

  const aadhaar = read(fd, "aadhaar").replace(/[\s-]/g, "");
  if (!/^\d{12}$/.test(aadhaar)) return NextResponse.json({ error: "A valid 12-digit Aadhaar number is required." }, { status: 400 });

  const dob = new Date(read(fd, "dateOfBirth"));
  if (Number.isNaN(dob.getTime())) return NextResponse.json({ error: "A valid date of birth is required." }, { status: 400 });

  const email = read(fd, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });

  const existing = await prisma.grower.findUnique({ where: { aadhaar } });
  if (existing) {
    return NextResponse.json({ error: DUPLICATE_AADHAAR_MESSAGE }, { status: 409 });
  }

  const districtName = read(fd, "district");
  const district = await prisma.district.findFirst({
    where: { name: { equals: districtName, mode: "insensitive" } },
  });
  if (!district) return NextResponse.json({ error: `District "${districtName}" was not found.` }, { status: 400 });

  const villageId = await resolveVillage(district.id, read(fd, "circle"), read(fd, "village"));

  const address = [
    `${read(fd, "village")}, PO ${read(fd, "postOffice")}, PS ${read(fd, "policeStation")}, PIN ${pin}`,
    `Tea: ${read(fd, "teaVillage")}, ${read(fd, "teaDistrict")}`,
  ].join(" | ");

  const membershipId = await nextMembershipId();

  const captured = await captureFiles(fd);
  if (captured.error) {
    return NextResponse.json({ error: captured.error }, { status: 400 });
  }

  try {
    const created = await prisma.grower.create({
      data: {
        membershipId,
        name: read(fd, "fullName"),
        fatherName: read(fd, "fathersName"),
        gender: read(fd, "gender"),
        dob,
        mobile,
        email: email || null,
        districtId: district.id,
        circle: read(fd, "circle"),
        villageId,
        address,
        aadhaar,
        teaGardenName: read(fd, "estateName"),
        teaArea: parseFloat(read(fd, "totalArea")) || 0,
        plantationYear: parseInt(read(fd, "yearStarted"), 10) || 0,
        annualProduction: parseFloat(read(fd, "annualProduction")) || 0,
        organicStatus: mapOrganic(read(fd, "organicConventional")),
        teaVariety: mapVariety(read(fd, "teaVariety")),
        bankName: read(fd, "bankName") || null,
        bankBranch: read(fd, "bankBranch") || null,
        accountNumber: read(fd, "accountNumber") || null,
        ifscCode: read(fd, "ifsc") || null,
        documents: JSON.stringify({
          passportPhoto: pickFile(asFile(fd, "passportPhoto")),
          aadhaarCard: pickFile(asFile(fd, "aadhaarCard")),
        }),
        status: "PENDING",
      },
    });

    const entries = Object.entries(captured.files);
    if (entries.length > 0) {
      await prisma.growerDocument.createMany({
        data: entries.map(([type, f]) => ({
          growerId: created.id,
          type,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          data: f.data,
        })),
      });
    }

    return NextResponse.json(
      { success: true, applicationNo: membershipId, message: "Registration submitted successfully" },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: DUPLICATE_AADHAAR_MESSAGE }, { status: 409 });
    }
    console.error("Register API error:", e);
    return NextResponse.json({ error: "Failed to submit registration. Please try again." }, { status: 500 });
  }
}