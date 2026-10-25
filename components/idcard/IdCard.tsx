// components/idcard/IdCard.tsx
// Front + back card faces. Pure presentational; every value comes from props.
// Fixed canvas 638 x 1011 px (CR80 portrait at 300 DPI).
// No position:absolute for text — CSS grid/flexbox only. No truncation.
// Source: rebuilt per layout spec.

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import './idcard.css';
import {
  ASSOC, CARD_NOTES, CardAssets, CardContact, GrowerCardData,
  fmtDate, fmtHa, fmtLongDate, fmtCardDate, useAutoFit,
} from '@/lib/idcard';

/* eslint-disable @next/next/no-img-element */

type FaceProps = {
  data: GrowerCardData;
  assets: CardAssets;
  contact: CardContact;
  qrDataUrl: string;
  photoDataUrl: string;
};

const Leaf = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 58V30" stroke="#0b5a2e" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 32C14 32 6 20 6 8c16 0 26 8 26 24z" fill="#0b6b34" />
    <path d="M32 40c0-14 8-22 26-4z" fill="#0b6b34" />
  </svg>
);

const ContactStrip = ({ contact }: { contact: CardContact }) => (
  <div className="idc-contact">
    <div className="idc-contact-row">
      <span className="idc-contact-item">
        <svg className="idc-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        {contact.phone}
      </span>
      <span className="idc-contact-item">
        <svg className="idc-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        {contact.email}
      </span>
      <span className="idc-contact-item">
        <svg className="idc-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        {contact.location}
      </span>
    </div>
  </div>
);

const shouldShow = (v: string | undefined | null) => v != null && String(v).trim() !== '';

export const CardFront = forwardRef<HTMLDivElement, FaceProps>(function CardFront(
  { data, assets, contact, qrDataUrl, photoDataUrl }, ref,
) {
  const nameRef = useRef<HTMLDivElement>(null);
  const nameSize = useAutoFit(nameRef, 40, 30);

  const stateRef = useRef<HTMLDivElement>(null);
  const assocRef = useRef<HTMLDivElement>(null);

  // Auto-fit header titles: measure scrollWidth vs clientWidth, reduce font size until fits
  useEffect(() => {
    const adjustFont = () => {
      if (!stateRef.current || !assocRef.current) return;

      // Line 1: ARUNACHAL PRADESH
      let size1 = 30;
      const el1 = stateRef.current;
      el1.style.fontSize = size1 + 'px';
      while (el1.scrollWidth > el1.clientWidth && size1 > 18) {
        size1 -= 1;
        el1.style.fontSize = size1 + 'px';
      }

      // Line 2: SMALL TEA GROWERS' ASSOCIATION
      let size2 = 26;
      const el2 = assocRef.current;
      el2.style.fontSize = size2 + 'px';
      while (el2.scrollWidth > el2.clientWidth && size2 > 18) {
        size2 -= 1;
        el2.style.fontSize = size2 + 'px';
      }

      // Fallback: if line 2 still too wide at 18px, allow wrap
      if (size2 <= 18 && el2.scrollWidth > el2.clientWidth) {
        el2.style.whiteSpace = 'normal';
      }
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        adjustFont();
        requestAnimationFrame(adjustFont);
      });
    } else {
      adjustFont();
      requestAnimationFrame(adjustFont);
    }
  }, []);

  return (
    <div className="idc idc-front" ref={ref}>
      {/* Decorative leaf — absolute only, behind content */}
      <div className="idc-decor">
        {assets.leaf ? <img className="idc-leaf-decor" src={assets.leaf} alt="" crossOrigin="anonymous" /> : null}
      </div>

      {/* ============ HEADER (fixed 190px) ============ */}
      <header className="idc-front-header">
        <div className="idc-front-header-row">
          <div className="idc-front-logo">
            <img src={assets.logo} alt="APSTGA logo" crossOrigin="anonymous" />
          </div>
          <div className="idc-front-head-text">
            <div className="idc-front-state" ref={stateRef}>
              {ASSOC.stateLine}
            </div>
            <div className="idc-front-assoc" ref={assocRef}>
              {ASSOC.name}
            </div>
            <div className="idc-front-reg">Regd. No.: {ASSOC.reg}</div>
          </div>
        </div>
      </header>

      {/* ============ BODY (flex:1) ============ */}
      <div className="idc-front-body">
        {/* Photo + QR row — 24px gap below header */}
        <div className="idc-front-photo-qr">
          <div className="idc-front-photo">
            <img src={photoDataUrl} alt={data.fullName ?? ''} />
          </div>
          <div className="idc-front-qr">
            <div className="idc-front-qr-box">
              <img src={qrDataUrl} alt="Scan to verify membership" />
              <div className="idc-front-qr-cap">Scan to verify</div>
            </div>
          </div>
        </div>

        {/* Member name */}
        <div className="idc-front-name" ref={nameRef} style={{ fontSize: nameSize }}>
          {(data.fullName ?? '').toUpperCase()}
        </div>

        {/* Member pill */}
        <div className="idc-front-pill">M E M B E R</div>

        {/* Details grid — 2 columns */}
        <div className="idc-front-details">
          {shouldShow(data.memberId) && (
            <div className="idc-front-detail">
              <div className="idc-front-detail-label">Member ID</div>
              <div className="idc-front-detail-value">{data.memberId}</div>
            </div>
          )}
          {shouldShow(data.dob) && (
            <div className="idc-front-detail">
              <div className="idc-front-detail-label">Date of Birth</div>
              <div className="idc-front-detail-value">{fmtDate(data.dob)}</div>
            </div>
          )}
          {shouldShow(data.district) && (
            <div className="idc-front-detail idc-front-detail-district">
              <div className="idc-front-detail-label">District</div>
              <div className="idc-front-detail-value">{data.district}</div>
            </div>
          )}
          {shouldShow(data.address) && (
            <div className="idc-front-detail-address">
              <div className="idc-front-detail-label">Address</div>
              <div className="idc-front-detail-value" style={{ textWrap: 'balance' }}>{data.address}</div>
            </div>
          )}
        </div>

        {/* Signature and validity row */}
        <div className="idc-front-sign-row">
          <div className="idc-front-sign-col">
            <div className="idc-front-sign-content">
              {assets.signature
                ? <img className="idc-front-sign-img" src={assets.signature} alt="Authorised signatory signature" crossOrigin="anonymous" />
                : <div className="idc-front-sign-blank" />}
            </div>
            <div className="idc-front-sign-line" />
            <div className="idc-front-sign-label">Authorised Signatory</div>
          </div>
          <div className="idc-front-sign-col">
            <div className="idc-front-sign-content idc-front-sign-content-right">
              {shouldShow(data.validUntil) && <div className="idc-front-sign-valid-value">{fmtCardDate(data.validUntil)}</div>}
            </div>
            <div className="idc-front-sign-line" />
            <div className="idc-front-sign-label idc-front-sign-label-right">Valid Till</div>
          </div>
        </div>
      </div>

      {/* ============ FOOTER BAR (fixed) ============ */}
      <ContactStrip contact={contact} />
    </div>
  );
});

