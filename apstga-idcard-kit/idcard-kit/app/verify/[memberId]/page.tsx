// app/verify/[memberId]/page.tsx
// PUBLIC page (no login). Shows only name, member ID, district, status and validity.
// Make sure middleware does not protect /verify.

import { notFound } from 'next/navigation';
import { getPublicMember } from '@/lib/idcard-data';
import { MEMBER_ID_RE, effectiveStatus, fmtLongDate } from '@/lib/idcard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify Membership | APSTGA', robots: { index: false, follow: false } };

export default async function VerifyPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId: raw } = await params;
  const memberId = decodeURIComponent(raw).trim().toUpperCase();

  const member = MEMBER_ID_RE.test(memberId) ? await getPublicMember(memberId) : null;
  if (!member && !MEMBER_ID_RE.test(memberId)) return <Shell><Invalid /></Shell>;
  if (!member) return <Shell><Invalid /></Shell>;

  const status = effectiveStatus(member.status, member.validUntil);
  if (status === 'CANCELLED') return <Shell><Invalid /></Shell>;

  const ok = status === 'ACTIVE';
  const label = { ACTIVE: 'Active Member', EXPIRED: 'Membership Expired', SUSPENDED: 'Membership Suspended', CANCELLED: '' }[status];

  return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...badge, background: ok ? '#e3f4e8' : '#fdecea', color: ok ? '#0a5a2e' : '#a32020' }}>
          {ok ? '✓ ' : '! '}{label}
        </div>
        <h1 style={{ fontSize: 28, margin: '18px 0 4px', color: '#063d20' }}>{member.fullName}</h1>
        <p style={{ margin: 0, color: '#555' }}>Registered Grower</p>
      </div>
      <dl style={grid}>
        <dt>Member ID</dt><dd>{member.memberId}</dd>
        <dt>District</dt><dd>{member.district}</dd>
        <dt>Valid until</dt><dd>{fmtLongDate(member.validUntil)}</dd>
      </dl>
    </Shell>
  );
}

function Invalid() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...badge, background: '#fdecea', color: '#a32020' }}>✕ Not a valid member</div>
      <p style={{ color: '#555', marginTop: 16 }}>No active membership was found for this ID.</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#eef5e9,#fff)', display: 'grid', placeItems: 'center', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ background: '#0a5a2e', color: '#fff', padding: '18px 20px', textAlign: 'center', borderBottom: '4px solid #c9a227' }}>
          <div style={{ fontWeight: 700, letterSpacing: 1 }}>ARUNACHAL PRADESH</div>
          <div style={{ fontSize: 13, letterSpacing: 1 }}>SMALL TEA GROWERS’ ASSOCIATION</div>
          <div style={{ fontSize: 12, color: '#f2d46b', marginTop: 4 }}>SR/ITA/617</div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#777', padding: '0 16px 16px' }}>Membership verification, APSTGA</div>
      </div>
    </main>
  );
}

const badge: React.CSSProperties = { display: 'inline-block', padding: '8px 16px', borderRadius: 999, fontWeight: 700 };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 10, marginTop: 24, fontSize: 16 };
