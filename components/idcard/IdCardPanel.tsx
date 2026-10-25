// components/idcard/IdCardPanel.tsx
// Drop-in replacement for the "Membership ID Card" section on /admin/growers/[id].
// Preview: front + back side by side at 0.5 scale (319 x 505.5px), stacked on narrow screens.
// Export: renders the unscaled 638 x 1011 canvas at 300 DPI.

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CardBack, CardFront } from './IdCard';
import {
  CardAssets, CardContact, DEFAULT_ASSETS, DEFAULT_CONTACT, GrowerCardData,
  makeQr, toDataUrl, validateGrower, verifyUrl,
} from '@/lib/idcard';
import { buildPdf, downloadDataUrl, nodeToPng } from '@/lib/idcard-export';
import { preloadBackgroundRemover, removeBackgroundFromDataUrl } from '@/lib/background-remover';

type Props = {
  grower: GrowerCardData;
  siteUrl: string;
  approved: boolean;
  assets?: CardAssets;
  contact?: CardContact;
  latestPdfUrl?: string | null;
  latestPdfName?: string | null;
  onGenerated?: (pdf: Blob, filename: string) => Promise<{ url: string; name: string } | void>;
};

const SCALE = 0.5;
const CANVAS_W = 638;
const CANVAS_H = 1011;

export default function IdCardPanel({
  grower, siteUrl, approved, assets = DEFAULT_ASSETS, contact = DEFAULT_CONTACT,
  latestPdfUrl, latestPdfName, onGenerated,
}: Props) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [latest, setLatest] = useState({ url: latestPdfUrl ?? null, name: latestPdfName ?? null });
  const [removeBg, setRemoveBg] = useState(false);
  const [bgModelStatus, setBgModelStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('loading');
  const [bgRemoving, setBgRemoving] = useState(false);

  const prepare = useCallback(async () => {
    const errs = validateGrower(grower);
    if (!approved) errs.unshift('Grower is not approved yet. Only approved growers can get an ID card');
    setErrors(errs);
    if (errs.length) { setQr(''); setPhoto(''); return false; }
    try {
      const [q, p] = await Promise.all([
        makeQr(verifyUrl(siteUrl, grower.memberId)),
        toDataUrl(grower.photoUrl as string),
      ]);
      let finalPhoto = p;
      if (removeBg) {
        try {
          setBgRemoving(true);
          finalPhoto = await removeBackgroundFromDataUrl(p);
        } catch {
          // fall back to original photo if background removal fails
        } finally {
          setBgRemoving(false);
        }
      }
      setQr(q); setPhoto(finalPhoto);
      return true;
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Could not load photo or QR']);
      return false;
    }
  }, [grower, siteUrl, approved, removeBg]);

  useEffect(() => {
    const t = setTimeout(() => void prepare(), 0);
    return () => clearTimeout(t);
  }, [prepare]);

  useEffect(() => {
    void preloadBackgroundRemover()
      .then(() => setBgModelStatus('ready'))
      .catch(() => setBgModelStatus('failed'));
  }, []);

  const ready = !!qr && !!photo && errors.length === 0;

  async function generate() {
    if (!ready || !frontRef.current || !backRef.current) return;
    setBusy(true); setMsg('');
    try {
      const pdf = await buildPdf(frontRef.current, backRef.current);
      const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const filename = `${grower.memberId}-${stamp}-CARD.pdf`;
      const saved = onGenerated ? await onGenerated(pdf, filename) : undefined;
      if (saved) setLatest(saved);
      setMsg('ID card generated');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Generation failed');
    } finally { setBusy(false); }
  }

  async function dlPng(side: 'front' | 'back') {
    const node = side === 'front' ? frontRef.current : backRef.current;
    if (!node) return;
    setBusy(true);
    try { downloadDataUrl(await nodeToPng(node), `${grower.memberId}-${side}.png`); }
    finally { setBusy(false); }
  }

  async function dlPdf() {
    if (!frontRef.current || !backRef.current) return;
    setBusy(true);
    try {
      const blob = await buildPdf(frontRef.current, backRef.current);
      downloadDataUrl(URL.createObjectURL(blob), `${grower.memberId}-CARD.pdf`);
    } finally { setBusy(false); }
  }

  const box = { width: CANVAS_W * SCALE, height: CANVAS_H * SCALE };
  const inner: React.CSSProperties = { transform: `scale(${SCALE})`, transformOrigin: 'top left' };

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Membership ID Card</h3>
          <p className="text-sm text-gray-500">{grower.memberId}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button disabled={!ready || busy || bgRemoving} onClick={generate} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Regenerate</button>
          <button disabled={!ready || busy || bgRemoving} onClick={generate} className="rounded-lg bg-green-800 px-3 py-1.5 text-sm text-white disabled:opacity-50">Generate ID Card</button>
          {bgRemoving && (
            <span className="flex items-center gap-1 text-xs text-green-800 font-medium">
              <span className="idc-spin-dot"></span> Removing background…
            </span>
          )}
          <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={(e) => setRemoveBg(e.target.checked)}
              disabled={busy || bgRemoving || bgModelStatus !== 'ready'}
              className="w-3 h-3 rounded border-gray-300 text-green-800 focus:ring-green-800"
            />
            {bgModelStatus === 'loading' ? 'Loading background remover…' : bgModelStatus === 'failed' ? 'Background remover unavailable' : 'Remove photo background'}
          </label>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="mb-1 font-medium">Cannot generate the card yet:</div>
          <ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {ready && (
        <div className="flex flex-wrap gap-32 justify-center">
          <div style={{ width: box.width, height: box.height }}>
            <div style={inner}>
              <CardFront ref={frontRef} data={grower} assets={assets} contact={contact} qrDataUrl={qr} photoDataUrl={photo} />
            </div>
          </div>
          <div style={{ width: box.width, height: box.height }}>
            <div style={inner}>
              <CardBack ref={backRef} data={grower} assets={assets} contact={contact} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-6">
        <button disabled={!ready || busy} onClick={dlPdf} className="rounded-lg bg-green-800 px-3 py-1.5 text-sm text-white disabled:opacity-50">Download PDF (Both Sides)</button>
        <button disabled={!ready || busy} onClick={() => dlPng('front')} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Front PNG</button>
        <button disabled={!ready || busy} onClick={() => dlPng('back')} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Back PNG</button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {latest.url && (
        <p className="mt-3 text-sm">
          <b>Latest:</b>{' '}
          <a className="text-green-800 underline" href={latest.url} target="_blank" rel="noreferrer">{latest.name ?? 'card.pdf'}</a>
        </p>
      )}
    </section>
  );
}