export const CardBack = forwardRef<HTMLDivElement, Omit<FaceProps, 'qrDataUrl' | 'photoDataUrl'>>(function CardBack(
  { data, assets, contact }, ref,
) {
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!barcodeRef.current) return;
    JsBarcode(barcodeRef.current, data.memberId, {
      format: 'CODE128',
      width: 4,
      height: 60,
      displayValue: false,
      fontSize: 0,
      textAlign: 'center',
      margin: 10,
    });
  }, [data.memberId]);

  const teaDetails: [string, string][] = [
    ['Garden Name', data.gardenName?.toUpperCase() ?? ''],
    ['Tea Garden Area', fmtHa(Number(data.areaHa))],
    ['Garden Location', data.gardenLocation ?? ''],
    ['Plantation Year', String(data.plantationYear ?? '')],
    ['Tea Variety', data.teaVariety ?? ''],
    ['Organic Status', data.organicStatus ?? ''],
    ['Annual Production', data.annualProduction !== undefined ? String(data.annualProduction) : ''],
    ['Membership Year', data.membershipYear !== undefined ? String(data.membershipYear) : ''],
  ];

  return (
    <div className="idc idc-back" ref={ref}>
      {/* Decorative leaf — absolute only, behind content */}
      <div className="idc-decor">
        {assets.leaf ? <img className="idc-leaf-decor" src={assets.leaf} alt="" crossOrigin="anonymous" /> : null}
      </div>

      {/* ============ HEADER (max 280px) ============ */}
      <header className="idc-back-header">
        <div className="idc-back-short">{ASSOC.short}</div>
        <div className="idc-back-state">{ASSOC.stateLine}</div>
        <div className="idc-back-assoc">{ASSOC.name}</div>
        <div className="idc-back-reg">Regd No.: {ASSOC.reg}</div>
        <div className="idc-back-tagline">{ASSOC.tagline1} {ASSOC.tagline2}</div>
      </header>

      {/* ============ BODY (flex:1, justify-content: space-between) ============ */}
      <div className="idc-back-body">
        {/* Growers' Details — only fields with values */}
        <section className="idc-back-panel">
          <div className="idc-back-panel-title">
            <Leaf size={18} />
            <span>Growers' Details</span>
            <span className="rule" />
          </div>
          <div className="idc-back-panel-body">
            <div className="idc-back-grid">
              {teaDetails.filter(([, v]) => shouldShow(v)).map(([k, v]) => (
                <div key={k} className={`idc-back-detail-row ${shouldShow(data.gardenName) && k === 'Garden Name' ? 'idc-back-grid-full' : ''} ${shouldShow(data.gardenLocation) && k === 'Garden Location' ? 'idc-back-grid-full' : ''}`}>
                  <div className="idc-back-label">{k}</div>
                  <div className="idc-back-value">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Information — all 4 bullets */}
        <section className="idc-back-panel idc-back-info-panel">
          <div className="idc-back-panel-title">
            <Leaf size={18} />
            <span>Important Information</span>
            <span className="rule" />
          </div>
          <div className="idc-back-panel-body idc-back-info">
            {CARD_NOTES.map((n) => (
              <div className="idc-back-note" key={n}>
                <Leaf size={14} />
                <span>{n}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Barcode — centered horizontally above footer */}
      <div className="idc-back-barcode-row">
        <div className="idc-back-barcode-center">
          <canvas className="idc-back-barcode" ref={barcodeRef} />
          {shouldShow(data.memberId) && <div className="idc-back-barcode-label">{data.memberId}</div>}
        </div>
      </div>

      {/* ============ FOOTER BAR (fixed 64px) ============ */}
      <footer className="idc-back-foot">
        <div className="idc-back-foot-line1">{ASSOC.stateLine}</div>
        <div className="idc-back-foot-line2">{ASSOC.name}</div>
      </footer>
    </div>
  );
});