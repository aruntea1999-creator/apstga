import type { SiteSettings } from "@/lib/use-settings";

export interface AcknowledgementApplication {
  applicationNo: string;
  submittedAt: Date;
  fullName: string;
  fatherName: string;
  aadhaar: string;
  mobile: string;
  email: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  pinCode: string;
  gardenName: string;
  gardenVillage: string;
  gardenDistrict: string;
  teaArea: string;
  teaVariety: string;
  cultivationType: string;
}

const GREEN = [11, 74, 46] as const;
const GOLD = [184, 134, 11] as const;
const INK = [31, 41, 55] as const;
const MUTED = [85, 95, 110] as const;
const LINE = [205, 211, 219] as const;
const WASH = [245, 247, 245] as const;

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function ascii(value: string | null | undefined): string {
  return clean(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u20B9/g, "Rs.");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function maskAadhaar(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "XXXX XXXX XXXX";
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch("/logo/logo.png", { cache: "force-cache" });
    if (!response.ok) return null;
    const dataUrl = await blobToDataUrl(await response.blob());
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

    // Keep the PDF small while retaining enough resolution for print.
    const target = 420;
    const scale = Math.min(1, target / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function createAcknowledgementLetter(
  application: AcknowledgementApplication,
  settings: SiteSettings
): Promise<{ blob: Blob; filename: string }> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  const dateText = formatDate(application.submittedAt);

  const address = [application.village, application.postOffice && `PO ${application.postOffice}`, application.policeStation && `PS ${application.policeStation}`, application.district, application.pinCode && `PIN ${application.pinCode}`]
    .filter(Boolean)
    .map(ascii)
    .join(", ");
  const gardenLocation = [application.gardenVillage, application.gardenDistrict]
    .filter(Boolean)
    .map(ascii)
    .join(", ");
  const contactLine = [
    application.mobile && `Mobile: ${ascii(application.mobile)}`,
    application.email && `Email: ${ascii(application.email)}`,
  ]
    .filter(Boolean)
    .join("   |   ");

  const legacyRegistrationNo = (
    settings.general as typeof settings.general & { registrationNumber?: string }
  ).registrationNumber;
  const registrationNo =
    ascii(settings.general.registrationTitle) || ascii(legacyRegistrationNo) || "SR/ITA/617";
  const associationAddress = ascii(settings.contact.address);
  const associationPhone = ascii(settings.contact.phone);
  const associationEmail = ascii(settings.contact.email);

  // Top rule
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 2.6, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 2.6, pageW, 0.7, "F");

  // Official logo
  const logo = await loadLogo();
  if (logo) {
    doc.addImage(logo, "PNG", margin, 13.5, 26, 26);
  } else {
    doc.setFillColor(...GREEN);
    doc.circle(margin + 13, 26.5, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("APSTGA", margin + 13, 28, { align: "center" });
  }

  // Association heading
  const headingX = margin + 30;
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ARUNACHAL PRADESH", headingX, 21.5);
  doc.text("SMALL TEA GROWERS ASSOCIATION", headingX, 27.5);

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.7);
  doc.text(associationAddress, headingX, 33.5);
  doc.text(`Phone: ${associationPhone}   |   Email: ${associationEmail}`, headingX, 38);
  doc.text(`Reg. No.: ${registrationNo}`, headingX, 42.5);

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(margin, 47, pageW - margin, 47);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.line(margin, 48.1, pageW - margin, 48.1);

  // Reference and date
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.text(`Ref. No.: APSTGA/ACK/${application.submittedAt.getFullYear()}/${ascii(application.applicationNo) || "APPLICATION"}`, margin, 55);
  doc.text(`Date: ${dateText}`, pageW - margin, 55, { align: "right" });

  // Title
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ACKNOWLEDGEMENT OF REGISTRATION APPLICATION", pageW / 2, 66, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setCharSpace(0.55);
  doc.text("SMALL TEA GROWER MEMBERSHIP", pageW / 2, 71.5, { align: "center" });
  doc.setCharSpace(0);

  // Recipient
  let y = 81;
  doc.setTextColor(...INK);
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.text("To,", margin, y);

  y += 5.5;
  doc.setFontSize(10.5);
  doc.text(ascii(application.fullName), margin, y);

  y += 5.5;
  doc.setFont("times", "normal");
  doc.setFontSize(8.8);
  doc.text(`Father's / Husband's Name: ${ascii(application.fatherName)}`, margin, y);

  y += 5.2;
  const addressLines = doc.splitTextToSize(address, 125) as string[];
  addressLines.slice(0, 2).forEach((line, index) => doc.text(line, margin, y + index * 4.2));

  y += Math.min(addressLines.length, 2) * 4.2 + 0.8;
  if (contactLine) {
    doc.setTextColor(...MUTED);
    doc.text(contactLine, margin, y);
    doc.setTextColor(...INK);
  }

  // Subject and salutation
  y += 7;
  doc.setFont("times", "bold");
  doc.setFontSize(9.8);
  doc.text("Subject: Acknowledgement of application for Small Tea Grower registration", margin, y);

  y += 6.5;
  doc.setFont("times", "normal");
  doc.setFontSize(9.2);
  doc.text("Dear Sir/Madam,", margin, y);

  // Opening paragraph
  y += 6;
  const opening = doc.splitTextToSize(
    "This is to acknowledge the receipt of your application for registration as a Small Tea Grower with the Arunachal Pradesh Small Tea Growers Association (APSTGA). Your application has been received and is presently under verification.",
    contentW
  ) as string[];
  doc.setFontSize(9);
  opening.forEach((line) => {
    doc.text(line, margin, y);
    y += 4.4;
  });

  y += 2.5;
  doc.setFont("times", "italic");
  doc.text("The particulars furnished in your application are recorded as under:", margin, y);
  doc.setFont("times", "normal");

  // Application details table
  y += 5.5;
  const headerH = 7.5;
  const rowH = 8.2;

  doc.setFillColor(...GREEN);
  doc.rect(margin, y, contentW, headerH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setCharSpace(0.35);
  doc.text("APPLICATION PARTICULARS", margin + 3, y + 5);
  doc.setCharSpace(0);
  y += headerH;

  type Cell = { label: string; value: string; labelW: number; valueW: number };
  type Row = Cell[];

  const rows: Row[] = [
    [
      { label: "Application No.", value: ascii(application.applicationNo) || "N/A", labelW: 36, valueW: 49 },
      { label: "Date of Submission", value: dateText, labelW: 38, valueW: 55 },
    ],
    [{ label: "Applicant Name", value: ascii(application.fullName), labelW: 36, valueW: 142 }],
    [{ label: "Father / Husband Name", value: ascii(application.fatherName), labelW: 36, valueW: 142 }],
    [
      { label: "Aadhaar Number", value: maskAadhaar(application.aadhaar), labelW: 36, valueW: 49 },
      { label: "Mobile Number", value: ascii(application.mobile), labelW: 38, valueW: 55 },
    ],
    [{ label: "Tea Garden / Estate", value: ascii(application.gardenName), labelW: 36, valueW: 142 }],
    [
      { label: "Garden Location", value: gardenLocation || "N/A", labelW: 36, valueW: 49 },
      { label: "Total Tea Area", value: application.teaArea ? `${ascii(application.teaArea)} hectares` : "N/A", labelW: 38, valueW: 55 },
    ],
    [
      { label: "Tea Variety", value: ascii(application.teaVariety) || "N/A", labelW: 36, valueW: 49 },
      { label: "Cultivation Type", value: ascii(application.cultivationType) || "N/A", labelW: 38, valueW: 55 },
    ],
    [{ label: "Application Status", value: "PENDING VERIFICATION", labelW: 36, valueW: 142 }],
  ];

  for (const row of rows) {
    let x = margin;
    for (const cell of row) {
      doc.setFillColor(...WASH);
      doc.rect(x, y, cell.labelW, rowH, "F");
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.rect(x, y, cell.labelW + cell.valueW, rowH, "S");
      doc.line(x + cell.labelW, y, x + cell.labelW, y + rowH);

      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.1);
      doc.text(cell.label, x + 2.5, y + 5.2);

      const isStatus = cell.label === "Application Status";
      doc.setTextColor(isStatus ? GREEN[0] : INK[0], isStatus ? GREEN[1] : INK[1], isStatus ? GREEN[2] : INK[2]);
      doc.setFont("helvetica", isStatus ? "bold" : "normal");
      doc.setFontSize(8.3);

      let value = cell.value;
      const maxValueW = cell.valueW - 5;
      if (doc.getTextWidth(value) > maxValueW) {
        while (value.length > 1 && doc.getTextWidth(`${value}...`) > maxValueW) {
          value = value.slice(0, -1);
        }
        value = `${value}...`;
      }
      doc.text(value, x + cell.labelW + 2.5, y + 5.2);

      x += cell.labelW + cell.valueW;
    }
    y += rowH;
  }

  // Bottom of table to page bottom needs to stay clear for the footer.
  if (y > 235) {
    // Defensive fallback for unexpectedly long values: keep the closing
    // content inside the page by tightening the remaining space.
    y = 235;
  }

  // Closing note
  y += 5.5;
  doc.setTextColor(...INK);
  doc.setFont("times", "normal");
  doc.setFontSize(8.8);
  const note = doc.splitTextToSize(
    `Your application will be verified within fifteen to twenty (15-20) working days. You may be contacted on your registered mobile number or email for clarification or field verification. Please quote the application number in all future correspondence. This acknowledgement is not a confirmation of membership; membership becomes effective only after approval by the Association. Please retain this letter for your records.`,
    contentW
  ) as string[];
  note.forEach((line) => {
    doc.text(line, margin, y);
    y += 4.25;
  });

  // Signature block
  const signatureY = Math.max(y + 8, 253);
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text("Yours faithfully,", margin, signatureY);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(margin, signatureY + 16, margin + 58, signatureY + 16);
  doc.setFont("times", "bold");
  doc.setFontSize(8.8);
  doc.text("Authorised Signatory", margin, signatureY + 21);
  doc.setFont("times", "normal");
  doc.setFontSize(7.8);
  doc.text("For Arunachal Pradesh Small Tea Growers Association", margin, signatureY + 25.2);

  // Footer
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(margin, 286, pageW - margin, 286);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text(
    `Arunachal Pradesh Small Tea Growers Association  |  ${associationAddress}`,
    pageW / 2,
    290,
    { align: "center" }
  );
  doc.text(
    `Phone: ${associationPhone}  |  Email: ${associationEmail}  |  Reg. No.: ${registrationNo}`,
    pageW / 2,
    294,
    { align: "center" }
  );

  const safeApplicationNo = (application.applicationNo || "Application").replace(/[^a-zA-Z0-9-_]/g, "");
  return {
    blob: doc.output("blob"),
    filename: `APSTGA-Acknowledgement-${safeApplicationNo}.pdf`,
  };
}
