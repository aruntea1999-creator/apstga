// lib/idcard-export.ts
// Client-side export: PNG per side and a 2-page PDF at exact CR80 portrait size (54 x 85.6 mm).

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const PIXEL_RATIO = 3; // 540 px design width x 3 = 1620 px for 54 mm (about 760 dpi)

async function waitForImages(node: HTMLElement) {
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
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;
}

export async function nodeToPng(node: HTMLElement): Promise<string> {
  await waitForImages(node);
  // Run twice: the first call warms up fonts/images in some browsers.
  await toPng(node, { pixelRatio: 1, cacheBust: false });
  return toPng(node, { pixelRatio: PIXEL_RATIO, cacheBust: false, backgroundColor: '#ffffff' });
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
