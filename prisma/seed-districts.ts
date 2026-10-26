import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// District names must match lib/district-data.ts because that is what the
// registration form submits. prisma/seed.ts spells this one "Lepa Rada".
const districts = [
  { name: "Tawang", code: "TAW" },
  { name: "West Kameng", code: "WKA" },
  { name: "East Kameng", code: "EKA" },
  { name: "Papum Pare", code: "PPA" },
  { name: "Kurung Kumey", code: "KKU" },
  { name: "Kra Daadi", code: "KDA" },
  { name: "Lower Subansiri", code: "LSU" },
  { name: "Upper Subansiri", code: "USU" },
  { name: "West Siang", code: "WSI" },
  { name: "East Siang", code: "ESI" },
  { name: "Upper Siang", code: "USI" },
  { name: "Dibang Valley", code: "DIB" },
  { name: "Lower Dibang Valley", code: "LDI" },
  { name: "Lohit", code: "LOH" },
  { name: "Anjaw", code: "ANJ" },
  { name: "Changlang", code: "CHA" },
  { name: "Tirap", code: "TIR" },
  { name: "Longding", code: "LON" },
  { name: "Namsai", code: "NAM" },
  { name: "Shi Yomi", code: "SHI" },
  { name: "Siang", code: "SIA" },
  { name: "Kamle", code: "KAM" },
  { name: "Pakke Kessang", code: "PKE" },
  { name: "Leparada", code: "LRA" },
  { name: "Lower Siang", code: "LSI" },
  { name: "Keyi Panyor", code: "KPA" },
  { name: "Bichom", code: "BIC" },
] as const;

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return "unknown";
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    for (const district of districts) {
      await prisma.district.upsert({
        where: { name: district.name },
        update: { code: district.code },
        create: district,
      });
    }

    console.log(`Seeded ${districts.length} districts.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error && error.message === "DATABASE_URL is not set") {
    console.error("DATABASE_URL is not set.");
  } else {
    console.error("District seed failed:", errorCode(error));
  }
  process.exitCode = 1;
});
