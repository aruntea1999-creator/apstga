import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";
import { GrowerStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  ORGANIC: "Organic",
  CONVENTIONAL: "Conventional",
};

const VARIETY_LABELS: Record<string, string> = {
  ASSAM: "Assam",
  CHINESE: "Chinese",
  CLONAL: "Clonal",
  MIXED: "Mixed",
};

type GrowerRow = {
  membershipId: string;
  name: string;
  teaGardenName: string;
  teaArea: number;
  organicStatus: string;
  teaVariety: string;
  plantationYear: number | null;
  village: string;
  district: string;
};

async function loadGrowers(districtId?: string): Promise<GrowerRow[]> {
  const where: Prisma.GrowerWhereInput = { status: "APPROVED" as GrowerStatus };
  if (districtId) where.districtId = districtId;
  const growers = await prisma.grower.findMany({
    where,
    orderBy: [{ district: { name: "asc" } }, { membershipId: "asc" }],
    select: {
      membershipId: true,
      name: true,
      teaGardenName: true,
      teaArea: true,
      organicStatus: true,
      teaVariety: true,
      plantationYear: true,
      district: { select: { name: true } },
      village: { select: { name: true } },
    },
  });

  return growers.map((g) => ({
    membershipId: g.membershipId,
    name: g.name,
    teaGardenName: g.teaGardenName ?? "",
    teaArea: g.teaArea ?? 0,
    organicStatus: TYPE_LABELS[g.organicStatus] ?? String(g.organicStatus),
    teaVariety: VARIETY_LABELS[g.teaVariety] ?? String(g.teaVariety),
    plantationYear: g.plantationYear,
    village: g.village?.name ?? "",
    district: g.district?.name ?? "",
  }));
}

function stamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(): string {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

async function buildWorkbook(rows: GrowerRow[], districtName?: string): Promise<Uint8Array> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "APSTGA";
  wb.created = new Date();

  const ws = wb.addWorksheet("Growers", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const headers = [
    "Sl. No.",
    "Membership ID",
    "Grower Name",
    "Tea Garden",
    "Village",
    "District",
    "Tea Area (Ha)",
    "Tea Variety",
    "Type",
    "Plantation Year",
  ];

  const lastCol = String.fromCharCode(64 + headers.length); // J

  ws.mergeCells(`A1:${lastCol}1`);
  const title = ws.getCell("A1");
  title.value = "APSTGA Growers Directory";
  title.font = { bold: true, size: 16, color: { argb: "FF0B4A2E" } };
  title.alignment = { vertical: "middle" };
  ws.getRow(1).height = 26;

  ws.mergeCells(`A2:${lastCol}2`);
  const subtitle = ws.getCell("A2");
  subtitle.value = districtName
    ? `Arunachal Pradesh Small Tea Growers Association — ${districtName} District (${rows.length}) · Generated on ${prettyDate()}`
    : `Arunachal Pradesh Small Tea Growers Association — Approved growers (${rows.length}) · Generated on ${prettyDate()}`;
  subtitle.font = { size: 9, color: { argb: "FF6B7280" } };

  ws.getRow(3).height = 6;

  const headerRow = ws.getRow(4);
  headerRow.values = headers;
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B4A2E" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF0B4A2E" } },
      left: { style: "thin", color: { argb: "FF0B4A2E" } },
      bottom: { style: "thin", color: { argb: "FF0B4A2E" } },
      right: { style: "thin", color: { argb: "FF0B4A2E" } },
    };
  });

  rows.forEach((g, i) => {
    const row = ws.addRow([
      i + 1,
      g.membershipId,
      g.name,
      g.teaGardenName,
      g.village,
      g.district,
      g.teaArea,
      g.teaVariety,
      g.organicStatus,
      g.plantationYear ?? "",
    ]);
    row.height = 18;
    row.eachCell((cell, col) => {
      cell.font = { size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: col === 1 || col === 7 || col === 10 ? "center" : "left",
      };
      cell.border = {
        top: { style: "hair", color: { argb: "FFE5E7EB" } },
        left: { style: "hair", color: { argb: "FFE5E7EB" } },
        bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
        right: { style: "hair", color: { argb: "FFE5E7EB" } },
      };
      if (i % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F9F5" } };
      }
    });
  });

  const widths = [7, 16, 26, 26, 18, 18, 13, 14, 14, 15];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  if (rows.length > 0) {
    ws.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: headers.length },
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

