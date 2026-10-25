// lib/idcard.ts
// Types, validation, formatting and QR helpers for the APSTGA membership ID card.

import QRCode from 'qrcode';

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export type GrowerCardData = {
  memberId: string;            // e.g. APSTGA000002
  fullName: string;
  dob: string;                 // ISO date, e.g. 1995-09-09
  address: string;
  district: string;
  photoUrl: string | null;     // grower photo from the registration form
  gardenName: string;
  areaHa: number;              // hectares, from the form
  gardenLocation: string;
  plantationYear: number | string;
  validUntil: string;          // ISO date, e.g. 2031-12-31
  status: MembershipStatus;
};

// Static assets live in /public. CHANGE THESE to the real file names in your /public folder.
export type CardAssets = {
  logo: string;                // e.g. /logo.png
  signature: string | null;    // e.g. /signature.png (transparent PNG). null => blank line
  leaf?: string | null;        // optional tea-leaf image for header top-right, e.g. /tea-leaf.png
};

export const DEFAULT_ASSETS: CardAssets = {
  logo: '/logo.png',
  signature: '/signature.png',
  leaf: '/tea-leaf.png',
};

export type CardContact = { phone: string; email: string; location: string };

// Better: load these from Website Settings. Defaults are what the current card shows.
export const DEFAULT_CONTACT: CardContact = {
  phone: '+91 60024 53543',
  email: 'aruntea1999@gmail.com',
  location: 'Itanagar, Arunachal Pradesh',
};

export const ASSOC = {
  stateLine: 'ARUNACHAL PRADESH',
  name: "SMALL TEA GROWERS' ASSOCIATION",
  reg: 'SR/ITA/617',
  short: 'APSTGA',
  tagline1: 'Empowering Small Tea Growers.',
  tagline2: 'Building A Stronger Arunachal.',
  signatoryLine: 'APSTGA, Itanagar (A.P.)',
};

export const CARD_NOTES = [
  'This ID card is issued based on the information submitted by the registered grower.',
  'The card holder has accepted the declaration form submitted during registration.',
  'In case of loss, immediately contact APSTGA Office.',
  'Misuse of this card may result in cancellation of membership.',
];

export const CARD_W = 540; // design px (10 px = 1 mm) -> 54 mm
export const CARD_H = 856; // design px -> 85.6 mm

/* ---------- helpers ---------- */

export const HA_TO_ACRES = 2.471;

export function acres(ha: number) {
  return (ha * HA_TO_ACRES).toFixed(2);
}

export function fmtHa(ha: number) {
  const h = Number.isInteger(ha) ? String(ha) : ha.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${h} Ha (${acres(ha)} Acres)`;
}

export function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

export function fmtLongDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Shrinks the font for long text so nothing overflows.
export function fit(text: string, base: number, min: number, maxChars: number) {
  const len = (text || '').length;
  if (len <= maxChars) return base;
  return Math.max(min, Math.round((base * maxChars) / len));
}

export function effectiveStatus(status: MembershipStatus, validUntil: string): MembershipStatus {
  if (status === 'CANCELLED' || status === 'SUSPENDED') return status;
  const end = new Date(validUntil);
  if (!isNaN(end.getTime())) {
    end.setUTCHours(23, 59, 59, 999);
    if (end.getTime() < Date.now()) return 'EXPIRED';
  }
  return status;
}

export function validateGrower(d: Partial<GrowerCardData>): string[] {
  const errors: string[] = [];
  if (!d.fullName?.trim()) errors.push('Full name is missing');
  if (!d.memberId?.trim()) errors.push('Member ID is missing');
  if (!d.photoUrl) errors.push('Grower photo is missing');
  if (!d.dob || isNaN(new Date(d.dob).getTime())) errors.push('Date of birth is missing or invalid');
  if (!d.address?.trim()) errors.push('Address is missing');
  if (!d.district?.trim()) errors.push('District is missing');
  if (!d.gardenName?.trim()) errors.push('Garden name is missing');
  if (!d.areaHa || Number(d.areaHa) <= 0) errors.push('Tea garden area is missing');
  if (!d.gardenLocation?.trim()) errors.push('Garden location is missing');
  if (!d.plantationYear) errors.push('Plantation year is missing');
  if (!d.validUntil || isNaN(new Date(d.validUntil).getTime())) errors.push('Membership valid-until date is missing');
  return errors;
}

/* ---------- QR ---------- */

export const MEMBER_ID_RE = /^APSTGA\d{6}$/;

export function verifyUrl(siteUrl: string, memberId: string) {
  const base = siteUrl.replace(/\/+$/, '');
  return `${base}/verify/${encodeURIComponent(memberId)}`;
}

export async function makeQr(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,          // quiet zone
    width: 600,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

// Converts the photo to a data URL so PDF/PNG export never hits a CORS-tainted canvas.
export async function toDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
  if (!res.ok) throw new Error(`Photo fetch failed (${res.status})`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
