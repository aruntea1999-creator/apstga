const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5000;

export function getCachedDashboard(url: string): unknown | undefined {
  const entry = cache.get(url);
  if (entry && entry.expiry > Date.now()) return entry.data;
  cache.delete(url);
  return undefined;
}

export function setCachedDashboard(url: string, data: unknown): void {
  cache.set(url, { data, expiry: Date.now() + CACHE_TTL });
}

export function clearDashboardCache(): void {
  cache.clear();
}