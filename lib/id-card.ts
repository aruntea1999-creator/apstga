export interface IdCardMember {
  id: string;
  membershipId: string;
  name: string;
  fatherName: string;
  gender: string;
  dob: string;
  mobile: string;
  email?: string | null;
  photo?: string | null;
  address: string;
  district: string;
  village: string;
  teaGardenName: string;
  teaArea: number;
  plantationYear?: number | null;
  annualProduction: number;
  organicStatus: string;
  teaVariety: string;
  status: string;
  registeredAt: string;
  approvedAt?: string | null;
}

export const CARD_W = "54mm";
export const CARD_H = "85.6mm";
export const MEMBERSHIP_YEARS = 4;

const DEFAULT_SITE_URL = "https://apstga.org";

/**
 * Public origin used inside QR codes. The QR must never point at localhost,
 * even when the card is generated from a development machine.
 */
export function siteBaseUrl(): string {
  const raw = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_SITE_URL;
    if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)) return DEFAULT_SITE_URL;
    return url.origin.replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function membershipExpiry(member: { approvedAt?: Date | string | null; registeredAt?: Date | string | null }): Date {
  const base = member.approvedAt ?? member.registeredAt ?? new Date();
  const d = new Date(base);
  // Membership runs through the last moment of 31 December.
  return new Date(Date.UTC(d.getUTCFullYear() + MEMBERSHIP_YEARS, 11, 31, 23, 59, 59, 999));
}

export function isMembershipActive(member: { status?: string | null } & { approvedAt?: Date | string | null; registeredAt?: Date | string | null }): boolean {
  return member.status === "APPROVED" && membershipExpiry(member).getTime() >= Date.now();
}

export function formatDate(d: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const x = new Date(d);
  return `${String(x.getUTCDate()).padStart(2, "0")}/${String(x.getUTCMonth() + 1).padStart(2, "0")}/${x.getUTCFullYear()}`;
}

export function verificationUrl(membershipId: string): string {
  return `${siteBaseUrl()}/verify/${encodeURIComponent(membershipId)}`;
}

export function buildQrPayload(member: IdCardMember): string {
  return [
    "APSTGA MEMBERSHIP CARD",
    `ID: ${member.membershipId}`,
    `Name: ${member.name}`,
    `Phone: ${member.mobile}`,
    `Garden: ${member.teaGardenName}`,
    `Registered: ${formatShortDate(member.registeredAt)}`,
    `Verify: ${verificationUrl(member.membershipId)}`,
  ].join("\n");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