function buildPdf(rows: GrowerRow[]): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const tableW = pageW - margin * 2;

  const cols: { header: string; width: number; align?: "left" | "center" | "right" }[] = [
    { header: "Sl.", width: 10, align: "center" },
    { header: "Membership ID", width: 30 },
    { header: "Grower Name", width: 46 },
    { header: "Tea Garden", width: 48 },
    { header: "Village", width: 32 },
    { header: "District", width: 32 },
    { header: "Area (Ha)", width: 18, align: "right" },
    { header: "Variety", width: 28 },
    { header: "Type", width: 29 },
  ];

  const headerHeight = 8;
  let y = 0;

  const drawTitle = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(11, 74, 46);
    doc.text("APSTGA Growers Directory", margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Arunachal Pradesh Small Tea Growers Association — Approved growers", margin, 20.5);

    doc.text(`Generated on ${prettyDate()}`, pageW - margin, 15, { align: "right" });
    doc.text(`Total growers: ${rows.length}`, pageW - margin, 20.5, { align: "right" });
  };

  const drawHeader = () => {
    doc.setFillColor(11, 74, 46);
    doc.rect(margin, y, tableW, headerHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    let x = margin;
    cols.forEach((c) => {
      const tx = c.align === "center" ? x + c.width / 2 : c.align === "right" ? x + c.width - 2 : x + 2;
      doc.text(c.header, tx, y + 5, { align: c.align === "center" ? "center" : c.align === "right" ? "right" : "left" });
      x += c.width;
    });
    y += headerHeight;
  };

  const drawFooters = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text("APSTGA · Growers Directory", margin, pageH - 6);
      doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 6, { align: "right" });
    }
  };

  drawTitle();
  y = 27;
  drawHeader();

  const lineH = 3.6;
  const padY = 2.2;

  rows.forEach((g, index) => {
    const values = [
      String(index + 1),
      g.membershipId,
      g.name,
      g.teaGardenName,
      g.village,
      g.district,
      g.teaArea.toLocaleString("en-IN"),
      g.teaVariety,
      g.organicStatus,
    ];

    const cells = values.map((value, i) => doc.splitTextToSize(value || "—", cols[i].width - 4) as string[]);
    const lines = Math.min(2, Math.max(...cells.map((c) => c.length)));
    const rowH = Math.max(7, lines * lineH + padY * 2);

    if (y + rowH > pageH - 12) {
      doc.addPage();
      drawTitle();
      y = 27;
      drawHeader();
    }

    if (index % 2 === 1) {
      doc.setFillColor(244, 249, 245);
      doc.rect(margin, y, tableW, rowH, "F");
    }

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.15);
    doc.line(margin, y + rowH, margin + tableW, y + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(31, 41, 55);

    let x = margin;
    cols.forEach((c, i) => {
      const tx = c.align === "center" ? x + c.width / 2 : c.align === "right" ? x + c.width - 2 : x + 2;
      const linesText = cells[i].slice(0, 2);
      linesText.forEach((line, li) => {
        doc.text(line, tx, y + padY + lineH * (li + 0.8), {
          align: c.align === "center" ? "center" : c.align === "right" ? "right" : "left",
        });
      });
      x += c.width;
    });

    y += rowH;
  });

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("No approved growers yet.", margin, y + 10);
  }

  drawFooters();
  return new Uint8Array(doc.output("arraybuffer"));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "xlsx").toLowerCase();
  const districtId = searchParams.get("district") || undefined;

  try {
    const rows = await loadGrowers(districtId);

    if (format === "pdf") {
      return new Response(buildPdf(rows) as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="apstga-growers-${stamp()}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (format === "xlsx" || format === "excel") {
      let districtName: string | undefined;
      if (districtId) {
        const d = await prisma.district.findUnique({ where: { id: districtId }, select: { name: true } });
        districtName = d?.name;
      }
      const buffer = await buildWorkbook(rows, districtName);
      return new Response(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="apstga-growers-${districtId || "all"}-${stamp()}.xlsx"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return Response.json({ error: "Unsupported format. Use ?format=xlsx or ?format=pdf." }, { status: 400 });
  } catch (error) {
    console.error("Growers export error:", error);
    return Response.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
