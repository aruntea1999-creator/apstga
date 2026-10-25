// components/idcard/IdCard.tsx
// Front + back card faces. Pure presentational; every value comes from props.
// Design size is 540 x 856 px (= 54 x 85.6 mm at 10 px/mm). Export scales it up.

import React, { forwardRef } from 'react';
import './idcard.css';
import {
  ASSOC, CARD_NOTES, CardAssets, CardContact, GrowerCardData,
  fit, fmtDate, fmtHa, fmtLongDate,
} from '@/lib/idcard';

type FaceProps = {
  data: GrowerCardData;
  assets: CardAssets;
  contact: CardContact;
  qrDataUrl: string;      // generated QR (data URL)
  photoDataUrl: string;   // grower photo (data URL, CORS-safe)
};

const Leaf = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 58V30" stroke="#0b5a2e" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 32C14 32 6 20 6 8c16 0 26 8 26 24z" fill="#0b6b34" />
    <path d="M32 40c0-14 8-22 26-22 0 12-8 22-26 22z" fill="#2f9a4f" />
  </svg>
);

const Phone = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const Mail = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
  </svg>
);
const Pin = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const ContactStrip = ({ contact }: { contact: CardContact }) => (
  <div className="idc-contact">
    <span><Phone />{contact.phone}</span>
    <span><Mail />{contact.email}</span>
    <span><Pin />{contact.location}</span>
  </div>
);

const GoldWave = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 540 120" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 70 C 120 120, 300 20, 540 -10" fill="none" stroke="#c9a227" strokeWidth="5" />
  </svg>
);

/* ------------------------------ FRONT ------------------------------ */

export const CardFront = forwardRef<HTMLDivElement, FaceProps>(function CardFront(
  { data, assets, contact, qrDataUrl, photoDataUrl }, ref,
) {
  const nameSize = fit(data.fullName, 46, 26, 16);
  const addrSize = fit(data.address, 25, 17, 46);

  return (
    <div className="idc idc-front" ref={ref}>
      {/* header */}
      <div className="idc-header">
        {assets.leaf ? <img className="idc-leaf" src={assets.leaf} alt="" crossOrigin="anonymous" /> : null}
        <div className="idc-logo"><img src={assets.logo} alt="APSTGA logo" crossOrigin="anonymous" /></div>
        <div className="idc-head-text">
          <div className="idc-state">{ASSOC.stateLine}</div>
          <div className="idc-assoc">{ASSOC.name}</div>
          <div className="idc-reg">{ASSOC.reg.split('').join(' ')}</div>
        </div>
        <GoldWave className="idc-wave" />
      </div>

      {/* photo + QR */}
      <div className="idc-photo">
        <img src={photoDataUrl} alt={data.fullName} />
      </div>
      <div className="idc-qr-wrap">
        <div className="idc-qr"><img src={qrDataUrl} alt="Scan to verify membership" /></div>
        <div className="idc-qr-id">{data.memberId}</div>
        <div className="idc-qr-cap">Scan to verify</div>
      </div>

      {/* name */}
      <div className="idc-name" style={{ fontSize: nameSize }}>{data.fullName.toUpperCase()}</div>
      <div className="idc-pill">M E M B E R</div>

      {/* details */}
      <dl className="idc-details">
        <dt>Member ID</dt><dd>:&nbsp; {data.memberId}</dd>
        <dt>Date of Birth</dt><dd>:&nbsp; {fmtDate(data.dob)}</dd>
        <dt>Address</dt><dd className="idc-addr" style={{ fontSize: addrSize }}>:&nbsp; {data.address.toUpperCase()}</dd>
        <dt>District</dt><dd>:&nbsp; {data.district}, Arunachal Pradesh</dd>
      </dl>

      {/* signature + validity */}
      <div className="idc-sign">
        {assets.signature
          ? <img src={assets.signature} alt="Authorised signatory signature" crossOrigin="anonymous" />
          : <div className="idc-sign-blank" />}
        <div className="idc-sign-l1">Authorised Signatory</div>
        <div className="idc-sign-l2">{ASSOC.signatoryLine}</div>
      </div>
      <div className="idc-valid">
        <Leaf size={46} />
        <div className="idc-valid-t">Valid Grower</div>
        <div className="idc-valid-u">Valid until {fmtLongDate(data.validUntil)}</div>
      </div>

      <ContactStrip contact={contact} />
    </div>
  );
});

/* ------------------------------ BACK ------------------------------- */

export const CardBack = forwardRef<HTMLDivElement, Omit<FaceProps, 'qrDataUrl' | 'photoDataUrl'>>(function CardBack(
  { data, assets, contact }, ref,
) {
  const rows: [string, string][] = [
    ['Garden Name', data.gardenName.toUpperCase()],
    ['Tea Garden Area', fmtHa(Number(data.areaHa))],
    ['Garden Location', data.gardenLocation],
    ['Plantation Year', String(data.plantationYear)],
  ];
  return (
    <div className="idc idc-back" ref={ref}>
      <div className="idc-back-top">
        {assets.leaf ? <img className="idc-back-leaf" src={assets.leaf} alt="" crossOrigin="anonymous" /> : null}
        <div className="idc-back-short">{ASSOC.short}</div>
        <div className="idc-back-state">{ASSOC.stateLine}</div>
        <div className="idc-back-assoc">{ASSOC.name}</div>
        <div className="idc-back-reg"><i />{ASSOC.reg.split('').join(' ')}<i /></div>
        <div className="idc-tagline">{ASSOC.tagline1}<br />{ASSOC.tagline2}</div>
      </div>

      <div className="idc-panel idc-panel-details">
        <div className="idc-tab">GROWERS’ DETAILS</div>
        <div className="idc-panel-body">
          {rows.map(([k, v]) => (
            <div className="idc-row" key={k}>
              <span className="k">{k}</span>
              <span className="c">:</span>
              <span className="v" style={{ fontSize: fit(v, 25, 17, 24) }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="idc-panel idc-panel-info">
        <div className="idc-tab">IMPORTANT INFORMATION</div>
        <div className="idc-panel-body">
          {CARD_NOTES.map((n) => (
            <div className="idc-note" key={n}><Leaf size={26} /><span>{n}</span></div>
          ))}
        </div>
      </div>

      <div className="idc-back-foot">
        <div className="idc-back-foot-t1">{ASSOC.stateLine}</div>
        <div className="idc-back-foot-t2">{ASSOC.name}</div>
      </div>
      <ContactStrip contact={contact} />
    </div>
  );
});
