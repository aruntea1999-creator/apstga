// lib/background-remover.ts
// Client-side photo background removal using @imgly/background-removal.
// Runs entirely in the browser (ONNX Runtime Web) — no API key required.
//
// Speed optimizations:
//   - Caches results per source URL so repeat processing is instant
//   - Preloads the ONNX model once on app init
//
// Usage:
//   await preloadBackgroundRemover();        // call once on app init
//   const dataUrl = await removeBackgroundFromUrl(imageUrl);
//   // dataUrl is a transparent PNG data URL ready for the ID card canvas.

import { preload, removeBackground } from '@imgly/background-removal';

let preloaded = false;
let preloadPromise: Promise<void> | null = null;

// Simple cache: source URL/data URL -> result data URL
const cache = new Map<string, string>();

/** Download the ONNX model files once. Call before any removal. */
export async function preloadBackgroundRemover(): Promise<void> {
  if (preloaded) return;
  if (preloadPromise) return preloadPromise;
  preloadPromise = preload({
    device: 'cpu',
    model: 'isnet_quint8', // smallest model, fastest download
    output: { format: 'image/png' },
  });
  try {
    await preloadPromise;
    preloaded = true;
  } catch (e) {
    preloaded = false;
    throw e;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** Remove the background from an image URL and return a transparent PNG data URL. */
export async function removeBackgroundFromUrl(imageUrl: string): Promise<string> {
  if (!preloaded) await preloadBackgroundRemover();
  if (cache.has(imageUrl)) return cache.get(imageUrl)!;

  const blob = await removeBackground(imageUrl, {
    device: 'cpu',
    model: 'isnet_quint8',
    output: { format: 'image/png' },
  });
  const result = await blobToDataUrl(blob);
  cache.set(imageUrl, result);
  return result;
}

/** Remove the background from a File / Blob (e.g. from an <input type="file">). */
export async function removeBackgroundFromFile(file: File): Promise<string> {
  if (!preloaded) await preloadBackgroundRemover();
  const key = file.name + file.size + file.lastModified;
  if (cache.has(key)) return cache.get(key)!;

  const blob = await removeBackground(file, {
    device: 'cpu',
    model: 'isnet_quint8',
    output: { format: 'image/png' },
  });
  const result = await blobToDataUrl(blob);
  cache.set(key, result);
  return result;
}

/** Remove the background from a data URL. */
export async function removeBackgroundFromDataUrl(dataUrl: string): Promise<string> {
  if (!preloaded) await preloadBackgroundRemover();
  if (cache.has(dataUrl)) return cache.get(dataUrl)!;

  const blob = await removeBackground(dataUrl, {
    device: 'cpu',
    model: 'isnet_quint8',
    output: { format: 'image/png' },
  });
  const result = await blobToDataUrl(blob);
  cache.set(dataUrl, result);
  return result;
}

/** Clear the result cache. Call this if you want to free memory. */
export function clearBackgroundCache(): void {
  cache.clear();
}
