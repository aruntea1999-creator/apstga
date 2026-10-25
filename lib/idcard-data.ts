// lib/idcard-data.ts
// ADAPTER: the only file that knows this website's data shape. It maps the
// /api/admin/growers/[id] response (raw Prisma grower JSON) to the card's
// GrowerCardData. Nothing else in the card kit touches the database.
// Source: apstga-idcard-kit/idcard-kit/lib/idcard-data.ts (rewritten for this site).

import type { GrowerCardData, MembershipStatus } from './idcard';
import { membershipExpiry } from '@/lib/id-card';

export const DEFAULT_LOCATION = 'Itanagar, Arunachal Pradesh';

/** Shape of the /api/admin/growers/[id] JSON this adapter reads. */
export type GrowerJson = {
  membershipId?: string | null;
  name?: string | null;
  dob?: string | Date | null;
  address?: string | null;
  photo?: string | null;
  teaGardenName?: string | null;
  teaArea?: number | string | null;
  plantationYear?: number | string | null;
  status?: string | null;
  approvedAt?: string | Date | null;
  registeredAt?: string | Date | null;
  district?: { name?: string | null } | null;
  village?: { name?: string | null } | null;
  attachments?: Array<{ id?: string; type?: string } | null>;
};

function text(value: string | Date | null | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '').trim();
}

/** Public URL for a grower's passport photo, resolved exactly like the old
 *  server renderer: the `photo` field first, then the passportPhoto document. */
export function growerPhotoUrl(growerId: string, json: GrowerJson | null | undefined): string | null {
  const photo = typeof json?.photo === 'string' ? json.photo.trim() : '';
  if (photo) return photo;
  const doc = Array.isArray(json?.attachments)
    ? json.attachments.find((a) => a?.type === 'passportPhoto' && a?.id)
    : null;
  return doc ? `/api/admin/growers/${growerId}/documents/${doc.id}` : null;
}

function toMembershipStatus(status: string | null | undefined): MembershipStatus {
  if (status === 'APPROVED') return 'ACTIVE';
  if (status === 'REJECTED') return 'CANCELLED';
  return 'SUSPENDED';
}

export function toCardData(growerId: string, json: GrowerJson): GrowerCardData {
  const village = String(json.village?.name ?? '').trim();
  const district = String(json.district?.name ?? '').trim();
  const gardenLocation = [village, district].filter(Boolean).join(', ') || DEFAULT_LOCATION;

  // The old card showed only the first line of a multi-part address.
  const addressFirst = String(json.address ?? '').split(' | ')[0].trim();
  const address = addressFirst || gardenLocation;

  return {
    memberId: String(json.membershipId ?? ''),
    fullName: String(json.name ?? ''),
    dob: text(json.dob),
    address,
    district,
    photoUrl: growerPhotoUrl(growerId, json),
    gardenName: String(json.teaGardenName ?? ''),
    areaHa: typeof json.teaArea === 'number' ? json.teaArea : parseFloat(json.teaArea || '0') || 0,
    gardenLocation,
    plantationYear: json.plantationYear ?? '',
    validUntil:
      json.approvedAt || json.registeredAt
        ? membershipExpiry({ approvedAt: json.approvedAt, registeredAt: json.registeredAt }).toISOString()
        : '',
    status: toMembershipStatus(json.status),
  };
}
