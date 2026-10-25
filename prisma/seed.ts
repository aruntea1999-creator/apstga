import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const districts = await Promise.all([
    prisma.district.create({ data: { name: "Tawang", code: "TAW" } }),
    prisma.district.create({ data: { name: "West Kameng", code: "WKA" } }),
    prisma.district.create({ data: { name: "East Kameng", code: "EKA" } }),
    prisma.district.create({ data: { name: "Papum Pare", code: "PPA" } }),
    prisma.district.create({ data: { name: "Kurung Kumey", code: "KKU" } }),
    prisma.district.create({ data: { name: "Kra Daadi", code: "KDA" } }),
    prisma.district.create({ data: { name: "Lower Subansiri", code: "LSU" } }),
    prisma.district.create({ data: { name: "Upper Subansiri", code: "USU" } }),
    prisma.district.create({ data: { name: "West Siang", code: "WSI" } }),
    prisma.district.create({ data: { name: "East Siang", code: "ESI" } }),
    prisma.district.create({ data: { name: "Upper Siang", code: "USI" } }),
    prisma.district.create({ data: { name: "Dibang Valley", code: "DIB" } }),
    prisma.district.create({ data: { name: "Lower Dibang Valley", code: "LDI" } }),
    prisma.district.create({ data: { name: "Lohit", code: "LOH" } }),
    prisma.district.create({ data: { name: "Anjaw", code: "ANJ" } }),
    prisma.district.create({ data: { name: "Changlang", code: "CHA" } }),
    prisma.district.create({ data: { name: "Tirap", code: "TIR" } }),
    prisma.district.create({ data: { name: "Longding", code: "LON" } }),
    prisma.district.create({ data: { name: "Namsai", code: "NAM" } }),
    prisma.district.create({ data: { name: "Shi Yomi", code: "SHI" } }),
    prisma.district.create({ data: { name: "Siang", code: "SIA" } }),
    prisma.district.create({ data: { name: "Kamle", code: "KAM" } }),
    prisma.district.create({ data: { name: "Pakke Kessang", code: "PKE" } }),
    prisma.district.create({ data: { name: "Lepa Rada", code: "LRA" } }),
    prisma.district.create({ data: { name: "Lower Siang", code: "LSI" } }),
    prisma.district.create({ data: { name: "Keyi Panyor", code: "KPA" } }),
    prisma.district.create({ data: { name: "Bichom", code: "BIC" } }),
  ]);

  const villages = await Promise.all(
    districts.flatMap((d) =>
      ["Town", "Central", "North", "South"].map((s, i) =>
        prisma.village.create({ data: { name: `${d.name} ${s}`, districtId: d.id } })
      )
    )
  );

  const getVillage = (districtIdx: number, offset = 0) =>
    villages[districtIdx * 4 + (offset % 4)];

  const growerNames = [
    "Rajiv Taying", "Minli Ete", "Tage Tatin", "Jumde Yomcha", "Kaling Borang",
    "Tabi Riba", "Yomde Perme", "Tanyang Bagra", "Jumtum Saring", "Bamang Pertin",
    "Tatung Jamoh", "Karya Ering", "Talom Rukbo", "Mibang Tatin", "Moyong Dai",
    "Kargu Kino", "Padam Tayeng", "Jarkar Gamlin", "Kipa Kiba", "Nyori Ete",
    "Ratan Tata", "Takam Tado", "Gamli Padu", "Tame Bagra", "Ojing Tasing",
    "Yorbe Lego", "Kwangtung Mihu", "Tawang Mihu", "Sorang Mihu", "Dadu Mihu",
    "Takam Takar", "Tajo Mihu", "Kago Mihu", "Tatsung Mihu", "Tani Mihu",
  ];

  const growers = await Promise.all(
    growerNames.map((name, i) => {
      const status = i < 20 ? "APPROVED" : i < 28 ? "PENDING" : "REJECTED";
      const dIdx = i % districts.length;
      const v = getVillage(dIdx, i);
      const daysAgo = i * 2 + Math.floor(Math.random() * 3);
      const registeredAt = new Date(2026, 0, 1);
      registeredAt.setDate(registeredAt.getDate() + daysAgo);
      return prisma.grower.create({
        data: {
          membershipId: `APSTGA${String(i + 1).padStart(4, "0")}`,
          name,
          fatherName: `Father of ${name}`,
          gender: i % 5 === 0 ? "Female" : "Male",
          dob: new Date(1970 + (i % 35), i % 12, (i % 28) + 1),
          mobile: `+91 9${String(40000000 + i * 12345).slice(0, 10)}`,
          email: name.toLowerCase().replace(/\s/g, ".") + "@gmail.com",
          districtId: districts[dIdx].id,
          circle: "Circle " + ((i % 5) + 1),
          villageId: v.id,
          address: `${v.name}, ${districts[dIdx].name}, Arunachal Pradesh`,
          aadhaar: String(100000000000 + i * 1111).slice(0, 12),
          teaGardenName: `${name}'s Tea Garden`,
          teaArea: 0.5 + (i % 10) * 0.3,
          annualProduction: 100 + (i % 20) * 50,
          organicStatus: i % 3 === 0 ? "ORGANIC" : "CONVENTIONAL",
          teaVariety: ["ASSAM", "CHINESE", "CLONAL", "MIXED"][i % 4] as any,
          status: status as any,
          registeredAt,
          documents: i % 2 === 0 ? "/uploads/docs/sample.pdf" : null,
        },
      });
    })
  );

  await Promise.all(
    districts.map((d, idx) => {
      const districtGrowers = growers.filter((g) => g.districtId === d.id);
      return prisma.statistic.create({
        data: {
          districtId: d.id,
          year: 2026,
          totalGrowers: districtGrowers.length,
          teaArea: districtGrowers.reduce((s, g) => s + g.teaArea, 0),
          greenLeafProduction: districtGrowers.reduce((s, g) => s + g.annualProduction, 0),
          organicGrowers: districtGrowers.filter((g) => g.organicStatus === "ORGANIC").length,
        },
      });
    })
  );

  await Promise.all(
    districts.flatMap((d) =>
      [1, 2, 3, 4, 5, 6].flatMap((month) => {
        const baseProduction = 50 + Math.floor(Math.random() * 150);
        return prisma.productionRecord.create({
          data: {
            districtId: d.id,
            year: 2026,
            month,
            quantityMt: baseProduction,
            areaHa: 10 + Math.floor(Math.random() * 50),
          },
        });
      })
    )
  );

  await Promise.all(
    growers.slice(0, 20).flatMap((g) =>
      [1, 2, 3].map((idx) =>
        prisma.payment.create({
          data: {
            growerId: g.id,
            amount: 500 + Math.floor(Math.random() * 3000),
            method: ["UPI", "Card", "Net Banking", "Cash"][Math.floor(Math.random() * 4)],
            collectedAt: new Date(2026, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
          },
        })
      )
    )
  );

  await prisma.notification.createMany({
    data: [
      { type: "user_plus", title: "New grower registered", description: "Longding District — Rajiv Taying", relatedGrowerId: growers[0]?.id },
      { type: "credit_card", title: "Payment received", description: "₹2,500 — Membership Fee", relatedGrowerId: growers[1]?.id },
      { type: "file_text", title: "Documents uploaded", description: "Aadhaar & Bank Passbook", relatedGrowerId: growers[2]?.id },
      { type: "map_pin", title: "District updated", description: "West Siang statistics refreshed" },
      { type: "user_plus", title: "New grower registered", description: "Tirap District — Minli Ete", relatedGrowerId: growers[3]?.id },
    ],
  });

  await prisma.event.createMany({
    data: [
      { title: "General Meeting", date: new Date(2026, 7, 15), location: "Conference Hall, Pasighat", category: "Meeting" },
      { title: "Grower Training", date: new Date(2026, 7, 20), location: "Training Center, Doimukh", category: "Training" },
      { title: "Annual Conference", date: new Date(2026, 9, 12), location: "APSTGA HQ, Itanagar", category: "Event" },
      { title: "Board Meeting", date: new Date(2026, 10, 5), location: "Board Room, Naharlagun", category: "Meeting" },
    ],
  });

  console.log("Seed complete:");
  console.log(`  ${districts.length} districts`);
  console.log(`  ${growers.length} growers`);
  console.log(`  Production records created`);
  console.log(`  Payment records created`);
  console.log(`  Notifications created`);
  console.log(`  Events created`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
