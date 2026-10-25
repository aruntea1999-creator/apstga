// lib/idcard-export.ts
// Client-side export: PNG per side and a 2-page PDF at exact CR80 portrait size (54 x 85.6 mm).
// Renders the fixed 638 x 1011 px canvas at ~300 DPI. Waits for document.fonts.ready.

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useEffect, useState, RefObject } from 'react';

// 638 px CSS canvas at ~300 DPI => pixelRatio ~2.53 gives 1614 px output for 53.98mm
const PIXEL_RATIO = 2.53;

async function waitForFontsAndImages(node: HTMLElement) {
  if (document.fonts?.ready) await document.fonts.ready;
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error(`Image failed to load: ${img.src.slice(0, 80)}`));
          }),
    ),
  );
}

export async function nodeToPng(node: HTMLElement): Promise<string> {
  await waitForFontsAndImages(node);
  // Warm-up pass, then final high-DPI pass.
  await toPng(node, { pixelRatio: 1, cacheBust: false });
  return toPng(node, { pixelRatio: PIXEL_RATIO, cacheBust: false, backgroundColor: '#FAF7EF' });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function buildPdf(front: HTMLElement, back: HTMLElement): Promise<Blob> {
  const [f, b] = [await nodeToPng(front), await nodeToPng(back)];
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6], compress: true });
  pdf.addImage(f, 'PNG', 0, 0, 54, 85.6, undefined, 'FAST');
  pdf.addPage([54, 85.6], 'portrait');
  pdf.addImage(b, 'PNG', 0, 0, 54, 85.6, undefined, 'FAST');
  return pdf.output('blob');
}

// Auto-font-sizing hook for ID card text.
export function useAutoFit(ref: RefObject<HTMLDivElement | null>, base: number, min: number): number {
  const [fontSize, setFontSize] = useState(base);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const text = element.textContent || element.innerText || '';
    const len = (text || '').length;
    const computed = len <= 48 ? base : Math.max(min, Math.round((base * 48) / len));
    setFontSize(computed);
  }, [ref.current]);

  return fontSize;
}