const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const TIMEOUT_MS = 12000;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1] && m[1].trim()) return decodeEntities(m[1]);
  }
  return null;
}

function getTitle(html: string): string | null {
  return (
    getMeta(html, "og:title") ??
    getMeta(html, "twitter:title") ??
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null)
  );
}

export function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function isVideoLink(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com.*\/videos\//i.test(url);
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("bad status");
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export interface LinkMeta {
  title: string | null;
  description: string | null;
  image: string | null;
  video: string | null;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export async function fetchImageBytes(url: string): Promise<{ data: Uint8Array<ArrayBuffer>; type: string } | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "image/*,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;
    return { data: new Uint8Array(buffer), type: contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchLinkMeta(url: string): Promise<LinkMeta> {
  const ytId = getYouTubeId(url);
  const fallbackImage = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  try {
    const html = await fetchHtml(url);
    return {
      title: getTitle(html) ?? new URL(url).hostname,
      description: getMeta(html, "og:description") ?? getMeta(html, "description"),
      image: getMeta(html, "og:image") ?? getMeta(html, "twitter:image") ?? fallbackImage,
      video: getMeta(html, "og:video:secure_url") ?? getMeta(html, "og:video") ?? null,
    };
  } catch {
    return { title: new URL(url).hostname, description: null, image: fallbackImage, video: null };
  }
}
