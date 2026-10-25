// lib/idcard-data.ts
// ADAPTER: the only file that knows your database. Edit the two functions below to match your tables.
// Field names on the right-hand side of each mapping are GUESSES. Rename them to your real columns.
// Nothing else in the kit touches the database.

import type { GrowerCardData, MembershipStatus } from './idcard';

/* ---- 1. Full record for the admin card (server side, admin only) ---- */

export function mapGrowerRow(r: any): GrowerCardData {
  return {
    memberId: r.member_id ?? r.memberId,
    fullName: r.full_name ?? r.name,
    dob: r.dob ?? r.date_of_birth,
    address: r.address,
    district: r.district,
    photoUrl: r.photo_url ?? r.photo ?? null,        // photo uploaded in the registration form
    gardenName: r.garden_name,
    areaHa: Number(r.garden_area_ha ?? r.tea_garden_area),
    gardenLocation: r.garden_location,
    plantationYear: r.plantation_year,
    validUntil: r.membership_valid_until ?? r.valid_until,
    status: (r.membership_status ?? 'ACTIVE') as MembershipStatus,
  };
}

/* ---- 2. Public lookup for /verify/[memberId] (NO private data) ---- */

export type PublicMember = {
  memberId: string;
  fullName: string;
  district: string;
  validUntil: string;
  status: MembershipStatus;
};

export async function getPublicMember(memberId: string): Promise<PublicMember | null> {
  // EXAMPLE (Supabase). Use a server-side client with the service role key, or an RLS-safe view.
  //
  // import { createClient } from '@supabase/supabase-js';
  // const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  // const { data } = await sb
  //   .from('growers')
  //   .select('member_id, full_name, district, membership_valid_until, membership_status, registration_status')
  //   .eq('member_id', memberId)
  //   .eq('registration_status', 'APPROVED')
  //   .maybeSingle();
  //
  // EXAMPLE (Prisma):
  // const data = await prisma.grower.findFirst({ where: { memberId, registrationStatus: 'APPROVED' },
  //   select: { memberId: true, fullName: true, district: true, validUntil: true, membershipStatus: true } });
  //
  // if (!data) return null;
  // return { memberId: data.member_id, fullName: data.full_name, district: data.district,
  //          validUntil: data.membership_valid_until, status: data.membership_status };

  throw new Error('getPublicMember is not connected yet. Edit lib/idcard-data.ts');
}
